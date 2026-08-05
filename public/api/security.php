<?php
/**
 * Helpers de segurança: rate limiting e validação de webhook do Mercado Pago.
 */

/** IP do cliente (considera proxy reverso comum). */
function ag_client_ip(): string
{
    foreach (['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        $val = $_SERVER[$key] ?? '';
        if ($val) {
            $ip = trim(explode(',', $val)[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }
    }
    return '0.0.0.0';
}

/** Rate limit por chave (ex.: login). Retorna segundos até liberar ou 0 se OK. */
function ag_rate_limit_check(string $key, int $maxAttempts = 5, int $windowSeconds = 900): int
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . '/rl_' . hash('sha256', $key) . '.json';
    $now = time();
    $data = ['attempts' => [], 'blocked_until' => 0];
    if (is_file($file)) {
        $raw = @file_get_contents($file);
        $decoded = $raw ? json_decode($raw, true) : null;
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }
    if (($data['blocked_until'] ?? 0) > $now) {
        return (int) $data['blocked_until'] - $now;
    }
    $attempts = array_values(array_filter(
        $data['attempts'] ?? [],
        fn($t) => ($now - (int) $t) < $windowSeconds
    ));
    if (count($attempts) >= $maxAttempts) {
        $data['blocked_until'] = $now + $windowSeconds;
        $data['attempts'] = $attempts;
        @file_put_contents($file, json_encode($data), LOCK_EX);
        return $windowSeconds;
    }
    return 0;
}

function ag_rate_limit_hit(string $key, int $windowSeconds = 900): void
{
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . '/rl_' . hash('sha256', $key) . '.json';
    $now = time();
    $data = ['attempts' => [], 'blocked_until' => 0];
    if (is_file($file)) {
        $raw = @file_get_contents($file);
        $decoded = $raw ? json_decode($raw, true) : null;
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }
    $attempts = array_values(array_filter(
        $data['attempts'] ?? [],
        fn($t) => ($now - (int) $t) < $windowSeconds
    ));
    $attempts[] = $now;
    $data['attempts'] = $attempts;
    @file_put_contents($file, json_encode($data), LOCK_EX);
}

function ag_rate_limit_clear(string $key): void
{
    $file = __DIR__ . '/data/rl_' . hash('sha256', $key) . '.json';
    if (is_file($file)) {
        @unlink($file);
    }
}

/**
 * Valida assinatura do webhook Mercado Pago (header x-signature).
 * Retorna true se válido ou se não houver secret configurado (modo legado).
 */
function ag_mp_verify_webhook_signature(): bool
{
    $secret = (string) ag_setting('mp_webhook_secret', '');
    if ($secret === '') {
        return true; // fallback: sem secret, mantém compatibilidade (configure em produção)
    }
    $sigHeader = $_SERVER['HTTP_X_SIGNATURE'] ?? '';
    $requestId = $_SERVER['HTTP_X_REQUEST_ID'] ?? '';
    if (!$sigHeader || !$requestId) {
        return false;
    }
    $ts = null;
    $hash = null;
    foreach (explode(',', $sigHeader) as $part) {
        $kv = explode('=', trim($part), 2);
        if (count($kv) === 2) {
            if ($kv[0] === 'ts') {
                $ts = $kv[1];
            }
            if ($kv[0] === 'v1') {
                $hash = $kv[1];
            }
        }
    }
    if (!$ts || !$hash) {
        return false;
    }
    // Rejeita timestamps muito antigos (> 5 min)
    if (abs(time() - (int) $ts) > 300) {
        return false;
    }
    $dataId = $_GET['data.id'] ?? ($_GET['id'] ?? '');
    $manifest = "id:{$dataId};request-id:{$requestId};ts:{$ts};";
    $expected = hash_hmac('sha256', $manifest, $secret);
    return hash_equals($expected, $hash);
}
