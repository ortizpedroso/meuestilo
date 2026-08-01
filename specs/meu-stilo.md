# Ag Salão (Meu Stilo) — Especificação do Sistema de Agendamento para Salões

> **Status:** MVP implementado e testado de ponta a ponta.
> **Arquitetura:** Frontend React (SPA) + Backend PHP + Banco MySQL.
> **Deploy alvo:** subpasta `public_html/ag_salao/` (Hostinger, hospedagem compartilhada).
> Guia de publicação: [`docs/DEPLOY_HOSTINGER.md`](DEPLOY_HOSTINGER.md).

## Objetivo

Sistema de agendamento para salões de beleza/barbearias com aparência de produto comercial,
vendável como **SaaS white-label** por assinatura mensal. Clientes agendam online (sem depender de
WhatsApp) e o proprietário gerencia tudo por um painel administrativo. Cada salão pode personalizar
a própria marca (nome, logo, cores, contatos).

---

## Arquitetura (implementada)

| Camada | Tecnologia | Observações |
|--------|-----------|-------------|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS 4 | SPA; `base` do Vite = `/ag_salao/` |
| Backend | PHP 8 (PDO, sem framework) | API REST em `public/api/` (vira `ag_salao/api/`) |
| Banco | MySQL / MariaDB | Schema + seed em `database/schema.sql` |
| Autenticação admin | Token via `POST /api/login` | `Bearer` token = `sha256(admin_password\|auth_secret)` |
| Ícones/animação | lucide-react, motion | — |

Endpoints principais: `bootstrap`, `login`, `services`, `professionals`, `appointments`,
`reviews`, `settings`, `customers` (derivados), `subscriptions`.

---

## Visual e Experiência

| Requisito | Descrição | Status |
|-----------|-----------|--------|
| V-01 | Design moderno e profissional | ✅ |
| V-02 | Cores elegantes; **cor de destaque configurável (white-label)** | ✅ |
| V-03 | Layout responsivo (celular e desktop) | ✅ |
| V-04 | Interface simples e intuitiva | ✅ |

---

## Requisitos Funcionais

### 1. Página Inicial (Landing Page)

| ID | Requisito | Status |
|----|-----------|--------|
| LP-01 | Exibir o nome do salão (configurável) | ✅ |
| LP-02 | Exibir logo do salão (URL configurável) | ✅ |
| LP-03 | Exibir banner principal (URL configurável) | ✅ |
| LP-04 | Botão "Agendar Horário" visível e funcional | ✅ |
| LP-05 | Exibir média de avaliações na página principal | ✅ |

### 2. Serviços

Serviços de demonstração (seed): Corte Masculino, Corte Feminino, Escova Modeladora,
Progressiva Orgânica, Barba com Toalha Quente, Manicure Completa, Pedicure Completa.

| ID | Requisito | Status |
|----|-----------|--------|
| SV-01 | Nome | ✅ |
| SV-02 | Descrição | ✅ |
| SV-03 | Duração | ✅ |
| SV-04 | Valor | ✅ |

### 3. Sistema de Agendamento

| ID | Requisito | Status |
|----|-----------|--------|
| AG-01 | Cliente escolhe serviço | ✅ |
| AG-02 | Cliente escolhe profissional | ✅ |
| AG-03 | Cliente escolhe data | ✅ |
| AG-04 | Cliente escolhe horário disponível | ✅ |
| AG-05 | Cliente informa nome | ✅ |
| AG-06 | Cliente informa telefone | ✅ |
| AG-07 | Cliente informa e-mail (opcional) | ✅ |
| AG-08 | Cliente confirma o agendamento (gera código STILO-XXXX) | ✅ |

### 4. Controle de Horários

| ID | Requisito | Status |
|----|-----------|--------|
| CH-01 | Não permitir agendamentos em horários ocupados | ✅ |
| CH-02 | Exibir apenas horários disponíveis | ✅ |
| CH-03 | Intervalo entre horários e horário de almoço configuráveis no painel admin | ✅ |

### 5. Painel Administrativo

Área protegida por login (token no servidor).

