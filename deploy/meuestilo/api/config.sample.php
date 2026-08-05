<?php
/**
 * Ag Salão (Meu Stilo) — Configuração do backend.
 *
 * DEPLOY Hostinger (inovesw.com.br/meuestilo):
 * 1. No servidor: copie ESTE arquivo para "config.php" na mesma pasta (api/).
 *    O PHP só lê config.php — config.sample.php sozinho NÃO funciona.
 * 2. Preencha db_pass com a senha do MySQL do hPanel.
 * 3. Caminho no servidor: public_html/meuestilo/api/config.php
 *
 * IMPORTANTE: nunca comite o config.php com credenciais no Git.
 */

return [
    // Credenciais do banco MySQL (hPanel > Bancos de Dados MySQL)
    'db_host' => 'localhost',
    'db_name' => 'u970180508_meuestilo',
    'db_user' => 'u970180508_meuestilo',
    'db_pass' => 'SUA_SENHA_DO_HPANEL',  // ← preencha com a senha do banco no hPanel
    'db_charset' => 'utf8mb4',

    // Senha do painel administrativo (área Admin no site)
    'admin_password' => 'AdminMeuStilo2026!',

    // Segredo para assinar o token de sessão do admin (não altere após ir ao ar)
    'auth_secret' => 'k8mP2xQ9vL4nR7wJ3hF6tY1bN5cA0sD8eG2hK4m',

    // CORS — domínios que podem chamar a API
    'allowed_origins' => [
        'https://inovesw.com.br',
        'https://www.inovesw.com.br',
    ],

    // ---------- Fase 1: Mercado Pago (opcional) ----------
    'mp_access_token' => '',
    'mp_public_key' => '',
    'app_base_url' => 'https://inovesw.com.br/meuestilo',
    'mp_webhook_secret' => '',

    // Rate limit do login admin
    'login_rate_limit_max' => 5,
    'login_rate_limit_window' => 900,
    'trust_proxy_headers' => false,

    // ---------- Fase 2: E-mail (opcional) ----------
    'mail_enabled' => false,
    'mail_from' => 'no-reply@inovesw.com.br',
    'mail_from_name' => 'Meu Stilo',
    'mail_log' => '',

    // ---------- Fase 3: Lembretes cron (opcional) ----------
    'cron_key' => 'cron-meuestilo-2026-inovesw',

    'debug' => false,
];
