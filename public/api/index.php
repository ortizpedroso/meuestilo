<?php
/**
 * Ag Salão - API REST (PHP + MySQL/PDO).
 * Roteador único: o .htaccess redireciona /api/* para este arquivo.
 */

require __DIR__ . '/db.php';
require __DIR__ . '/mailer.php';

ag_cors();

/** Fase 1: cria uma preference de checkout no Mercado Pago. Retorna init_point ou null. */
function ag_mp_create_preference(array $sub): ?string
{
    $token = ag_setting('mp_access_token', '');
    if (!$token || !function_exists('curl_init')) {
        return null; // sem credencial ou sem cURL -> fallback seguro
    }
    $base = rtrim((string) ag_setting('app_base_url', ''), '/');
    $payload = [
        'items' => [[
            'title' => 'Assinatura ' . ($sub['plan'] ?? 'Pro'),
            'quantity' => 1,
            'currency_id' => 'BRL',
            'unit_price' => (float) ($sub['price'] ?? 0),
        ]],
        'payer' => ['name' => $sub['holderName'] ?? '', 'email' => $sub['email'] ?? ''],
        'external_reference' => $sub['id'] ?? '',
        'back_urls' => $base ? [
            'success' => $base . '/?assinatura=sucesso',
            'failure' => $base . '/?assinatura=falha',
            'pending' => $base . '/?assinatura=pendente',
        ] : null,
        'notification_url' => $base ? ($base . '/api/mp/webhook') : null,
    ];
    $payload = array_filter($payload, fn($v) => $v !== null);

    $ch = curl_init('https://api.mercadopago.com/checkout/preferences');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . $token],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_TIMEOUT => 15,
    ]);
    $res = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res === false || $code >= 300) {
        return null; // falha na API -> fallback seguro
    }
    $data = json_decode($res, true);
    return $data['init_point'] ?? ($data['sandbox_init_point'] ?? null);
}

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '';
$pos = strpos($uri, '/api/');
$route = $pos !== false ? substr($uri, $pos + 5) : '';
$route = trim($route, '/');
$segments = $route === '' ? [] : explode('/', $route);
$resource = $segments[0] ?? '';
$id = isset($segments[1]) ? urldecode($segments[1]) : null;
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ---------- Serializers (linha do banco -> objeto do front) ----------
function map_service(array $r): array
{
    return [
        'id' => $r['id'],
        'name' => $r['name'],
        'description' => $r['description'] ?? '',
        'durationMinutes' => (int) $r['duration_minutes'],
        'price' => (float) $r['price'],
        'category' => $r['category'],
        'imageUrl' => $r['image_url'] ?? '',
        'popular' => (bool) $r['popular'],
    ];
}
function map_professional(array $r): array
{
    return [
        'id' => $r['id'],
        'name' => $r['name'],
        'role' => $r['role'] ?? '',
        'avatar' => $r['avatar'] ?? '',
        'bio' => $r['bio'] ?? '',
        'rating' => (float) $r['rating'],
        'specialties' => json_decode($r['specialties'] ?? '[]', true) ?: [],
        'workingDays' => json_decode($r['working_days'] ?? '[]', true) ?: [],
        'startTime' => $r['start_time'] ?? '08:00',
        'endTime' => $r['end_time'] ?? '19:00',
    ];
}
function map_appointment(array $r): array
{
    return [
        'id' => $r['id'],
        'code' => $r['code'],
        'serviceId' => $r['service_id'],
        'serviceName' => $r['service_name'],
        'servicePrice' => (float) $r['service_price'],
        'serviceDuration' => (int) $r['service_duration'],
        'professionalId' => $r['professional_id'],
        'professionalName' => $r['professional_name'],
        'date' => $r['date'],
        'time' => $r['time'],
        'clientName' => $r['client_name'],
        'clientPhone' => $r['client_phone'],
        'clientEmail' => $r['client_email'] ?? '',
        'notes' => $r['notes'] ?? '',
        'status' => $r['status'],
        'createdAt' => $r['created_at'] ?? '',
        'remindedAt' => $r['reminded_at'] ?? null,
    ];
}
function map_review(array $r): array
{
    return [
        'id' => $r['id'],
        'clientName' => $r['client_name'],
        'rating' => (int) $r['rating'],
        'comment' => $r['comment'] ?? '',
        'date' => $r['date'],
        'serviceName' => $r['service_name'] ?? '',
        'professionalName' => $r['professional_name'] ?? '',
        'verifiedBooking' => (bool) $r['verified_booking'],
    ];
}
function map_subscription(array $r): array
{
    return [
        'id' => $r['id'],
        'plan' => $r['plan'],
        'holderName' => $r['holder_name'],
        'email' => $r['email'],
        'phone' => $r['phone'] ?? '',
        'salonName' => $r['salon_name'] ?? '',
        'price' => (float) $r['price'],
        'status' => $r['status'],
        'provider' => $r['provider'] ?? '',
        'createdAt' => $r['created_at'] ?? '',
    ];
}

