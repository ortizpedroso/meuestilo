/**
 * Teste de fumaça contra a instância publicada na Hostinger.
 *
 * Uso:
 *   HOSTINGER_BASE_URL=https://www.inovesw.com.br/ag_salao node scripts/hostinger-smoke.mjs
 *   HOSTINGER_ADMIN_PASSWORD=sua-senha node scripts/hostinger-smoke.mjs
 */
const BASE = (process.env.HOSTINGER_BASE_URL || 'https://inovesw.com.br/meuestilo').replace(/\/$/, '');
const ADMIN_PASS = process.env.HOSTINGER_ADMIN_PASSWORD || '';

const tests = [];
function ok(name, pass, detail = '') {
  tests.push({ name, pass, detail });
  console.log(`${pass ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function fetchJson(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { res, data };
}

console.log(`\n🔍 Smoke test Hostinger: ${BASE}\n`);

// 1. Landing HTML
try {
  const res = await fetch(`${BASE}/`);
  const html = await res.text();
  ok('Landing HTTP 200', res.status === 200, `status ${res.status}`);
  ok('Landing referencia /ag_salao/', html.includes('/ag_salao/'));
  ok('Landing tem root React', html.includes('id="root"'));
} catch (e) {
  ok('Landing acessível', false, e.message);
}

// 2. API bootstrap
try {
  const { res, data } = await fetchJson('/api/bootstrap');
  ok('API bootstrap HTTP 200', res.status === 200, `status ${res.status}`);
  if (res.status === 200 && typeof data === 'object') {
    ok('Bootstrap retorna services', Array.isArray(data.services) && data.services.length > 0, `${data.services?.length || 0} serviços`);
    ok('Bootstrap retorna settings', !!data.settings?.name, data.settings?.name);
  } else if (res.status === 500) {
    ok('config.php configurado', false, typeof data === 'object' ? data.error : 'erro 500');
  }
} catch (e) {
  ok('API bootstrap', false, e.message);
}

// 3. robots.txt
try {
  const res = await fetch(`${BASE}/robots.txt`);
  ok('robots.txt', res.status === 200);
} catch (e) {
  ok('robots.txt', false, e.message);
}

// 4. config.php não exposto
try {
  const res = await fetch(`${BASE}/api/config.php`);
  ok('config.php bloqueado', res.status === 403 || res.status === 404, `status ${res.status}`);
} catch (e) {
  ok('config.php bloqueado', false, e.message);
}

// 5. Login admin (opcional)
if (ADMIN_PASS) {
  try {
    const { res, data } = await fetchJson('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: ADMIN_PASS }),
    });
    ok('Login admin', res.status === 200 && !!data.token);
  } catch (e) {
    ok('Login admin', false, e.message);
  }
} else {
  console.log('⏭️  Login admin — defina HOSTINGER_ADMIN_PASSWORD para testar');
}

// 6. Agendamento público (dry-run validation)
try {
  const { res, data } = await fetchJson('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      serviceId: 'srv-1',
      serviceName: 'Teste Smoke',
      servicePrice: 1,
      serviceDuration: 30,
      professionalId: 'prof-1',
      professionalName: 'Teste',
      date: '2099-12-31',
      time: '23:30',
      clientName: 'Smoke Test',
      clientPhone: '11999990000',
      clientEmail: 'smoke@test.local',
      status: 'confirmed',
    }),
  });
  if (res.status === 201) {
    ok('POST agendamento', true, `código ${data.code}`);
    // cancela o teste
    if (data.code) {
      await fetchJson('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: data.code, phone: '11999990000' }),
      });
    }
  } else {
    ok('POST agendamento', false, `status ${res.status}: ${JSON.stringify(data).slice(0, 120)}`);
  }
} catch (e) {
  ok('POST agendamento', false, e.message);
}

const failed = tests.filter((t) => !t.pass);
console.log(`\n${failed.length === 0 ? '✅ Todos os testes passaram!' : `❌ ${failed.length} teste(s) falharam`}\n`);
process.exit(failed.length === 0 ? 0 : 1);
