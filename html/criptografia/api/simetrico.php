<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');


// =====================================================
// MANEJO DE PETICIONES OPTIONS
// =====================================================

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


// =====================================================
// VALIDAR MÉTODO HTTP
// =====================================================

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Utiliza POST.'
    ]);

    exit;
}


// =====================================================
// CONEXIÓN A LA BASE DE DATOS
// =====================================================

require_once '/var/www/criptografia/config/database.php';


// =====================================================
// OBTENER JSON
// =====================================================

$input = file_get_contents('php://input');

$data = json_decode($input, true);


// =====================================================
// VALIDAR JSON
// =====================================================

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'El cuerpo de la petición debe ser JSON válido.'
    ]);

    exit;
}


// =====================================================
// OBTENER ACCIÓN
// =====================================================

$accion = $data['accion'] ?? '';


// =====================================================
// GENERAR CLAVE
// =====================================================

if ($accion === 'generar_clave') {

    try {

        $clave = random_bytes(32);

        $claveBase64 = base64_encode($clave);

        echo json_encode([
            'success' => true,
            'accion' => 'generar_clave',
            'algoritmo' => 'AES-256-GCM',
            'clave' => $claveBase64
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'error' => 'No fue posible generar la clave.'
        ]);
    }

    exit;
}


// =====================================================
// CIFRAR
// =====================================================

if ($accion === 'cifrar') {

    if (!isset($data['mensaje'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El campo mensaje es obligatorio.'
        ]);

        exit;
    }

    if (!isset($data['clave'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El campo clave es obligatorio.'
        ]);

        exit;
    }

    $mensaje = $data['mensaje'];
    $claveBase64 = $data['clave'];

    if (!is_string($mensaje) || trim($mensaje) === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje no puede estar vacío.'
        ]);

        exit;
    }

    $clave = base64_decode($claveBase64, true);

    if ($clave === false || strlen($clave) !== 32) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'La clave no es válida para AES-256.'
        ]);

        exit;
    }

    try {

        // IV de 12 bytes recomendado para GCM
        $iv = random_bytes(12);

        $tag = '';

        $ciphertext = openssl_encrypt(
            $mensaje,
            'aes-256-gcm',
            $clave,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
            '',
            16
        );

        if ($ciphertext === false) {

            throw new Exception('Error al cifrar el mensaje.');
        }

        $ciphertextBase64 = base64_encode($ciphertext);
        $ivBase64 = base64_encode($iv);
        $tagBase64 = base64_encode($tag);


        // =============================================
        // GUARDAR EN MYSQL
        // =============================================

        $parametros = json_encode([
            'iv' => $ivBase64,
            'tag' => $tagBase64
        ]);

        $sql = "
            INSERT INTO operaciones
            (
                tipo_operacion,
                algoritmo,
                mensaje_entrada,
                resultado,
                parametros,
                estado
            )
            VALUES
            (
                :tipo,
                :algoritmo,
                :mensaje,
                :resultado,
                :parametros,
                :estado
            )
        ";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':tipo' => 'SIMETRICO',
            ':algoritmo' => 'AES-256-GCM',
            ':mensaje' => $mensaje,
            ':resultado' => $ciphertextBase64,
            ':parametros' => $parametros,
            ':estado' => 'EXITOSA'
        ]);

        $id = $pdo->lastInsertId();


        // =============================================
        // RESPUESTA
        // =============================================

        echo json_encode([
            'success' => true,
            'operacion_id' => (int)$id,
            'accion' => 'cifrar',
            'tipo' => 'SIMETRICO',
            'algoritmo' => 'AES-256-GCM',
            'resultado' => $ciphertextBase64,
            'iv' => $ivBase64,
            'tag' => $tagBase64
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'error' => 'No fue posible cifrar el mensaje.'
        ]);
    }

    exit;
}


// =====================================================
// DESCIFRAR
// =====================================================

if ($accion === 'descifrar') {

    $campos = [
        'mensaje',
        'clave',
        'iv',
        'tag'
    ];

    foreach ($campos as $campo) {

        if (!isset($data[$campo])) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'error' => "El campo $campo es obligatorio."
            ]);

            exit;
        }
    }

    $ciphertextBase64 = $data['mensaje'];
    $claveBase64 = $data['clave'];
    $ivBase64 = $data['iv'];
    $tagBase64 = $data['tag'];


    // =============================================
    // DECODIFICAR BASE64
    // =============================================

    $ciphertext = base64_decode($ciphertextBase64, true);
    $clave = base64_decode($claveBase64, true);
    $iv = base64_decode($ivBase64, true);
    $tag = base64_decode($tagBase64, true);


    // =============================================
    // VALIDAR DATOS
    // =============================================

    if ($ciphertext === false) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje cifrado no es Base64 válido.'
        ]);

        exit;
    }

    if ($clave === false || strlen($clave) !== 32) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'La clave no es válida para AES-256.'
        ]);

        exit;
    }

    if ($iv === false || strlen($iv) !== 12) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El IV no es válido.'
        ]);

        exit;
    }

    if ($tag === false || strlen($tag) !== 16) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El tag no es válido.'
        ]);

        exit;
    }


    // =============================================
    // DESCIFRAR
    // =============================================

    try {

        $mensaje = openssl_decrypt(
            $ciphertext,
            'aes-256-gcm',
            $clave,
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );


        if ($mensaje === false) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'error' => 'No fue posible descifrar el mensaje. La clave, IV, tag o datos pueden ser incorrectos.'
            ]);

            exit;
        }


        // =============================================
        // GUARDAR OPERACIÓN
        // =============================================

        $parametros = json_encode([
            'iv' => $ivBase64,
            'tag' => $tagBase64
        ]);

        $sql = "
            INSERT INTO operaciones
            (
                tipo_operacion,
                algoritmo,
                mensaje_entrada,
                resultado,
                parametros,
                estado
            )
            VALUES
            (
                :tipo,
                :algoritmo,
                :mensaje,
                :resultado,
                :parametros,
                :estado
            )
        ";

        $stmt = $pdo->prepare($sql);

        $stmt->execute([
            ':tipo' => 'SIMETRICO',
            ':algoritmo' => 'AES-256-GCM',
            ':mensaje' => $ciphertextBase64,
            ':resultado' => $mensaje,
            ':parametros' => $parametros,
            ':estado' => 'EXITOSA'
        ]);


        $id = $pdo->lastInsertId();


        // =============================================
        // RESPUESTA
        // =============================================

        echo json_encode([
            'success' => true,
            'operacion_id' => (int)$id,
            'accion' => 'descifrar',
            'tipo' => 'SIMETRICO',
            'algoritmo' => 'AES-256-GCM',
            'resultado' => $mensaje
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'error' => 'No fue posible descifrar el mensaje.'
        ]);
    }

    exit;
}


// =====================================================
// ACCIÓN NO VÁLIDA
// =====================================================

http_response_code(400);

echo json_encode([
    'success' => false,
    'error' => 'Acción no válida.',
    'acciones_permitidas' => [
        'generar_clave',
        'cifrar',
        'descifrar'
    ]
]);
