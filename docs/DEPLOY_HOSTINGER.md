# Deploy na Hostinger — App em `public_html/ag_salao/`

Guia para publicar o sistema **Ag Salão** numa subpasta do `public_html`, sem afetar o site que já está na raiz (InoveSW — `https://www.inovesw.com.br/`). Stack: **React (estático) + API PHP + MySQL**.

## Visão geral da estrutura publicada

```
public_html/
├── (InoveSW na raiz — intocado)
└── ag_salao/
    ├── index.html          ← build do React
    ├── assets/             ← JS/CSS do build
    ├── .htaccess           ← fallback SPA
    └── api/                ← backend PHP
        ├── index.php       ← roteador REST
        ├── db.php
        ├── config.php      ← VOCÊ cria no servidor (credenciais reais)
        └── .htaccess
```

O banco MySQL **não** é uma pasta: ele é criado no hPanel e o `api/config.php` guarda as credenciais de conexão.

---

## Passo 1 — Criar o banco de dados (hPanel)

1. hPanel → **Bancos de Dados MySQL**.
2. Crie um banco (ex.: `uXXXX_agsalao`), um usuário e uma senha. Anote tudo.
3. Associe o usuário ao banco com **todos os privilégios**.
4. Abra o **phpMyAdmin** desse banco → aba **Importar** → envie o arquivo
   [`database/schema.sql`](../database/schema.sql) deste repositório e execute.
   Isso cria as tabelas e os dados iniciais (serviços, profissionais, avaliações, configurações).

> O `schema.sql` fica só no seu computador/repositório — **não** faça upload dele para dentro do `public_html`.

## Passo 2 — Gerar o pacote de deploy

Na sua máquina, na raiz do projeto:

```bash
npm install
npm run package
```

Isso gera `build-deploy/ag_salao.zip` (e a pasta `build-deploy/ag_salao/`) já com
`index.html`, `assets/`, `.htaccess` e `api/`, **sem** o `config.php` local (por segurança —
as credenciais nunca vão no pacote). O `base` do Vite já é `/ag_salao/`.

> Alternativa manual: `npm run build` gera `dist/`. Se usar o `dist/` diretamente, **não** envie
> o `dist/api/config.php` (ele pode conter credenciais locais) — crie o `config.php` no servidor.

## Passo 3 — Enviar os arquivos para a Hostinger

No Gerenciador de Arquivos, crie a pasta `public_html/ag_salao/`, envie o `ag_salao.zip` e
**extraia** ali (ou envie o conteúdo de `build-deploy/ag_salao/` via FTP). Ao final você deve ter
`public_html/ag_salao/index.html`, `.../assets/…` e `.../api/…`.

## Passo 4 — Configurar a API no servidor

1. Dentro de `public_html/ag_salao/api/`, copie `config.sample.php` para `config.php`.
2. Edite o `config.php` com os dados do Passo 1:

```php
return [
    'db_host' => 'localhost',
    'db_name' => 'uXXXX_agsalao',
    'db_user' => 'uXXXX_agsalao',
    'db_pass' => 'SUA_SENHA',
    'db_charset' => 'utf8mb4',
    'admin_password' => 'uma-senha-forte-do-painel',
    'auth_secret' => 'uma-string-aleatoria-bem-longa',
    'allowed_origins' => ['https://www.inovesw.com.br', 'https://inovesw.com.br'],

    // Fase 1 - Mercado Pago (opcional; sem credenciais, a contratação fica "pending")
    'mp_access_token' => 'SEU_ACCESS_TOKEN_MP',   // backend (Checkout Pro e Transparente)
    'mp_public_key' => 'SUA_PUBLIC_KEY_MP',        // frontend (MercadoPago.js / Checkout Transparente)
    'mp_webhook_secret' => 'SEU_WEBHOOK_SECRET',   // valida x-signature do webhook
    'app_base_url' => 'https://www.inovesw.com.br/ag_salao',

    // Fase 2 - E-mail de confirmação
    'mail_enabled' => true,
    'mail_from' => 'no-reply@seudominio.com',
    'mail_from_name' => 'Nome do Salão',
    'mail_log' => '',

    // Fase 3 - Lembretes (cron)
    'cron_key' => 'uma-chave-secreta-para-o-cron',
];
```

## Passo 5 — Testar

- Acesse `https://www.inovesw.com.br/ag_salao/` → a landing deve carregar.
- Faça um agendamento de teste (deve gerar um código STILO-xxxx).
- Acesse **Admin** no topo, entre com a `admin_password` do `config.php` e confira o painel.
- Em **Marca (White-label)**, personalize nome, logo, contatos e a cor de destaque.

Ative o **SSL grátis** no hPanel para o site rodar em `https`.

