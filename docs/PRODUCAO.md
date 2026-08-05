# Checklist de Produção — Ag Salão

Guia para publicar e operar o sistema em ambiente real (Hostinger).

## 1. Código pronto (já implementado)

- [x] Agendamento online + painel admin
- [x] Anti double-booking no servidor
- [x] Autoatendimento (consultar/cancelar)
- [x] Mercado Pago (Checkout Pro + cartão no site)
- [x] E-mail de confirmação + cron de lembretes
- [x] Rate limiting no login admin
- [x] Validação de assinatura do webhook MP (`mp_webhook_secret`)
- [x] CSP e cabeçalhos de segurança
- [x] Política de privacidade (LGPD) + banner de consentimento
- [x] Exportação CSV de agendamentos
- [x] Toasts em vez de `alert()`
- [x] SEO dinâmico (título, meta, JSON-LD)
- [x] CI (GitHub Actions: lint + package)

## 2. Configuração obrigatória no servidor

- [ ] Banco MySQL criado e `database/schema.sql` importado
- [ ] `api/config.php` a partir de `config.sample.php`
- [ ] `admin_password` e `auth_secret` fortes
- [ ] `debug => false`
- [ ] SSL/HTTPS ativado
- [ ] `allowed_origins` com o domínio real (ex.: `['https://seudominio.com']`)
- [ ] `app_base_url` = `https://seudominio.com/ag_salao`

## 3. Opcional (recomendado para SaaS)

- [ ] `mp_access_token` e `mp_public_key` de **produção**
- [ ] `mp_webhook_secret` + URL do webhook no painel MP
- [ ] `mail_enabled`, `mail_from` e teste de envio
- [ ] `cron_key` + Cron Job diário no hPanel

## 4. Deploy (InoveSW / Hostinger)

Domínio alvo: **https://www.inovesw.com.br/ag_salao/**

```bash
npm install
npm run package
```

1. hPanel → **Gerenciador de Arquivos** → `public_html/`
2. Envie `build-deploy/ag_salao.zip` e **extraia** (gera `public_html/ag_salao/`)
3. Em `public_html/ag_salao/api/`, copie `config.sample.php` → `config.php` e preencha:
   - Credenciais MySQL do hPanel
   - `allowed_origins` → `['https://www.inovesw.com.br', 'https://inovesw.com.br']`
   - `app_base_url` → `https://www.inovesw.com.br/ag_salao`
4. phpMyAdmin → importe `database/schema.sql`

## 5. Teste automatizado pós-deploy

```bash
HOSTINGER_BASE_URL=https://www.inovesw.com.br/ag_salao \
HOSTINGER_ADMIN_PASSWORD=sua-senha-admin \
node scripts/hostinger-smoke.mjs
```
- [ ] Agendamento gera código STILO-XXXX
- [ ] Admin login funciona
- [ ] Banner de privacidade aparece na primeira visita
- [ ] Exportar CSV no painel admin

## 6. Itens futuros (não bloqueiam go-live)

- Pix/boleto no checkout de assinatura
- OTP de confirmação de agendamento
- Feriados/folgas por profissional
- Monitoramento (Sentry)
- Backup automatizado do MySQL