function get_settings(PDO $db): array
{
    $row = $db->query('SELECT data FROM settings WHERE id = 1')->fetch();
    if (!$row) {
        return [];
    }
    return json_decode($row['data'], true) ?: [];
}

// Clientes derivados dos agendamentos
function derive_customers(array $appointments): array
{
    $map = [];
    foreach ($appointments as $app) {
        $key = trim($app['clientPhone']) ?: (trim($app['clientEmail']) ?: trim($app['clientName']));
        if ($key === '') {
            continue;
        }
        if (!isset($map[$key])) {
            $map[$key] = [
                'id' => 'cust-' . (preg_replace('/\D/', '', $key) ?: substr(md5($key), 0, 8)),
                'name' => $app['clientName'],
                'phone' => $app['clientPhone'],
                'email' => $app['clientEmail'],
                'totalAppointments' => 0,
                'totalSpent' => 0.0,
                'lastVisit' => $app['date'],
            ];
        }
        $map[$key]['totalAppointments'] += 1;
        if ($app['status'] !== 'cancelled') {
            $map[$key]['totalSpent'] += (float) $app['servicePrice'];
        }
        if (empty($map[$key]['lastVisit']) || $app['date'] > $map[$key]['lastVisit']) {
            $map[$key]['lastVisit'] = $app['date'];
        }
    }
    return array_values($map);
}

$db = ag_db();