| ID | Requisito | Status |
|----|-----------|--------|
| AD-01 | Login protegido (senha definida no servidor) | ✅ |
| AD-02 | Adicionar serviços | ✅ |
| AD-03 | Editar serviços | ✅ |
| AD-04 | Excluir serviços | ✅ |
| AD-05 | Adicionar/editar/excluir profissionais | ✅ |
| AD-06 | Editar profissionais | ✅ |
| AD-07 | Definir horários de funcionamento (abrir/fechar, intervalo e almoço) | ✅ |
| AD-08 | Visualizar todos os agendamentos (busca + filtro) | ✅ |
| AD-09 | Cancelar agendamentos | ✅ |
| AD-10 | Reagendar horários | ✅ |
| AD-11 | Concluir atendimento | ✅ |
| AD-12 | Base de clientes (histórico e total gasto) | ✅ (derivada) |
| AD-13 | Dashboard com métricas de faturamento | ✅ |

### 6. White-label (Marca)

| ID | Requisito | Status |
|----|-----------|--------|
| WL-01 | Editar nome, slogan, logo, banner | ✅ |
| WL-02 | Editar contatos (WhatsApp, endereço, cidade, Instagram, PIX) | ✅ |
| WL-03 | Definir cor de destaque aplicada ao site em tempo real | ✅ |

### 7. WhatsApp

| ID | Requisito | Status |
|----|-----------|--------|
| WA-01 | Após agendamento, gerar botão para WhatsApp | ✅ |
| WA-02 | Enviar resumo do agendamento via WhatsApp | ✅ |
| WA-03 | Lembrete manual ao cliente pelo admin (link WhatsApp) | ✅ |

### 8. Notificações (escopo do MVP)

| ID | Requisito | Status |
|----|-----------|--------|
| NT-01 | Exibir prévia do e-mail de confirmação ao cliente após o agendamento | ✅ |
| NT-02 | Permitir lembrete ao cliente via WhatsApp (a partir do painel admin) | ✅ |

> Envio real de e-mail (SMTP) e lembrete automático (cron) estão em "Fora do escopo do MVP (Próximas fases)".

### 9. Avaliações

| ID | Requisito | Status |
|----|-----------|--------|
| AV-01 | Clientes podem avaliar o atendimento | ✅ |
| AV-02 | Exibir média de avaliações na página principal | ✅ |

### 10. Compartilhamento

| ID | Requisito | Status |
|----|-----------|--------|
| CP-01 | Gerar link público para divulgação | ✅ |
| CP-02 | Aplicação pronta para ser compartilhada | ✅ |

### 11. Banco de Dados (Persistência)

Persistência real em **MySQL** (não mais `localStorage`).

| ID | Requisito | Status |
|----|-----------|--------|
| BD-01 | Salvar clientes | ✅ (derivados dos agendamentos) |
| BD-02 | Salvar agendamentos | ✅ (tabela `appointments`) |
| BD-03 | Salvar serviços | ✅ (tabela `services`) |
| BD-04 | Salvar profissionais | ✅ (tabela `professionals`) |
| BD-05 | Salvar configurações/white-label | ✅ (tabela `settings`) |
| BD-06 | Salvar assinaturas | ✅ (tabela `subscriptions`) |

### 12. Monetização (Assinatura SaaS)

| ID | Requisito | Status |
|----|-----------|--------|
| MN-01 | Quadro de funcionalidades + planos na página | ✅ (seção "Planos") |
| MN-02 | Contratação de assinatura (registra no banco) | ✅ (status `pending`) |
| MN-03 | Painel do proprietário vê contratações recebidas | ✅ |
| MN-04 | Estrutura preparada para pagamento (gancho de checkout) | ✅ (`POST /api/subscriptions` retorna `checkoutUrl`) |

> A integração de pagamento com o **Mercado Pago** está em "Fora do escopo do MVP (Próximas fases)".

### 13. Dados de Demonstração (seed)

| ID | Requisito | Status |
|----|-----------|--------|
| DD-01 | Nome do salão demo (**"Meu Stilo"**, editável via white-label) | ✅ |
| DD-02 | 3 profissionais cadastrados | ✅ |
| DD-03 | 7 serviços cadastrados | ✅ |
| DD-04 | Avaliações de exemplo | ✅ |

---

## Casos Extremos a Tratar

