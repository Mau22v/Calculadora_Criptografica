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
// GENERAR PAR DE CLAVES RSA-2048
// =====================================================

if ($accion === 'generar_claves') {

    try {

        $configuracion = [
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA
        ];

        $recursoClaves = openssl_pkey_new($configuracion);

        if ($recursoClaves === false) {
            throw new Exception('No fue posible generar las claves RSA.');
        }


        // =============================================
        // OBTENER CLAVE PRIVADA
        // =============================================

        $clavePrivada = '';

        if (!openssl_pkey_export($recursoClaves, $clavePrivada)) {
            throw new Exception('No fue posible exportar la clave privada.');
        }


        // =============================================
        // OBTENER CLAVE PÚBLICA
        // =============================================

        $detalles = openssl_pkey_get_details($recursoClaves);

        if ($detalles === false || !isset($detalles['key'])) {
            throw new Exception('No fue posible obtener la clave pública.');
        }

        $clavePublica = $detalles['key'];


        // =============================================
        // RESPUESTA
        // =============================================

        echo json_encode([
            'success' => true,
            'accion' => 'generar_claves',
            'algoritmo' => 'RSA-2048',
            'clave_publica' => $clavePublica,
            'clave_privada' => $clavePrivada
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'error' => 'No fue posible generar el par de claves RSA.'
        ]);
    }

    exit;
}


