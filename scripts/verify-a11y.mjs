import puppeteer from 'puppeteer-core';
const BASE = 'http://localhost:8080/ag_salao/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome-stable', headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();
await page.goto(BASE, { waitUntil: 'networkidle0' });
await sleep(500);

const headerLabels = await page.evaluate(() =>
  [...document.querySelectorAll('header button[aria-label]')].map((b) => b.getAttribute('aria-label'))
);
console.log('Header aria-labels:', headerLabels.join(' | '));

// abre agendamento e checa botão fechar
await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((x) => /Agendar Hor[aá]rio Agora/i.test(x.textContent || ''));
  if (b) b.click();
});
await sleep(500);
const closeLabel = await page.evaluate(() => {
  const b = document.querySelector('button[aria-label="Fechar"]');
  return b ? 'presente' : 'ausente';
});
console.log('Botão fechar (modal) aria-label:', closeLabel);

const htmlLang = await page.evaluate(() => document.documentElement.lang);
const title = await page.evaluate(() => document.title);
console.log('lang:', htmlLang, '| title:', title);

const ok = headerLabels.length >= 3 && closeLabel === 'presente' && htmlLang === 'pt-BR';
console.log('RESULTADO A11Y/SEO:', ok ? 'PASSOU' : 'FALHOU');
await browser.close();
