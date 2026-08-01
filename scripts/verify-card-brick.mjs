import puppeteer from 'puppeteer-core';
const BASE = 'http://localhost:8080/ag_salao/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome-stable', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 1000 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE, { waitUntil: 'networkidle0' });
await sleep(600);

// bootstrap expõe mpPublicKey?
const hasKey = await page.evaluate(async () => {
  const r = await fetch('api/bootstrap').then((x) => x.json());
  return !!r.mpPublicKey;
});
console.log('bootstrap mpPublicKey presente:', hasKey);

await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Contratar Assinatura/i.test(x.textContent || '')); if (b) b.click(); });
await sleep(500);
await page.evaluate(() => {
  const set = (el, v) => { const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
  const inputs = document.querySelectorAll('form input');
  set(inputs[0], 'Fernanda Silva'); // nome
  set(inputs[2], 'test_user_5191100721469171788@testuser.com'); // email (input[2] = e-mail)
});
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Continuar para pagamento/i.test(x.textContent || '')); if (b) b.click(); });

// espera o brick montar
let mounted = false;
for (let i = 0; i < 20; i++) {
  await sleep(1000);
  mounted = await page.evaluate(() => {
    const c = document.getElementById('ag-card-brick');
    return !!(window.MercadoPago && c && c.children.length > 0);
  });
  if (mounted) break;
}
const sdk = await page.evaluate(() => !!window.MercadoPago);
console.log('SDK MercadoPago carregado:', sdk);
console.log('Brick de cartão montado (container com conteúdo):', mounted);
const stepText = await page.evaluate(() => /Pagamento — |pagamento no site/i.test(document.body.innerText));
console.log('Passo de pagamento visível:', stepText);
await page.screenshot({ path: '/opt/cursor/artifacts/ag_salao_checkout_transparente.png' });
console.log('pageerrors:', errors.length, errors.slice(0, 2));
console.log('RESULTADO:', hasKey && sdk && mounted && stepText ? 'PASSOU' : 'PARCIAL/FALHOU');
await browser.close();