> Checklist completo de go-live: [`docs/PRODUCAO.md`](PRODUCAO.md).

---

## Deploy via GitHub (alternativa)

A Hostinger só faz `git pull` — ela **não roda `npm run build`** no plano compartilhado.
Então, para usar Git, escolha uma opção:

- **Commit do build:** rode `npm run build` e comite a pasta `dist/` (não recomendado como padrão).
- **GitHub Actions:** um workflow builda e envia por FTP só para `public_html/ag_salao/`.
  (Podemos configurar isso depois, se desejar.)

Para começar, o **upload de arquivos** (Passos 2–4) é o caminho mais simples e rápido.

---

## Fases avançadas (opcionais)

### Fase 1 — Mercado Pago
Dois modos disponíveis:
- Checkout Pro (redirect): `POST /api/subscriptions` cria a *preference* e retorna `checkoutUrl`
  (o frontend redireciona). Precisa de `mp_access_token`.
- Checkout Transparente (pagamento no site): `POST /api/orders` processa o cartão via Orders API;
  a aprovação ativa a assinatura. Precisa de `mp_access_token` (backend) e `mp_public_key` (frontend).
- Webhook `POST /api/mp/webhook` marca a assinatura como `active` — configure essa URL no painel do MP.
- Sem credenciais, a contratação registra a assinatura como `pending` (fallback seguro).

> Teste em sandbox (cartão): use um usuário de teste COMPRADOR como pagador (e-mail `...@testuser.com`)
> e cartões de teste do MP. Nos nossos testes, o cartão Visa de teste aprovou; o pagador precisa ter
> nome + CPF preenchidos. Detalhes em `specs/meu-stilo.md` (Fase 1).

### Fase 2 — E-mail de confirmação
- Defina `mail_enabled => true` e `mail_from`/`mail_from_name`. Na Hostinger o envio usa `mail()` do PHP.
- O envio é **não-bloqueante**: se falhar, o agendamento é concluído mesmo assim.
- Para auditar o conteúdo gerado, defina `mail_log` para um caminho de arquivo (fora do `public_html`).

### Fase 3 — Lembretes automáticos (Cron)
- Defina uma `cron_key` no `config.php`.
- No hPanel → **Cron Jobs**, agende (ex.: diariamente às 09h) o comando:
  ```
  curl -s "https://seudominio.com/ag_salao/api/cron/reminders?key=SUA_CRON_KEY"
  ```
- O endpoint envia lembrete por e-mail dos agendamentos `confirmed` do dia seguinte e marca
  `reminded_at` (idempotente — não reenvia).

---

## Checklist de ativação (pendências do proprietário)

Resumo do que o dono do salão precisa providenciar para ligar as fases avançadas
(guardado aqui como referência):

1. **Token do Mercado Pago (`MP_ACCESS_TOKEN`)** — credencial externa.
   - Obter em https://www.mercadopago.com.br/developers → "Suas integrações" → sua aplicação → "Credenciais".
   - Existe token de **teste** (sandbox) e de **produção**. Comece pelo de teste.
   - Colocar em `config.php` (`mp_access_token`) ou como secret/env `MP_ACCESS_TOKEN`.
   - Sem token: a contratação apenas registra a assinatura como "pending" (fallback).

2. **E-mail remetente** — não é uma senha/token, é só um endereço do seu domínio.
   - Criar/usar um e-mail no hPanel (ex.: `nao-responda@seudominio.com`).
   - Em `config.php`: `mail_enabled => true` e `mail_from`. Na Hostinger o envio usa `mail()` do PHP.

3. **Chave do Cron (`cron_key`) + Cron Job** — a chave você inventa; o Cron você agenda.
   - `cron_key`: uma senha qualquer criada por você, para proteger o endpoint de lembretes.
   - No hPanel → **Cron Jobs**, agendar (ex.: diário) o comando:
     `curl -s "https://seudominio.com/ag_salao/api/cron/reminders?key=SUA_CRON_KEY"`

## Rodando localmente (desenvolvimento)

Requer PHP e MySQL/MariaDB locais.

```bash
# 1) Banco
mysql -e "CREATE DATABASE ag_salao CHARACTER SET utf8mb4;"
mysql ag_salao < database/schema.sql

# 2) Config local (a partir do modelo)
cp public/api/config.sample.php public/api/config.php     # depois edite as credenciais locais

# 3) Build + servir com o backend PHP
npm run build
ln -s "$PWD/dist" /tmp/webroot/ag_salao   # docroot com a subpasta
php -S 0.0.0.0:8080 -t /tmp/webroot scripts/php-dev-router.php

# App: http://localhost:8080/ag_salao/   | API: http://localhost:8080/ag_salao/api/bootstrap
```
