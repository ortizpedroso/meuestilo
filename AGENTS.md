# AGENTS.md

## Cursor Cloud specific instructions

### What this project is
"Ag Salão" (a.k.a. "Meu Stilo") — a Portuguese salon/barbershop booking & management app,
sold as a **white-label SaaS**. Two parts:
- Frontend: React 19 + TypeScript + Vite 6 + Tailwind CSS 4 (SPA). Package manager: **npm**.
- Backend: **PHP + MySQL** REST API in `public/api/` (plain PDO, no framework/composer),
  targeted at Hostinger shared hosting. Schema + seed in `database/schema.sql`.

Deploy target for **Meu Stilo (InoveSW)** is `public_html/meuestilo/` (Vite `base` is `/meuestilo/` via `npm run package:meuestilo`).
For generic white-label builds, default base is `/ag_salao/` (`npm run package`).
See `docs/DEPLOY_HOSTINGER.md` for the full deploy guide.

Data lives in MySQL (not localStorage). `customers` are **derived** from appointments
(`src/utils/customers.ts`), so there is no separate customers table.

### Running / building / linting (frontend)
Standard scripts in `package.json`:
- Lint / typecheck: `npm run lint` (`tsc --noEmit`).
- Production build: `npm run build` → outputs `dist/` (which equals the `ag_salao/` folder:
  `index.html`, `assets/`, `.htaccess`, and `api/` copied from `public/api/`).
- `npm run dev` runs Vite on port 3000 but, on its own, has **no API** — see below.

### Running the full stack locally (needed for real end-to-end testing)
The frontend calls the API at `import.meta.env.BASE_URL + 'api'` (i.e. `/ag_salao/api`).
`npm run dev` alone cannot serve the PHP API, so test against a PHP server instead:
- System deps (install once, NOT in the update script): `php-cli`, `php-mysql`, `mariadb-server`.
- Start DB: `sudo service mariadb start`; create DB `ag_salao` + user and load `database/schema.sql`.
- Create `public/api/config.php` (gitignored) from `config.sample.php` with the local DB creds
  and an `admin_password`.
- Build, then serve `dist` under an `ag_salao/` docroot with the dev router (php has no .htaccess):
  `ln -s "$PWD/dist" /tmp/webroot/ag_salao && php -S 0.0.0.0:8080 -t /tmp/webroot scripts/php-dev-router.php`
- App: `http://localhost:8080/ag_salao/` · API: `.../ag_salao/api/bootstrap`.
- Quick automated check: `node scripts/e2e-test.mjs` (Puppeteer; uses `puppeteer-core` + system Chrome).
  Admin password in local config is `admin123`.

### Non-obvious caveats
- After changing `public/api/*.php` you must re-run `npm run build` (or edit `dist/api/…`) — the PHP
  is served from `dist/`/the docroot copy, not from `public/` when serving the built app.
- Admin auth: `POST /api/login` returns a token = `sha256(admin_password|auth_secret)`; the frontend
  sends it as `Authorization: Bearer` and stores it in `localStorage` under `ag_salao_admin_token`.
  Only this token is kept in localStorage; all real data is in MySQL.
- White-label theme: the accent color (`settings.themeColor`) is applied at runtime by overriding the
  Tailwind v4 `--color-amber-*` CSS variables (`src/utils/theme.ts`). Most accents in the UI use the
  `amber` palette, so changing this recolors the whole app.
- Admin writes for services/professionals/appointments use **bulk replace** (`PUT` replaces the whole
  table). Public booking uses `POST /api/appointments` (append). Fine for a single-salon MVP.
- The Vite build prints a harmless PostCSS `@import` (Google Fonts) warning; it does not fail the build.
- Mercado Pago integrado: Checkout Pro (`POST /api/subscriptions`) e Checkout Transparente com cartão
  (`POST /api/orders`). Sem credenciais, a assinatura fica `pending` (fallback seguro). Configure
  `mp_access_token`, `mp_public_key`, `mp_webhook_secret` e `app_base_url` em `config.php`.
- Login admin tem rate limiting (`login_rate_limit_max` / `login_rate_limit_window` em `config.php`).
- Para desenvolvimento local, use `allowed_origins => ['*']` ou inclua `http://localhost:8080` no array.
- Checklist de go-live: `docs/PRODUCAO.md`.
