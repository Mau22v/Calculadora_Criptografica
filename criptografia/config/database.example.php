<?php

// Configuración de ejemplo.
// Copia este archivo como database.php y coloca tus credenciales locales.

$host = 'localhost';
$dbname = 'criptografia';
$username = 'USUARIO_MYSQL';
$password = 'TU_CONTRASENA';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión con la base de datos'
    ]);

    exit;
}