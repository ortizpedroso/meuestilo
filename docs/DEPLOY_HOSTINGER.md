# Deploy na Hostinger — App em `public_html/ag_salao/`

Guia para publicar o sistema **Ag Salão** numa subpasta do `public_html`, sem afetar o site que já está na raiz (InoveSW). Stack: **React (estático) + API PHP + MySQL**.

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

## Passo 2 — Gerar o build do frontend

Na sua máquina, na raiz do projeto:

```bash
npm install
npm run build
```

Isso gera a pasta `dist/` já com `index.html`, `assets/`, `.htaccess` e a pasta `api/`
(o Vite já está configurado com `base: '/ag_salao/'`).

## Passo 3 — Enviar os arquivos para a Hostinger

Envie **o conteúdo de `dist/`** para `public_html/ag_salao/` (crie essa pasta no
Gerenciador de Arquivos ou via FTP). Ao final você deve ter
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
    'allowed_origins' => ['*'],
];
```

## Passo 5 — Testar

- Acesse `https://seudominio.com/ag_salao/` → a landing deve carregar.
- Faça um agendamento de teste (deve gerar um código STILO-xxxx).
- Acesse **Admin** no topo, entre com a `admin_password` do `config.php` e confira o painel.
- Em **Marca (White-label)**, personalize nome, logo, contatos e a cor de destaque.

Ative o **SSL grátis** no hPanel para o site rodar em `https`.

---

## Deploy via GitHub (alternativa)

A Hostinger só faz `git pull` — ela **não roda `npm run build`** no plano compartilhado.
Então, para usar Git, escolha uma opção:

- **Commit do build:** rode `npm run build` e comite a pasta `dist/` (não recomendado como padrão).
- **GitHub Actions:** um workflow builda e envia por FTP só para `public_html/ag_salao/`.
  (Podemos configurar isso depois, se desejar.)

Para começar, o **upload de arquivos** (Passos 2–4) é o caminho mais simples e rápido.

---

## Próximo passo (futuro): Mercado Pago

A contratação de assinatura já grava a solicitação no banco (tabela `subscriptions`,
status `pending`). A integração de pagamento está preparada: no endpoint
`POST /api/subscriptions` (arquivo `api/index.php`) há o ponto para criar a *preference*
do Mercado Pago e retornar a `checkoutUrl`; o frontend já redireciona para ela quando existir.

---

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
