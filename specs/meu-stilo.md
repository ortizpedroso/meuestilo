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
| AG-07 | Cliente informa e-mail | ✅ |
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

## Fora do escopo do MVP (Próximas fases)

Itens intencionalmente adiados — dependem de credenciais/infra de produção (não validáveis
neste ambiente de desenvolvimento) e/ou foram acordados como posteriores:

1. **Pagamento via Mercado Pago:** criar a *preference* no `POST /api/subscriptions` e retornar o
   `init_point` como `checkoutUrl` (o frontend já redireciona quando existir) + webhook para marcar a
   assinatura como `active`. Combinado como próxima fase.
2. **Envio real de e-mail (SMTP):** hoje o app exibe a prévia do e-mail (NT-01). O envio real exige
   servidor SMTP configurado na hospedagem.
3. **Lembrete automático (cron):** hoje o lembrete é manual via WhatsApp (NT-02). A automação exige
   Cron Jobs na Hostinger disparando um endpoint dedicado.

> A "Definição de Concluído" acima refere-se ao **escopo do MVP** e não inclui estes três itens.