| ID | Cenário | Comportamento | Status |
|----|---------|---------------|--------|
| CE-01 | Horário já ocupado | Bloqueado (riscado/desabilitado) | ✅ |
| CE-02 | Fora do horário de funcionamento | Horários não são exibidos | ✅ |
| CE-03 | Campos obrigatórios vazios | Impede confirmação (nome/telefone obrigatórios) | ✅ |
| CE-04 | E-mail inválido | Validação de tipo `email`; e-mail é opcional | ✅ |
| CE-05 | Data no passado | `min` = hoje; horários passados marcados indisponíveis | ✅ |
| CE-06 | Cancelamento | Horário volta a ficar disponível | ✅ |
| CE-07 | Reagendamento | Libera o antigo, ocupa o novo | ✅ |
| CE-08 | Login admin incorreto | Nega acesso (senha no servidor) | ✅ |
| CE-09 | Excluir serviço com agendamentos futuros | Exclui do catálogo; agendamentos guardam nome/preço próprios | ✅ |
| CE-10 | Primeira execução | Banco populado pelo seed do `schema.sql` | ✅ |
| CE-11 | Avaliação sem agendamento | Permite avaliação geral (marcada como verificada) | ✅ |
| CE-12 | Mobile | Layout responsivo | ✅ |
| CE-13 | API indisponível | Tela de erro com "Tentar novamente" | ✅ |

---

## Definição de "Concluído"

### Landing e Visual
- [x] Nome, logo, banner e botão "Agendar Horário" na página inicial
- [x] Design responsivo (celular e desktop)
- [x] Visual profissional; cor de destaque personalizável

### Serviços
- [x] 7 serviços de demonstração cadastrados e visíveis
- [x] Cada serviço mostra nome, descrição, duração e valor

### Agendamento
- [x] Fluxo completo: serviço → profissional → data → horário → dados → confirmação
- [x] Horários ocupados não podem ser reservados
- [x] Apenas horários disponíveis são exibidos
- [x] Intervalo de atendimento configurável no admin

### Painel Admin
- [x] Login protege o painel administrativo
- [x] CRUD completo de serviços e profissionais
- [x] Horários de funcionamento configuráveis
- [x] Listagem de agendamentos com cancelar/reagendar/concluir
- [x] Dashboard e base de clientes

### White-label
- [x] Marca (nome, logo, banner, contatos, PIX) editável
- [x] Cor de destaque aplicada ao site em tempo real

### Integrações (MVP)
- [x] Botão WhatsApp com resumo do agendamento
- [x] Prévia do e-mail de confirmação exibida ao cliente
- [x] Lembrete manual ao cliente via WhatsApp no painel admin

### Avaliações e Compartilhamento
- [x] Clientes podem avaliar o atendimento
- [x] Média de avaliações na página principal
- [x] Link público para compartilhamento

### Dados e Persistência
- [x] Clientes, agendamentos, serviços, profissionais e configurações persistidos em MySQL
- [x] Dados de demonstração criados pelo seed

### Monetização (MVP)
- [x] Quadro de funcionalidades + contratação de assinatura
- [x] Contratações registradas e visíveis no painel
- [x] Estrutura de checkout preparada (gancho para provedor de pagamento)

### Qualidade Geral
- [x] Aplicativo funcional sem erros críticos (bug de loop do localStorage eliminado)
- [x] Pronto para deploy em `public_html/ag_salao/`
- [x] Aparência de produto comercial pronto para venda por assinatura

---

## Melhorias (ciclo atual)

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| IMP-01 | Prevenção de agendamento duplicado no servidor | `POST /api/appointments` retorna 409 se o profissional já tiver horário sobreposto na data | ✅ |
| IMP-02 | Validação reforçada no backend | Data `YYYY-MM-DD` e hora `HH:mm` válidas (senão 422); `status` restrito a lista; `rating` limitado a 1–5 | ✅ |
| IMP-03 | Autoatendimento do cliente (consultar/cancelar) | `GET /api/appointments/lookup?code=&phone=` e `POST /api/appointments/cancel` (match por código + telefone); UI "Meu Agendamento" no rodapé | ✅ |

### Sugestões para próximas iterações (não construídas)
- Confirmação em duas etapas do agendamento (ex.: OTP por WhatsApp/e-mail).
- Bloqueio/feriados e folgas pontuais por profissional no admin.
- Notificação/toast em vez de `alert()` para erros de salvamento.
- Exportar agendamentos/relatórios (CSV) no admin.
- CSP (Content-Security-Policy) ajustada para fontes/imagens externas.
- Rate limiting no login do admin (anti brute force).

