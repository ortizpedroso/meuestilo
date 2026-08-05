/**
 * Empacota o app para deploy na Hostinger em public_html/ag_salao/.
 *
 * - Roda o build de produção (Vite).
 * - Copia o dist para build-deploy/ag_salao/ e REMOVE o config.php local
 *   (com credenciais) do artefato — só o config.sample.php vai no pacote.
 * - Valida os arquivos essenciais.
 * - Gera build-deploy/ag_salao.zip pronto para enviar/extrair.
 *
 * Uso: npm run package
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const outDir = path.join(root, 'build-deploy');
const appDir = path.join(outDir, 'ag_salao');
const zipPath = path.join(outDir, 'ag_salao.zip');

function log(msg) {
  console.log(`[package] ${msg}`);
}
function fail(msg) {
  console.error(`[package] ERRO: ${msg}`);
  process.exit(1);
}

log('Gerando build de produção (vite build)...');
execSync('npm run build', { stdio: 'inherit' });

if (!fs.existsSync(distDir)) fail('dist/ não foi gerado.');

// Prepara pasta limpa build-deploy/ag_salao
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(appDir, { recursive: true });
fs.cpSync(distDir, appDir, { recursive: true });

// SEGURANÇA: nunca empacotar o config.php local (credenciais)
const localConfig = path.join(appDir, 'api', 'config.php');
if (fs.existsSync(localConfig)) {
  fs.rmSync(localConfig);
  log('Removido api/config.php do pacote (segurança).');
}

// Validações essenciais
const required = ['index.html', 'assets', '.htaccess', 'robots.txt', 'api/index.php', 'api/db.php', 'api/security.php', 'api/.htaccess', 'api/config.sample.php', 'api/data/.htaccess'];
for (const rel of required) {
  if (!fs.existsSync(path.join(appDir, rel))) fail(`arquivo essencial ausente no pacote: ${rel}`);
}
if (fs.existsSync(localConfig)) fail('config.php não deveria estar no pacote.');

// Valida o build: assets JS presentes e não vazios, e base /ag_salao/ no index.html
const assetsDir = path.join(appDir, 'assets');
const jsAssets = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
if (jsAssets.length === 0) fail('nenhum asset .js encontrado — build inválido.');
const biggestJs = Math.max(...jsAssets.map((f) => fs.statSync(path.join(assetsDir, f)).size));
if (biggestJs < 1024) fail('asset .js muito pequeno — build provavelmente falhou.');
const indexHtml = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');
if (!indexHtml.includes('/ag_salao/')) fail('index.html não referencia a base /ag_salao/ — verifique o vite.config.');
log('Validação de arquivos: OK (sem config.php; config.sample.php presente; assets e base /ag_salao/ conferidos).');

// Gera o zip (a pasta ag_salao dentro do zip)
try {
  execSync(`cd "${outDir}" && zip -qr ag_salao.zip ag_salao`, { stdio: 'inherit' });
  const kb = (fs.statSync(zipPath).size / 1024).toFixed(0);
  log(`Pacote criado: ${path.relative(root, zipPath)} (${kb} KB)`);
} catch {
  log('zip indisponível — use a pasta build-deploy/ag_salao/ diretamente.');
}

log('Pronto! Extraia o zip em public_html/ (gera public_html/ag_salao/) e crie o');
log('api/config.php a partir do config.sample.php. Depois importe database/schema.sql no phpMyAdmin.');
