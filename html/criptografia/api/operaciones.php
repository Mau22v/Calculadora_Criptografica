<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido. Utiliza GET.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

require_once '/var/www/criptografia/config/database.php';

try {

    $sql = "
        SELECT
            id,
            tipo_operacion,
            algoritmo,
            mensaje_entrada,
            resultado,
            parametros,
            estado,
            fecha
        FROM operaciones
        ORDER BY id DESC
    ";

    $stmt = $pdo->query($sql);

    $operaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'total' => count($operaciones),
        'operaciones' => $operaciones
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'No fue posible consultar el historial de operaciones.'
    ], JSON_UNESCAPED_UNICODE);
}
