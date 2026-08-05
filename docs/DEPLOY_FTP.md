# Deploy automático Git → Hostinger (FTP)

A cada `git push` na branch `main`, o GitHub gera o build e envia para `public_html/meuestilo/` na Hostinger.

O arquivo **`config.php` do servidor NÃO é sobrescrito** (senhas e banco ficam seguros).

---

## 1. Pegar credenciais FTP no hPanel

1. Acesse **hPanel** → **Arquivos** → **Contas FTP**
2. Use uma conta existente ou crie uma (ex.: `u970180508.meuestilo`)
3. Anote:
   - **Host** (ex.: `ftp.inovesw.com.br` ou o host que aparecer no hPanel)
   - **Usuário**
   - **Senha**
   - **Porta** (geralmente `21`)

### Caminho remoto (`FTP_SERVER_DIR`)

No Gerenciador de Arquivos, abra `public_html/meuestilo/` e veja o caminho completo. Na Hostinger costuma ser um destes:

```
/public_html/meuestilo/
```

ou

```
/domains/inovesw.com.br/public_html/meuestilo/
```

Se tiver dúvida, comece com `/public_html/meuestilo/`.

---

## 2. Cadastrar secrets no GitHub

> **Erro `Input required and not supplied: server`?**  
> Significa que o secret **`FTP_HOST`** (e provavelmente os outros) **não foi cadastrado** ainda.

1. Abra: **https://github.com/ortizpedroso/meuestilo/settings/secrets/actions**
2. Clique em **New repository secret** — crie **os 5** abaixo (nomes **exatos**, maiúsculas):

| Nome do secret | Valor | Obrigatório |
|----------------|-------|-------------|
| `FTP_HOST` | `ftp.inovesw.com.br` | ✅ |
| `FTP_USER` | `u970180508.meuestilo` | ✅ |
| `FTP_PASSWORD` | Senha da conta FTP (hPanel → Mudar senha) | ✅ |
| `FTP_PORT` | `21` | recomendado |
| `FTP_SERVER_DIR` | `/domains/inovesw.com.br/public_html/meuestilo/` | ✅ |

> Caminho completo no hPanel: `/home/u970180508/domains/inovesw.com.br/public_html/meuestilo`  
> No FTP use: `/domains/inovesw.com.br/public_html/meuestilo/` (sem `/home/u970180508` no início).

⚠️ O nome tem que ser **exatamente** `FTP_HOST` (não `FTP_SERVER` nem `HOST`).

---

## 3. Primeira vez no servidor

Antes do primeiro deploy automático, crie manualmente (se ainda não existir):

`public_html/meuestilo/api/config.php`

(copie de `config.sample.php` e preencha `db_pass`)

O deploy **nunca** envia `config.php` — sua senha do banco permanece no servidor.

---

## 4. Como atualizar o site

No seu computador, na pasta do projeto:

```bash
git add .
git commit -m "sua alteração"
git push origin main
```

O GitHub Actions roda sozinho. Acompanhe em:

**https://github.com/ortizpedroso/meuestilo/actions**

Deploy manual (sem push): Actions → **Deploy FTP (Hostinger)** → **Run workflow**.

---

## 5. Testar

- https://inovesw.com.br/meuestilo/
- https://inovesw.com.br/meuestilo/api/bootstrap

Login admin (padrão do sample): `AdminMeuStilo2026!`
