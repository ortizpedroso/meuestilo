<?php
/**
 * Ag Salão - Configuração do backend.
 *
 * COPIE este arquivo para "config.php" (no servidor) e preencha com os dados
 * reais do seu banco MySQL criado no hPanel da Hostinger.
 *
 * IMPORTANTE: nunca comite o config.php com credenciais reais.
 */

return [
    // Credenciais do banco MySQL (hPanel > Bancos de Dados MySQL)
    'db_host' => 'localhost',
    'db_name' => 'SEU_BANCO',
    'db_user' => 'SEU_USUARIO',
    'db_pass' => 'SUA_SENHA',
    'db_charset' => 'utf8mb4',

    // Senha do painel administrativo (área do dono do salão)
    'admin_password' => 'troque-esta-senha',

    // Segredo usado para assinar o token de sessão do admin.
    // Gere uma string aleatória longa e única.
    'auth_secret' => 'troque-por-uma-string-aleatoria-longa',

    // Domínios liberados para chamar a API (CORS).
    // Em produção, restrinja ao seu domínio: ['https://seudominio.com']
    'allowed_origins' => ['https://seudominio.com'],

    // ---------- Fase 1: Mercado Pago ----------
    // Access Token do Mercado Pago (backend). Sem ele, a contratação apenas registra
    // a assinatura como "pending" (fallback). Pode vir da env MP_ACCESS_TOKEN.
    'mp_access_token' => '',
    // Public Key do Mercado Pago (frontend, MercadoPago.js). Pode vir da env MP_PUBLIC_KEY.
    'mp_public_key' => '',
    // URL base pública do app (para back_urls/webhook do MP). Ex.: https://seudominio.com/ag_salao
    'app_base_url' => '',
    // Secret do webhook (painel MP → Suas integrações → Webhooks). Valida header x-signature.
    'mp_webhook_secret' => '',

    // Rate limit do login admin (tentativas / janela em segundos)
    'login_rate_limit_max' => 5,
    'login_rate_limit_window' => 900,

    // ---------- Fase 2: E-mail ----------
    'mail_enabled' => false,               // liga o envio real via mail() do PHP
    'mail_from' => 'no-reply@seudominio.com',
    'mail_from_name' => 'Ag Salão',
    // Caminho de arquivo para registrar os e-mails gerados (auditoria/teste). Vazio = desativado.
    'mail_log' => '',

    // ---------- Fase 3: Lembretes (cron) ----------
    // Chave secreta exigida no endpoint /api/cron/reminders?key=...
    'cron_key' => 'troque-esta-chave-do-cron',

    // Depuração: se true, respostas de erro 500 incluem detalhes (NÃO usar em produção).
    'debug' => false,
];
