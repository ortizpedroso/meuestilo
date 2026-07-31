<?php
/**
 * Ag Salão - Helpers de configuração, banco (PDO), CORS e respostas JSON.
 */

function ag_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $path = __DIR__ . '/config.php';
    if (!file_exists($path)) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'config.php ausente. Copie config.sample.php para config.php e preencha as credenciais.']);
        exit;
    }
    $config = require $path;
    return $config;
}

function ag_db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $c = ag_config();
    $dsn = "mysql:host={$c['db_host']};dbname={$c['db_name']};charset=" . ($c['db_charset'] ?? 'utf8mb4');
    try {
        $pdo = new PDO($dsn, $c['db_user'], $c['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        ag_json(['error' => 'Falha ao conectar ao banco de dados.'], 500);
    }
    return $pdo;
}

function ag_cors(): void
{
    $c = ag_config();
    $allowed = $c['allowed_origins'] ?? ['*'];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array('*', $allowed, true)) {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function ag_json($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ag_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Token de sessão do admin = hash(admin_password + auth_secret). */
function ag_expected_token(): string
{
    $c = ag_config();
    return hash('sha256', ($c['admin_password'] ?? '') . '|' . ($c['auth_secret'] ?? ''));
}

function ag_require_admin(): void
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!$header && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    }
    $token = '';
    if (preg_match('/Bearer\s+(.+)/i', $header, $m)) {
        $token = trim($m[1]);
    }
    if (!hash_equals(ag_expected_token(), $token)) {
        ag_json(['error' => 'Não autorizado.'], 401);
    }
}
