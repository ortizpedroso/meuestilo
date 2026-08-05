# Deploy na Hostinger — App em `public_html/meuestilo/`

Guia para publicar o **Meu Stilo** na Hostinger (InoveSW — `https://inovesw.com.br/meuestilo/`).

## Visão geral da estrutura publicada

```
public_html/
├── (InoveSW na raiz — intocado)
└── meuestilo/
    ├── index.html          ← build do React (npm run package:meuestilo)
    ├── assets/             ← JS/CSS do build
    ├── .htaccess
    └── api/
        ├── index.php
        ├── config.php      ← copie de config.sample.php e preencha db_pass
        └── .htaccess
```

## Passo 2 — Gerar o pacote

```bash
npm install
npm run package:meuestilo
```

Gera `build-deploy/meuestilo.zip`.

## Passo 3 — Enviar para a Hostinger

1. hPanel → Gerenciador de Arquivos → `public_html/meuestilo/`
2. Apague arquivos antigos (não envie código-fonte com `/src/`)
3. Envie `meuestilo.zip` e **extraia**

## Passo 4 — Configurar a API no servidor

1. Em `public_html/meuestilo/api/`, copie `config.sample.php` → **`config.php`**
2. Abra `config.php` e preencha só **`db_pass`** (senha do MySQL no hPanel)
3. O restante já vem configurado no `config.sample.php` do repositório

**Login admin padrão:** senha `AdminMeuStilo2026!` (definida no sample — troque depois se quiser)

## Passo 5 — Testar

- https://inovesw.com.br/meuestilo/
- https://inovesw.com.br/meuestilo/api/bootstrap → deve retornar JSON

---

> Deploy automático via FTP: [`docs/DEPLOY_FTP.md`](DEPLOY_FTP.md)

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
