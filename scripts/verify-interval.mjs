import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:8080/ag_salao/';
const API = 'http://localhost:8080/ag_salao/api';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// login
const loginRes = await fetch(`${API}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'admin123' })
});
const { token } = await loginRes.json();

// current settings
const settings = await (await fetch(`${API}/bootstrap`)).json().then((d) => d.settings);

const setInterval = async (min) => {
  const next = { ...settings, workingHours: { ...settings.workingHours, slotIntervalMinutes: min } };
  const r = await fetch(`${API}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(next)
  });
  return r.ok;
};

const readSlots = async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome-stable',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await sleep(500);
  const click = (re) => page.evaluate((s) => {
    const rx = new RegExp(s, 'i');
    const el = [...document.querySelectorAll('button')].find((b) => rx.test(b.textContent || '') && !b.disabled);
    if (el) el.click();
  }, re);
  await click('Agendar Hor[aá]rio Agora'); await sleep(400);
  await click('Avançar'); await sleep(200);
  await click('Avançar'); await sleep(300);
  await page.evaluate(() => {
    const i = document.querySelector('input[type="date"]');
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    set.call(i, '2026-08-05');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    i.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(500);
  const slots = await page.evaluate(() =>
    [...document.querySelectorAll('button')]
      .map((b) => (b.textContent || '').trim())
      .filter((t) => /^\d{2}:\d{2}$/.test(t))
  );
  await browser.close();
  return slots;
};

console.log('== Intervalo 60 min ==');
await setInterval(60);
const s60 = await readSlots();
console.log('Primeiros horários:', s60.slice(0, 5).join(', '));

console.log('== Intervalo 30 min ==');
await setInterval(30);
const s30 = await readSlots();
console.log('Primeiros horários:', s30.slice(0, 6).join(', '));

const diff = (arr) => {
  const [h1, m1] = arr[0].split(':').map(Number);
  const [h2, m2] = arr[1].split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
};
const d60 = s60.length > 1 ? diff(s60) : null;
const d30 = s30.length > 1 ? diff(s30) : null;
console.log('Passo com interval=60:', d60, 'min | Passo com interval=30:', d30, 'min');
console.log('RESULTADO CH-03:', d60 === 60 && d30 === 30 ? 'PASSOU' : 'FALHOU');
