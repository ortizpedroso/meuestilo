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

    // Domínios liberados para chamar a API (CORS). Use ['*'] para liberar geral
    // ou informe seu domínio, ex: ['https://seudominio.com'].
    'allowed_origins' => ['*'],
];