## Qualidade: UI/UX, SEO e Segurança

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| Q-SEO-01 | `index.html` com idioma, título e descrição adequados | `lang="pt-BR"`, `<title>` descritivo e `meta description` presentes | ✅ |
| Q-SEO-02 | Metadados sociais e favicon | Open Graph (title/description/locale) e favicon (sem 404) | ✅ |
| Q-UX-01 | Acessibilidade dos principais controles | Botões de ícone (header e "fechar" dos modais) com `aria-label`; imagens com `alt` | ✅ |
| Q-UX-02 | Estados de carregamento e erro | Tela de "carregando" e tela de erro com "tentar novamente" na inicialização | ✅ |
| Q-SEC-01 | API não vaza detalhes internos | Erros 500 não retornam stack/mensagem interna (exceto com `debug` ligado) | ✅ |
| Q-SEC-02 | Cabeçalhos de segurança | `.htaccess` define `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` (e `Permissions-Policy` no app) | ✅ |
| Q-SEC-03 | Proteção de dados e injeção | Consultas via PDO prepared statements; `config.php` inacessível via web; CORS configurável | ✅ |

## Deploy / Produção

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| DEP-01 | Empacotador de deploy | `npm run package` gera `build-deploy/ag_salao.zip` com `index.html`, `assets/`, `.htaccess` e `api/` | ✅ |
| DEP-02 | Segurança do artefato | O pacote NÃO contém `config.php` (credenciais); contém `config.sample.php` | ✅ (validado) |
| DEP-03 | Funciona na subpasta `/ag_salao/` | App + API respondem a partir do pacote extraído (base do Vite `/ag_salao/`) | ✅ (E2E no pacote: agendamento OK) |
| DEP-04 | Guia de publicação | `docs/DEPLOY_HOSTINGER.md` cobre pacote, banco, `config.php`, MP, e-mail e cron | ✅ |

## Fases avançadas (pós-MVP) — implementadas

Estas três fases foram construídas. Itens que dependem de credenciais/infra de produção têm
**fallback seguro** e só ficam 100% ativos quando as credenciais forem configuradas.

### Fase 1 — Pagamento via Mercado Pago

Dois modelos possíveis (referência oficial):

- **Checkout Pro (redirect)** — cria uma *preference* e redireciona o cliente para a página do
  Mercado Pago. Já implementado como caminho atual/fallback (mais simples).
- **Checkout Transparente (Orders API — recomendado)** — o pagamento ocorre dentro do nosso site
  (cartão, Pix, boleto), sem redirecionar. Usa a **Orders API** (`/v1/orders`) e requer tokenização
  do cartão no frontend com **MercadoPago.js** (chave pública) + processamento no backend com o
  Access Token.

#### 1a) Checkout Pro (redirect) — implementado

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| MP-01 | `POST /api/subscriptions` cria a *preference* quando o token estiver configurado | Retorna `checkoutUrl` = `init_point`; assinatura `pending` | ✅ (ativo com `MP_ACCESS_TOKEN`) |
| MP-02 | Fallback sem credencial | Sem `MP_ACCESS_TOKEN`, retorna `checkoutUrl: null` e não quebra | ✅ (testado) |
| MP-03 | Webhook `POST /api/mp/webhook` atualiza status | Notificação `approved` → assinatura `active` | ✅ (estrutura pronta) |
| MP-04 | Frontend redireciona ao checkout | Se `checkoutUrl` existir, o app redireciona | ✅ |

#### 1b) Checkout Transparente (Orders API) — alvo recomendado (planejado)

Fluxo: frontend tokeniza o cartão (MercadoPago.js) → backend cria a order → processa → trata retorno.

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| MP-05 | Formulário de pagamento no site (cartão) com MercadoPago.js (Brick) | Cartão tokenizado no cliente (PAN nunca passa pelo nosso backend) | ✅ validado (brick renderiza no site) |
| MP-06 | `POST /api/orders` cria e processa a order (`/v1/orders`, `automatic`) | Retorna `orderId` e `orderStatus`; pagamento aprovado ativa a assinatura | ✅ validado (order `processed`/`accredited`) |
| MP-07 | Suporte a captura em duas etapas (modo `manual` + `/capture`) | Autorizar e capturar posteriormente | ⏳ pós-MVP |
| MP-08 | Aprovação ativa a assinatura + webhook | Order aprovada → assinatura `active`; webhook `POST /api/mp/webhook` pronto | ✅ |
| MP-09 | Reembolso do pagamento pelo admin | Guarda o `order_id` na assinatura; `POST /api/subscriptions/{id}/refund` (admin) chama `/v1/orders/{id}/refund`; assinatura vira `cancelled` | ✅ |
| MP-10 | Fallback seguro | Sem `MP_PUBLIC_KEY`, cai no fluxo de assinatura `pending` sem quebrar | ✅ |

