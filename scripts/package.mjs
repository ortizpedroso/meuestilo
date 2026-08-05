/**
 * Empacota o app para deploy na Hostinger (subpasta do public_html).
 *
 * - Roda o build de produção (Vite) com base configurável.
 * - Copia o dist para build-deploy/<pasta>/ e REMOVE o config.php local.
 * - Valida os arquivos essenciais e gera o zip.
 *
 * Uso:
 *   npm run package                              → base /ag_salao/
 *   VITE_BASE=/meuestilo/ npm run package        → base /meuestilo/
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const base = process.env.VITE_BASE || '/ag_salao/';
const folder = base.replace(/^\/|\/$/g, '') || 'ag_salao';
const distDir = path.join(root, 'dist');
const outDir = path.join(root, 'build-deploy');
const appDir = path.join(outDir, folder);
const zipPath = path.join(outDir, `${folder}.zip`);

function log(msg) {
  console.log(`[package] ${msg}`);
}
function fail(msg) {
  console.error(`[package] ERRO: ${msg}`);
  process.exit(1);
}

log(`Base do build: ${base} (pasta: ${folder})`);
log('Gerando build de produção (vite build)...');
execSync('npm run build', { stdio: 'inherit', env: { ...process.env, VITE_BASE: base } });

if (!fs.existsSync(distDir)) fail('dist/ não foi gerado.');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(appDir, { recursive: true });
fs.cpSync(distDir, appDir, { recursive: true });

const localConfig = path.join(appDir, 'api', 'config.php');
if (fs.existsSync(localConfig)) {
  fs.rmSync(localConfig);
  log('Removido api/config.php do pacote (segurança).');
}

const required = ['index.html', 'assets', '.htaccess', 'robots.txt', 'api/index.php', 'api/db.php', 'api/security.php', 'api/.htaccess', 'api/config.sample.php', 'api/data/.htaccess'];
for (const rel of required) {
  if (!fs.existsSync(path.join(appDir, rel))) fail(`arquivo essencial ausente no pacote: ${rel}`);
}
if (fs.existsSync(localConfig)) fail('config.php não deveria estar no pacote.');

const assetsDir = path.join(appDir, 'assets');
const jsAssets = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
if (jsAssets.length === 0) fail('nenhum asset .js encontrado — build inválido.');
const biggestJs = Math.max(...jsAssets.map((f) => fs.statSync(path.join(assetsDir, f)).size));
if (biggestJs < 1024) fail('asset .js muito pequeno — build provavelmente falhou.');
const indexHtml = fs.readFileSync(path.join(appDir, 'index.html'), 'utf8');
if (!indexHtml.includes(base)) fail(`index.html não referencia a base ${base} — verifique o vite.config.`);
log(`Validação de arquivos: OK (base ${base}; sem config.php).`);

try {
  execSync(`cd "${outDir}" && zip -qr "${folder}.zip" "${folder}"`, { stdio: 'inherit' });
  const kb = (fs.statSync(zipPath).size / 1024).toFixed(0);
  log(`Pacote criado: ${path.relative(root, zipPath)} (${kb} KB)`);
} catch {
  log(`zip indisponível — use a pasta build-deploy/${folder}/ diretamente.`);
}

log(`Pronto! Extraia o zip em public_html/ (gera public_html/${folder}/) e crie o`);
log('api/config.php a partir do config.sample.php. Depois importe database/schema.sql no phpMyAdmin.');