// =====================================================
// CIFRAR CON CLAVE PÚBLICA
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

    if (!isset($data['clave_publica'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El campo clave_publica es obligatorio.'
        ]);

        exit;
    }


    $mensaje = $data['mensaje'];
    $clavePublica = $data['clave_publica'];


    if (!is_string($mensaje) || trim($mensaje) === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje no puede estar vacío.'
        ]);

        exit;
    }


    if (!is_string($clavePublica) || trim($clavePublica) === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'La clave pública no puede estar vacía.'
        ]);

        exit;
    }


    try {

        // =============================================
        // VALIDAR CLAVE PÚBLICA
        // =============================================

        $clavePublicaRecurso = openssl_pkey_get_public($clavePublica);

        if ($clavePublicaRecurso === false) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'error' => 'La clave pública no es válida.'
            ]);

            exit;
        }


        // =============================================
        // CIFRAR
        // =============================================

        $cifrado = '';

        $resultado = openssl_public_encrypt(
            $mensaje,
            $cifrado,
            $clavePublicaRecurso,
            OPENSSL_PKCS1_OAEP_PADDING
        );


        if (!$resultado) {

            throw new Exception('No fue posible cifrar el mensaje.');
        }


        // =============================================
        // CONVERTIR A BASE64
        // =============================================

        $cifradoBase64 = base64_encode($cifrado);


        // =============================================
        // GUARDAR EN MYSQL
        // =============================================

        $parametros = json_encode([
            'padding' => 'OAEP'
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
            ':tipo' => 'ASIMETRICO',
            ':algoritmo' => 'RSA-2048',
            ':mensaje' => $mensaje,
            ':resultado' => $cifradoBase64,
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
            'tipo' => 'ASIMETRICO',
            'algoritmo' => 'RSA-2048',
            'resultado' => $cifradoBase64
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
// DESCIFRAR CON CLAVE PRIVADA
// =====================================================

if ($accion === 'descifrar') {

    if (!isset($data['mensaje'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El campo mensaje es obligatorio.'
        ]);

        exit;
    }

    if (!isset($data['clave_privada'])) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El campo clave_privada es obligatorio.'
        ]);

        exit;
    }


    $mensajeCifradoBase64 = $data['mensaje'];
    $clavePrivada = $data['clave_privada'];


    if (!is_string($mensajeCifradoBase64) || trim($mensajeCifradoBase64) === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje cifrado no puede estar vacío.'
        ]);

        exit;
    }


    if (!is_string($clavePrivada) || trim($clavePrivada) === '') {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'La clave privada no puede estar vacía.'
        ]);

        exit;
    }




    // =============================================
    // DECODIFICAR BASE64
    // =============================================

    $mensajeCifrado = base64_decode(
        $mensajeCifradoBase64,
        true
    );


    if ($mensajeCifrado === false) {

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje cifrado no es Base64 válido.'
        ]);

        exit;
    }


    try {

        // =============================================
        // VALIDAR CLAVE PRIVADA
        // =============================================

        $clavePrivadaRecurso = openssl_pkey_get_private(
            $clavePrivada
        );


        if ($clavePrivadaRecurso === false) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'error' => 'La clave privada no es válida.'
            ]);

            exit;
        }


        // =============================================
        // DESCIFRAR
        // =============================================

        $mensajeOriginal = '';

        $resultado = openssl_private_decrypt(
            $mensajeCifrado,
            $mensajeOriginal,
            $clavePrivadaRecurso,
            OPENSSL_PKCS1_OAEP_PADDING
        );


        if (!$resultado) {

            http_response_code(400);

            echo json_encode([
                'success' => false,
                'error' => 'No fue posible descifrar el mensaje. La clave privada puede ser incorrecta o los datos fueron modificados.'
            ]);

            exit;
        }


        // =============================================
        // GUARDAR EN MYSQL
        // =============================================

        $parametros = json_encode([
            'padding' => 'OAEP'
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
            ':tipo' => 'ASIMETRICO',
            ':algoritmo' => 'RSA-2048',
            ':mensaje' => $mensajeCifradoBase64,
            ':resultado' => $mensajeOriginal,
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
            'tipo' => 'ASIMETRICO',
            'algoritmo' => 'RSA-2048',
            'resultado' => $mensajeOriginal
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


/*
|--------------------------------------------------------------------------
| FIRMAR MENSAJE CON CLAVE PRIVADA RSA
|--------------------------------------------------------------------------
*/

if ($accion === 'firmar') {

    $mensaje = $data['mensaje'] ?? '';
    $clavePrivada = $data['clave_privada'] ?? '';

    if (
        !is_string($mensaje) ||
        trim($mensaje) === '' ||
        !is_string($clavePrivada) ||
        trim($clavePrivada) === ''
    ) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje y la clave privada son obligatorios.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    try {

        // Validar la clave privada de Alicia.
        $clavePrivadaRecurso = openssl_pkey_get_private($clavePrivada);

        if ($clavePrivadaRecurso === false) {
            throw new Exception('La clave privada no es válida.');
        }

        // Generar la firma digital usando SHA-256.
        $firma = '';

        $resultado = openssl_sign(
            $mensaje,
            $firma,
            $clavePrivadaRecurso,
            OPENSSL_ALGO_SHA256
        );

        if (!$resultado) {
            throw new Exception('No fue posible generar la firma digital.');
        }

        // Convertir la firma a Base64 para enviarla en JSON.
        $firmaBase64 = base64_encode($firma);

        // Registrar la operación en MySQL.
        $parametros = json_encode([
            'algoritmo_firma' => 'RSA-SHA256'
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
            ':tipo' => 'Firma Digital',
            ':algoritmo' => 'RSA-SHA256',
            ':mensaje' => $mensaje,
            ':resultado' => $firmaBase64,
            ':parametros' => $parametros,
            ':estado' => 'EXITOSA'
        ]);

        $id = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'operacion_id' => (int) $id,
            'accion' => 'firmar',
            'algoritmo' => 'RSA-SHA256',
            'firma' => $firmaBase64
        ], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Throwable $e) {
    error_log('Error al firmar mensaje: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Error al firmar: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    exit;
}
}


/*
|--------------------------------------------------------------------------
| VERIFICAR FIRMA DIGITAL CON CLAVE PÚBLICA
|--------------------------------------------------------------------------
*/

if ($accion === 'verificar_firma') {

    $mensaje = $data['mensaje'] ?? '';
    $firmaBase64 = $data['firma'] ?? '';
    $clavePublica = $data['clave_publica'] ?? '';

    if (
        !is_string($mensaje) ||
        $mensaje === '' ||
        !is_string($firmaBase64) ||
        $firmaBase64 === '' ||
        !is_string($clavePublica) ||
        trim($clavePublica) === ''
    ) {
        http_response_code(400);

        echo json_encode([
            'success' => false,
            'error' => 'El mensaje, la firma y la clave pública son obligatorios.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    try {

        // Validar la clave pública de Alicia.
        $clavePublicaRecurso = openssl_pkey_get_public($clavePublica);

        if ($clavePublicaRecurso === false) {
            throw new Exception('La clave pública no es válida.');
        }

        // Decodificar la firma recibida.
        $firma = base64_decode($firmaBase64, true);

        if ($firma === false) {
            throw new Exception('La firma no tiene un formato Base64 válido.');
        }

        // Verificar la firma usando la clave pública de Alicia.
        $resultado = openssl_verify(
            $mensaje,
            $firma,
            $clavePublicaRecurso,
            OPENSSL_ALGO_SHA256
        );

        if ($resultado === -1) {
            throw new Exception('OpenSSL no pudo verificar la firma.');
        }

        $firmaValida = ($resultado === 1);

        // Registrar el resultado de la verificación en MySQL.
        $parametros = json_encode([
            'algoritmo_firma' => 'RSA-SHA256',
            'firma_valida' => $firmaValida
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
            ':tipo' => 'VERIFICACION DE FIRMA',
            ':algoritmo' => 'RSA-SHA256',
            ':mensaje' => $mensaje,
            ':resultado' => $firmaValida
                ? 'FIRMA VALIDA'
                : 'FIRMA INVALIDA',
            ':parametros' => $parametros,
            ':estado' => 'EXITOSA'
        ]);

        $id = $pdo->lastInsertId();

        echo json_encode([
            'success' => true,
            'operacion_id' => (int) $id,
            'accion' => 'verificar_firma',
            'algoritmo' => 'RSA-SHA256',
            'valida' => $firmaValida,
            'mensaje' => $firmaValida
                ? 'Firma válida: el mensaje coincide con la firma.'
                : 'Firma inválida: el mensaje fue modificado o la firma no corresponde.'
        ], JSON_UNESCAPED_UNICODE);

    } catch (Exception $e) {

        http_response_code(500);

        echo json_encode([
            'success' => false,
            'error' => 'No fue posible verificar la firma digital.'
        ], JSON_UNESCAPED_UNICODE);
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
        'generar_claves',
        'cifrar',
        'descifrar',
        'firmar',
        'verificar_firma'
    ]
]);
