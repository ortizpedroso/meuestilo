import puppeteer from 'puppeteer-core';
const BASE = 'http://localhost:8080/ag_salao/';
const API = 'http://localhost:8080/ag_salao/api';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// cria um agendamento conhecido
const resp = await fetch(`${API}/appointments`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ serviceId: 'srv-1', serviceName: 'Corte', servicePrice: 45, serviceDuration: 30, professionalId: 'prof-3', professionalName: 'Lucas', date: '2026-08-12', time: '16:00', clientName: 'UI Teste', clientPhone: '11944443333', clientEmail: 'ui@x.com', status: 'confirmed' })
});
const appt = await resp.json();
console.log('Agendamento criado:', appt.code);

const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome-stable', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
page.on('dialog', (d) => d.accept()); // aceita o confirm de cancelamento
await page.goto(BASE, { waitUntil: 'networkidle0' });
await sleep(500);

await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /Consultar \/ Cancelar Agendamento/i.test(x.textContent || ''));
  if (b) b.click();
});
await sleep(400);
await page.evaluate((code, phone) => {
  const set = (el, v) => { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  const inputs = document.querySelectorAll('input');
  set(inputs[0], code); set(inputs[1], phone);
}, appt.code, '11944443333');
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Consultar/i.test(x.textContent || '') && !/Cancelar/i.test(x.textContent||'')); if (b) b.click(); });
await sleep(900);
const afterLookup = await page.evaluate(() => document.body.innerText.includes('UI Teste') && /Confirmado/i.test(document.body.innerText));
console.log('Consulta mostrou o agendamento (Confirmado):', afterLookup);

await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === 'Cancelar Agendamento'); if (b) b.click(); });
await sleep(1000);
const afterCancel = await page.evaluate(() => /Agendamento cancelado/i.test(document.body.innerText));
console.log('Após cancelar, mostra "Agendamento cancelado":', afterCancel);

console.log('RESULTADO IMP-03 UI:', afterLookup && afterCancel ? 'PASSOU' : 'FALHOU');
await browser.close();
