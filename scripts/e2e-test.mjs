import puppeteer from 'puppeteer-core';

const BASE = 'http://localhost:8080/ag_salao/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const clickByText = async (selector, re) => {
  return page.evaluate(
    (sel, reSrc) => {
      const rx = new RegExp(reSrc, 'i');
      const el = [...document.querySelectorAll(sel)].find((e) => rx.test(e.textContent || '') && !e.disabled);
      if (el) { el.click(); return true; }
      return false;
    },
    selector,
    re.source
  );
};

await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
await sleep(700);

const landing = await page.evaluate(() => /Seu Estilo Em Boas M/i.test(document.body.innerText));
console.log('1. Landing renderizou:', landing);

// ---- Fluxo de agendamento ----
await clickByText('button', /Agendar Hor[aá]rio Agora/);
await sleep(600);
console.log('2. Modal de agendamento abriu:', await page.evaluate(() => /Passo 1 de 4/i.test(document.body.innerText)));

await clickByText('button', /Avançar/); // passo 1 -> 2
await sleep(300);
await clickByText('button', /Avançar/); // passo 2 -> 3
await sleep(400);

// escolhe uma data futura (quarta-feira aberta)
await page.evaluate(() => {
  const input = document.querySelector('input[type="date"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, '2026-08-05');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
await sleep(500);

const slotClicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')].filter(
    (b) => /^\d{2}:\d{2}$/.test((b.textContent || '').trim()) && !b.disabled
  );
  if (btns.length) { btns[Math.min(4, btns.length - 1)].click(); return btns[Math.min(4, btns.length - 1)].textContent.trim(); }
  return null;
});
console.log('3. Horário selecionado:', slotClicked);
await sleep(300);
await clickByText('button', /Avançar/); // passo 3 -> 4
await sleep(400);

// preenche dados
await page.evaluate(() => {
  const set = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const inputs = document.querySelectorAll('form input');
  set(inputs[0], 'Maria E2E');
  set(inputs[1], '(11) 98888-7777');
  set(inputs[2], 'maria.e2e@example.com');
});
await sleep(200);
await clickByText('button', /Confirmar Agendamento/);
await sleep(1200);

const confirmation = await page.evaluate(() => {
  const m = document.body.innerText.match(/STILO-\d+/);
  return { ok: /Agendamento Realizado/i.test(document.body.innerText), code: m ? m[0] : null };
});
console.log('4. Agendamento confirmado:', confirmation.ok, '| Código:', confirmation.code);

// fecha modal
await clickByText('button', /Concluir/);
await sleep(500);

// ---- Login admin ----
await clickByText('button', /Admin/);
await sleep(500);
await page.evaluate(() => {
  const input = document.querySelector('input[type="password"]');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'admin123');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
await clickByText('button', /Entrar no Painel/);
await sleep(900);
const adminOpen = await page.evaluate(() => /Painel Gest[aã]o/i.test(document.body.innerText));
console.log('5. Painel admin abriu:', adminOpen);

const dash = await page.evaluate(() => document.body.innerText.match(/Agendamentos Hoje[\s\S]{0,40}/));
console.log('6. Dashboard visível:', !!dash);

console.log('---- ERROS DE PÁGINA:', errors.length, errors.slice(0, 3));
await browser.close();
console.log('RESULTADO:', landing && confirmation.ok && adminOpen && errors.length === 0 ? 'PASSOU' : 'FALHOU');