try {
    switch ($resource) {
        // ---------------- LOGIN ----------------
        case 'login': {
            if ($method !== 'POST') ag_json(['error' => 'Método não permitido.'], 405);
            $body = ag_body();
            $c = ag_config();
            if (($body['password'] ?? null) !== null && hash_equals((string) $c['admin_password'], (string) $body['password'])) {
                ag_json(['token' => ag_expected_token()]);
            }
            ag_json(['error' => 'Senha incorreta.'], 401);
            break;
        }

        // ---------------- BOOTSTRAP (carrega tudo público de uma vez) ----------------
        case 'bootstrap': {
            $services = array_map('map_service', $db->query('SELECT * FROM services ORDER BY sort_order, name')->fetchAll());
            $professionals = array_map('map_professional', $db->query('SELECT * FROM professionals ORDER BY sort_order, name')->fetchAll());
            $appointments = array_map('map_appointment', $db->query('SELECT * FROM appointments ORDER BY date DESC, time DESC')->fetchAll());
            $reviews = array_map('map_review', $db->query('SELECT * FROM reviews ORDER BY date DESC')->fetchAll());
            $settings = get_settings($db);
            ag_json([
                'services' => $services,
                'professionals' => $professionals,
                'appointments' => $appointments,
                'reviews' => $reviews,
                'settings' => $settings,
            ]);
            break;
        }

        // ---------------- SERVICES ----------------
        case 'services': {
            if ($method === 'GET') {
                ag_json(array_map('map_service', $db->query('SELECT * FROM services ORDER BY sort_order, name')->fetchAll()));
            }
            if ($method === 'PUT') { // bulk replace (admin)
                ag_require_admin();
                $items = ag_body();
                $db->beginTransaction();
                $db->exec('DELETE FROM services');
                $stmt = $db->prepare('INSERT INTO services (id,name,description,duration_minutes,price,category,image_url,popular,sort_order) VALUES (?,?,?,?,?,?,?,?,?)');
                $i = 0;
                foreach ($items as $s) {
                    $stmt->execute([
                        $s['id'] ?? ('srv-' . uniqid()),
                        $s['name'] ?? '',
                        $s['description'] ?? '',
                        (int) ($s['durationMinutes'] ?? 30),
                        (float) ($s['price'] ?? 0),
                        $s['category'] ?? 'Cabelo',
                        $s['imageUrl'] ?? '',
                        !empty($s['popular']) ? 1 : 0,
                        $i++,
                    ]);
                }
                $db->commit();
                ag_json(array_map('map_service', $db->query('SELECT * FROM services ORDER BY sort_order, name')->fetchAll()));
            }
            ag_json(['error' => 'Método não permitido.'], 405);
            break;
        }

        // ---------------- PROFESSIONALS ----------------
        case 'professionals': {
            if ($method === 'GET') {
                ag_json(array_map('map_professional', $db->query('SELECT * FROM professionals ORDER BY sort_order, name')->fetchAll()));
            }
            if ($method === 'PUT') { // bulk replace (admin)
                ag_require_admin();
                $items = ag_body();
                $db->beginTransaction();
                $db->exec('DELETE FROM professionals');
                $stmt = $db->prepare('INSERT INTO professionals (id,name,role,avatar,bio,rating,specialties,working_days,start_time,end_time,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
                $i = 0;
                foreach ($items as $p) {
                    $stmt->execute([
                        $p['id'] ?? ('prof-' . uniqid()),
                        $p['name'] ?? '',
                        $p['role'] ?? '',
                        $p['avatar'] ?? '',
                        $p['bio'] ?? '',
                        (float) ($p['rating'] ?? 5),
                        json_encode($p['specialties'] ?? [], JSON_UNESCAPED_UNICODE),
                        json_encode($p['workingDays'] ?? [], JSON_UNESCAPED_UNICODE),
                        $p['startTime'] ?? '08:00',
                        $p['endTime'] ?? '19:00',
                        $i++,
                    ]);
                }
                $db->commit();
                ag_json(array_map('map_professional', $db->query('SELECT * FROM professionals ORDER BY sort_order, name')->fetchAll()));
            }
            ag_json(['error' => 'Método não permitido.'], 405);
            break;
        }

        // ---------------- APPOINTMENTS ----------------
        case 'appointments': {
            if ($method === 'GET') { // admin
                ag_require_admin();
                ag_json(array_map('map_appointment', $db->query('SELECT * FROM appointments ORDER BY date DESC, time DESC')->fetchAll()));
            }
            if ($method === 'POST') { // criação pública (agendamento do cliente)
                $b = ag_body();
                if (empty($b['clientName']) || empty($b['clientPhone']) || empty($b['date']) || empty($b['time'])) {
                    ag_json(['error' => 'Dados do agendamento incompletos.'], 422);
                }
                $newId = 'app-' . (string) round(microtime(true) * 1000);
                $code = 'STILO-' . random_int(1000, 9999);
                $createdAt = gmdate('Y-m-d\TH:i:s\Z');
                $stmt = $db->prepare('INSERT INTO appointments (id,code,service_id,service_name,service_price,service_duration,professional_id,professional_name,date,time,client_name,client_phone,client_email,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
                $stmt->execute([
                    $newId, $code,
                    $b['serviceId'] ?? null, $b['serviceName'] ?? '', (float) ($b['servicePrice'] ?? 0), (int) ($b['serviceDuration'] ?? 30),
                    $b['professionalId'] ?? null, $b['professionalName'] ?? '',
                    $b['date'], $b['time'],
                    $b['clientName'], $b['clientPhone'], $b['clientEmail'] ?? '', $b['notes'] ?? '',
                    $b['status'] ?? 'confirmed', $createdAt,
                ]);
                $row = $db->query('SELECT * FROM appointments WHERE id = ' . $db->quote($newId))->fetch();
                $created = map_appointment($row);
                // Fase 2: e-mail de confirmação (não bloqueante)
                if (!empty($created['clientEmail'])) {
                    $settings = get_settings($db);
                    ag_send_mail(
                        $created['clientEmail'],
                        'Confirmação de Agendamento ' . $created['code'] . ' - ' . ($settings['name'] ?? ''),
                        ag_confirmation_email_html($created, $settings)
                    );
                }
                ag_json($created, 201);
            }
            if ($method === 'PUT') { // bulk replace (admin: concluir/cancelar/reagendar)
                ag_require_admin();
                $items = ag_body();
                $db->beginTransaction();
                $db->exec('DELETE FROM appointments');
                $stmt = $db->prepare('INSERT INTO appointments (id,code,service_id,service_name,service_price,service_duration,professional_id,professional_name,date,time,client_name,client_phone,client_email,notes,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
                foreach ($items as $a) {
                    $stmt->execute([
                        $a['id'] ?? ('app-' . uniqid()), $a['code'] ?? ('STILO-' . random_int(1000, 9999)),
                        $a['serviceId'] ?? null, $a['serviceName'] ?? '', (float) ($a['servicePrice'] ?? 0), (int) ($a['serviceDuration'] ?? 30),
                        $a['professionalId'] ?? null, $a['professionalName'] ?? '',
                        $a['date'] ?? '', $a['time'] ?? '',
                        $a['clientName'] ?? '', $a['clientPhone'] ?? '', $a['clientEmail'] ?? '', $a['notes'] ?? '',
                        $a['status'] ?? 'confirmed', $a['createdAt'] ?? gmdate('Y-m-d\TH:i:s\Z'),
                    ]);
                }
                $db->commit();
                ag_json(array_map('map_appointment', $db->query('SELECT * FROM appointments ORDER BY date DESC, time DESC')->fetchAll()));
            }
            ag_json(['error' => 'Método não permitido.'], 405);
            break;
        }

        // ---------------- REVIEWS ----------------
        case 'reviews': {
            if ($method === 'GET') {
                ag_json(array_map('map_review', $db->query('SELECT * FROM reviews ORDER BY date DESC')->fetchAll()));
            }
            if ($method === 'POST') { // pública
                $b = ag_body();
                if (empty($b['clientName']) || empty($b['comment'])) {
                    ag_json(['error' => 'Avaliação incompleta.'], 422);
                }
                $newId = 'rev-' . (string) round(microtime(true) * 1000);
                $date = $b['date'] ?? gmdate('Y-m-d');
                $stmt = $db->prepare('INSERT INTO reviews (id,client_name,rating,comment,date,service_name,professional_name,verified_booking) VALUES (?,?,?,?,?,?,?,?)');
                $stmt->execute([
                    $newId, $b['clientName'], (int) ($b['rating'] ?? 5), $b['comment'],
                    $date, $b['serviceName'] ?? '', $b['professionalName'] ?? '', !empty($b['verifiedBooking']) ? 1 : 0,
                ]);
                $row = $db->query('SELECT * FROM reviews WHERE id = ' . $db->quote($newId))->fetch();
                ag_json(map_review($row), 201);
            }
            ag_json(['error' => 'Método não permitido.'], 405);
            break;
        }

        // ---------------- SETTINGS ----------------
        case 'settings': {
            if ($method === 'GET') {
                ag_json(get_settings($db));
            }
            if ($method === 'PUT') { // admin
                ag_require_admin();
                $b = ag_body();
                $json = json_encode($b, JSON_UNESCAPED_UNICODE);
                $stmt = $db->prepare('INSERT INTO settings (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)');
                $stmt->execute([$json]);
                ag_json(get_settings($db));
            }
            ag_json(['error' => 'Método não permitido.'], 405);
            break;
        }

        // ---------------- CUSTOMERS (derivados, admin) ----------------
        case 'customers': {
            ag_require_admin();
            $appointments = array_map('map_appointment', $db->query('SELECT * FROM appointments')->fetchAll());
            ag_json(derive_customers($appointments));
            break;
        }

        // ---------------- SUBSCRIPTIONS (assinatura SaaS) ----------------
        case 'subscriptions': {
            if ($method === 'GET') { // admin
                ag_require_admin();
                ag_json(array_map('map_subscription', $db->query('SELECT * FROM subscriptions ORDER BY created_at DESC')->fetchAll()));
            }
            if ($method === 'POST') { // contratação pública
                $b = ag_body();
                if (empty($b['holderName']) || empty($b['email'])) {
                    ag_json(['error' => 'Informe nome e e-mail para contratar.'], 422);
                }
                $newId = 'sub-' . (string) round(microtime(true) * 1000);
                $createdAt = gmdate('Y-m-d\TH:i:s\Z');
                $stmt = $db->prepare('INSERT INTO subscriptions (id,plan,holder_name,email,phone,salon_name,price,status,provider,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)');
                $stmt->execute([
                    $newId, $b['plan'] ?? 'Pro', $b['holderName'], $b['email'], $b['phone'] ?? '',
                    $b['salonName'] ?? '', (float) ($b['price'] ?? 0), 'pending', null, $createdAt,
                ]);
                $row = $db->query('SELECT * FROM subscriptions WHERE id = ' . $db->quote($newId))->fetch();
                $sub = map_subscription($row);
                // Fase 1: cria a preference do Mercado Pago (se houver credencial); senão, fallback.
                $checkoutUrl = ag_mp_create_preference($sub);
                if ($checkoutUrl) {
                    $db->prepare('UPDATE subscriptions SET provider = ? WHERE id = ?')
                       ->execute(['mercadopago', $sub['id']]);
                }
                ag_json(['subscription' => $sub, 'checkoutUrl' => $checkoutUrl], 201);
            }
            ag_json(['error' => 'Método não permitido.'], 405);
            break;
        }

        // ---------------- MERCADO PAGO WEBHOOK (Fase 1) ----------------
        case 'mp': {
            // /api/mp/webhook
            if (($segments[1] ?? '') !== 'webhook') {
                ag_json(['error' => 'Recurso não encontrado.'], 404);
            }
            $token = ag_setting('mp_access_token', '');
            $body = ag_body();
            // Notificação pode vir por query (?type=payment&data.id=) ou body
            $paymentId = $_GET['data.id'] ?? ($_GET['id'] ?? ($body['data']['id'] ?? null));
            $type = $_GET['type'] ?? ($body['type'] ?? '');
            if ($token && $paymentId && function_exists('curl_init') && ($type === 'payment' || $type === '')) {
                $ch = curl_init('https://api.mercadopago.com/v1/payments/' . urlencode((string) $paymentId));
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $token],
                    CURLOPT_TIMEOUT => 15,
                ]);
                $res = curl_exec($ch);
                curl_close($ch);
                $pay = $res ? json_decode($res, true) : null;
                if ($pay && ($pay['status'] ?? '') === 'approved') {
                    $ref = $pay['external_reference'] ?? '';
                    if ($ref) {
                        $db->prepare('UPDATE subscriptions SET status = ? WHERE id = ?')
                           ->execute(['active', $ref]);
                    }
                }
            }
            ag_json(['received' => true]);
            break;
        }

        // ---------------- CRON: LEMBRETES (Fase 3) ----------------
        case 'cron': {
            if (($segments[1] ?? '') !== 'reminders') {
                ag_json(['error' => 'Recurso não encontrado.'], 404);
            }
            $key = $_GET['key'] ?? '';
            if (!hash_equals((string) ag_setting('cron_key', ''), (string) $key)) {
                ag_json(['error' => 'Chave inválida.'], 401);
            }
            // Amanhã (data do servidor)
            $tomorrow = gmdate('Y-m-d', strtotime('+1 day'));
            $stmt = $db->prepare("SELECT * FROM appointments WHERE date = ? AND status = 'confirmed' AND (reminded_at IS NULL OR reminded_at = '')");
            $stmt->execute([$tomorrow]);
            $rows = $stmt->fetchAll();
            $settings = get_settings($db);
            $sent = 0;
            $upd = $db->prepare('UPDATE appointments SET reminded_at = ? WHERE id = ?');
            foreach ($rows as $r) {
                $app = map_appointment($r);
                if (!empty($app['clientEmail'])) {
                    ag_send_mail(
                        $app['clientEmail'],
                        'Lembrete do seu horário amanhã - ' . ($settings['name'] ?? ''),
                        ag_reminder_email_html($app, $settings)
                    );
                }
                $upd->execute([gmdate('Y-m-d\TH:i:s\Z'), $app['id']]);
                $sent++;
            }
            ag_json(['date' => $tomorrow, 'processed' => $sent]);
            break;
        }

        case '':
            ag_json(['name' => 'Ag Salão API', 'status' => 'ok']);
            break;

        default:
            ag_json(['error' => 'Recurso não encontrado: ' . $resource], 404);
    }
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    ag_json(['error' => 'Erro interno na API.', 'detail' => $e->getMessage()], 500);
}