> Credenciais necessárias (Secrets/`config.php`): `MP_ACCESS_TOKEN` (backend) e `MP_PUBLIC_KEY`
> (frontend, para o MercadoPago.js). A construção e o teste do Checkout Transparente dependem dessas
> credenciais (idealmente as de **teste/sandbox** primeiro). Referência: Orders API do Checkout
> Transparente (`/v1/orders`, `/process`, `/capture`, `/refund`, `/cancel`).

**Pré-requisitos (MP):**
- Conta de vendedor no Mercado Pago (ou Mercado Livre).
- Chave(s) Pix cadastradas (apenas se formos oferecer Pix).
- Aplicação criada em "Suas integrações" (gera Access Token + Public Key de teste e produção).

**Etapas de integração (checklist oficial):**
1. Criar a aplicação em "Suas integrações".
2. Configurar o ambiente de desenvolvimento (credenciais de teste).
3. Configurar os meios de pagamento desejados (cartão, Pix, boleto).
4. Configurar as notificações (webhook).
5. Testar a integração (cartões/dispositivos de teste do MP).
6. Medir a qualidade da integração.
7. Subir em produção (trocar para credenciais de produção).

**Decisão de modelo (esforço × personalização):**
- Checkout Transparente (Orders API): máxima personalização, no nosso site — maior esforço (API + MercadoPago.js).
- Checkout Bricks: componentes prontos do MP, no nosso site — esforço médio (bom equilíbrio).
- Checkout Pro (redirect): menor esforço, fora do site — **já implementado como fallback**.

> Recomendação: se o objetivo é pagamento no próprio site com menos esforço/risco, avaliar **Bricks**;
> se a prioridade é personalização total, seguir com **Orders API**. Definir antes do `/build`.

**Resultado da validação em sandbox (01/08/2026):**
- Checkout Pro (redirect): ✅ validado — `POST /api/subscriptions` gerou um `init_point` real.
- Checkout Transparente (Orders API): ✅ validado de ponta a ponta. Descoberta importante do sandbox:
  a cobrança exige (a) **pagador = usuário de teste comprador** (e-mail `...@testuser.com`, criável via
  `POST /users/test_user`), (b) **payer completo** (nome + identificação CPF) e (c) o cartão de teste
  **Visa** funcionou (o Mastercard de teste retornou `invalid_transaction_amount` nesta conta). Com
  isso, `POST /api/orders` retornou order `processed`/`accredited` e a assinatura ficou `active`.
- Observação: o backend usa `MP_ACCESS_TOKEN`; o frontend usa `MP_PUBLIC_KEY` (exposta em `/bootstrap`).
- Reembolso (MP-09): ✅ validado — `POST /api/subscriptions/{id}/refund` (admin) reembolsa a order e marca
  a assinatura como `cancelled`. Ressalva do sandbox: o MP rejeita reembolso imediato de uma order
  recém-processada (`Post processing rejected`); após alguns segundos o reembolso é aceito (`refunded`).

### Fase 2 — E-mail de confirmação

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| EM-01 | Enviar e-mail de confirmação ao concluir o agendamento | E-mail HTML com código/serviço/data disparado ao `clientEmail` | ✅ (ativo com config de e-mail) |
| EM-02 | Não bloquear o agendamento se o e-mail falhar | `POST /api/appointments` retorna 201 mesmo se o envio falhar | ✅ (testado) |
| EM-03 | Registro verificável do e-mail gerado | Com `mail_log` configurado, o conteúdo é gravado em arquivo para auditoria | ✅ (testado) |

> Em produção (Hostinger), o envio usa `mail()` do PHP. Entrega real depende do servidor de e-mail
> da hospedagem.

### Fase 3 — Lembrete automático (cron)

| ID | Requisito | Critério de aceite | Status |
|----|-----------|--------------------|--------|
| CR-01 | Endpoint `GET /api/cron/reminders?key=...` protegido por chave | Chave inválida → 401 | ✅ (testado) |
| CR-02 | Selecionar agendamentos do dia seguinte ainda não lembrados | Retorna/processa apenas `confirmed` de amanhã sem `reminded_at` | ✅ (testado) |
| CR-03 | Marcar como lembrado (idempotente) | Após processar, `reminded_at` é setado; nova execução não reprocessa | ✅ (testado) |
| CR-04 | Enviar o lembrete por e-mail | Usa o mailer da Fase 2 para cada agendamento | ✅ |

> Em produção, agendar o endpoint via **Cron Jobs** do hPanel (ex.: 1x/dia). Documentado em
> `docs/DEPLOY_HOSTINGER.md`.
