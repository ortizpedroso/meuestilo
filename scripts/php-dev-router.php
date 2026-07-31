<?php
/**
 * Router para o servidor embutido do PHP (apenas para testes locais).
 * Emula o comportamento dos .htaccess (API + fallback SPA) já que o
 * `php -S` não lê arquivos .htaccess.
 *
 * Uso:
 *   php -S 0.0.0.0:8080 -t <docroot> scripts/php-dev-router.php
 * onde <docroot> contém a subpasta ag_salao (o build do Vite).
 */

$root = rtrim($_SERVER['DOCUMENT_ROOT'], '/');
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

// 1) API: qualquer coisa com /api/ vai para o index.php da API
$apiPos = strpos($uri, '/api/');
if ($apiPos !== false || preg_match('#/api$#', $uri)) {
    $prefix = $apiPos !== false ? substr($uri, 0, $apiPos) : preg_replace('#/api$#', '', $uri);
    $apiIndex = $root . $prefix . '/api/index.php';
    if (is_file($apiIndex)) {
        require $apiIndex;
        return true;
    }
}

// 2) Arquivos estáticos existentes são servidos diretamente
$path = realpath($root . $uri);
if ($path && is_file($path)) {
    return false;
}

// 3) Fallback SPA: serve o index.html da subpasta (ex: /ag_salao/index.html)
$seg = explode('/', trim($uri, '/'))[0] ?? '';
$candidates = [
    $root . '/' . $seg . '/index.html',
    $root . '/index.html',
];
foreach ($candidates as $html) {
    if (is_file($html)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($html);
        return true;
    }
}

http_response_code(404);
echo 'Not Found';
return true;
