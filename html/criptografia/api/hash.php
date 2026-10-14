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
// OBTENER JSON RECIBIDO
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
// VALIDAR MENSAJE
// =====================================================

if (!isset($data['mensaje'])) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'El campo mensaje es obligatorio.'
    ]);

    exit;
}

$mensaje = $data['mensaje'];

if (!is_string($mensaje) || trim($mensaje) === '') {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'El mensaje no puede estar vacío.'
    ]);

    exit;
}


// =====================================================
// VALIDAR ALGORITMO
// =====================================================

if (!isset($data['algoritmo'])) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'El campo algoritmo es obligatorio.'
    ]);

    exit;
}

$algoritmo = strtoupper(trim($data['algoritmo']));


// =====================================================
// ALGORITMOS PERMITIDOS
// =====================================================

$algoritmosPermitidos = [
    'MD5' => 'md5',
    'SHA-1' => 'sha1',
    'SHA-256' => 'sha256'
];


// =====================================================
// COMPROBAR ALGORITMO
// =====================================================

if (!array_key_exists($algoritmo, $algoritmosPermitidos)) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'error' => 'Algoritmo no permitido.',
        'algoritmos_permitidos' => [
            'MD5',
            'SHA-1',
            'SHA-256'
        ]
    ]);

    exit;
}


// =====================================================
// CALCULAR HASH
// =====================================================

$funcionHash = $algoritmosPermitidos[$algoritmo];

$hash = hash($funcionHash, $mensaje);


// =====================================================
// GUARDAR OPERACIÓN EN MYSQL
// =====================================================

try {

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
        ':tipo' => 'HASH',
        ':algoritmo' => $algoritmo,
        ':mensaje' => $mensaje,
        ':resultado' => $hash,
        ':parametros' => json_encode([]),
        ':estado' => 'EXITOSA'
    ]);

    $id = $pdo->lastInsertId();


// =====================================================
// RESPUESTA
// =====================================================

    http_response_code(200);

    echo json_encode([
        'success' => true,
        'operacion_id' => (int)$id,
        'tipo' => 'HASH',
        'algoritmo' => $algoritmo,
        'mensaje' => $mensaje,
        'resultado' => $hash
    ], JSON_UNESCAPED_UNICODE);


} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'No fue posible guardar la operación.'
    ]);

}
