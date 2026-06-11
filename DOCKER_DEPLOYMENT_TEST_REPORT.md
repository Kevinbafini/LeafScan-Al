# DOCKER_DEPLOYMENT_TEST_REPORT.md

**LeafScan AI — Relatório de Validação para Deploy em VPS Hostinger com Docker**

**Data:** 2026-06-11
**Ambiente testado:** macOS local (pré-deploy) — sem arquivo `.env` presente
**Objetivo:** Verificar se o projeto está pronto para `docker compose up -d --build` em VPS Hostinger

---

## Resumo executivo

| Item | Status |
|------|--------|
| Arquivos obrigatórios | ✅ PASSOU |
| Arquivos de frontend na raiz | ✅ PASSOU (removidos) |
| Dockerfile | ✅ PASSOU |
| docker-compose.yml | ✅ PASSOU |
| server.js | ✅ PASSOU |
| .env.example | ✅ PASSOU |
| db/schema.sql | ✅ PASSOU |
| docker compose config | ⚠️ NÃO EXECUTADO (`.env` ausente — esperado) |
| Startup local dos containers | ⚠️ NÃO EXECUTADO (`.env` ausente — esperado) |
| Health check em runtime | ⚠️ NÃO EXECUTADO (containers não iniciados) |
| Exposição de arquivos sensíveis | ⚠️ NÃO EXECUTADO (containers não iniciados) |
| Tabelas do banco de dados | ✅ PASSOU (inspeção estática do schema.sql) |
| Exposição de portas | ✅ PASSOU (inspeção estática do compose) |
| Smoke test de autenticação | ⚠️ NÃO EXECUTADO (containers não iniciados) |

---

## 1. Inspeção estática — Arquivos obrigatórios

**Comando executado:**
```bash
for f in Dockerfile docker-compose.yml .dockerignore .env.example DEPLOY_HOSTINGER.md \
  server.js db/schema.sql public/index.html public/script.js public/styles.css; do
  [ -e "$f" ] && echo "OK $f" || echo "MISS $f"
done
```

**Resultado:**

| Arquivo | Status |
|---------|--------|
| `Dockerfile` | ✅ OK |
| `docker-compose.yml` | ✅ OK |
| `.dockerignore` | ✅ OK |
| `.env.example` | ✅ OK |
| `DEPLOY_HOSTINGER.md` | ✅ OK |
| `server.js` | ✅ OK |
| `db/schema.sql` | ✅ OK |
| `public/index.html` | ✅ OK |
| `public/script.js` | ✅ OK |
| `public/styles.css` | ✅ OK |

**Arquivos de frontend na raiz (resquícios):**

| Arquivo | Status |
|---------|--------|
| `index.html` (raiz) | ✅ REMOVIDO |
| `script.js` (raiz) | ✅ REMOVIDO |
| `styles.css` (raiz) | ✅ REMOVIDO |
| `images/` (raiz) | ✅ REMOVIDO |

> Todo o frontend está corretamente em `public/`. Não há duplicatas.

---

## 2. Validação do Dockerfile

**Conteúdo verificado:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

| Verificação | Status |
|-------------|--------|
| Imagem base `node:22-alpine` | ✅ OK |
| `package*.json` copiado ANTES do código-fonte | ✅ OK |
| `npm ci --omit=dev` (sem devDependencies) | ✅ OK |
| `EXPOSE 3000` presente | ✅ OK |
| `CMD ["npm", "start"]` → `node server.js` (confirmado em package.json) | ✅ OK |
| `.env` excluído pelo `.dockerignore` (`.env` e `.env.*`) | ✅ OK |
| `node_modules` excluído pelo `.dockerignore` | ✅ OK |

> Observação: `COPY . .` inclui `DEPLOY_HOSTINGER.md` e outros arquivos de documentação na imagem. Isso é inofensivo — não são servidos pela aplicação.

---

## 3. Validação do docker-compose.yml

| Verificação | Status | Detalhe |
|-------------|--------|---------|
| Apenas dois serviços (`app` e `mysql`) | ✅ OK | `mysql:` e `app:` |
| App mapeia apenas `"80:3000"` | ✅ OK | Confirmado |
| MySQL **não** expõe `"3306:3306"` | ✅ OK | Nenhum `ports:` no serviço `mysql` |
| MySQL usa `mysql:8.0` | ✅ OK | |
| MySQL usa volume `mysql_data` | ✅ OK | `mysql_data:/var/lib/mysql` |
| `db/schema.sql` montado em `initdb.d/001-schema.sql` | ✅ OK | Modo `:ro` |
| App `depends_on` MySQL com `condition: service_healthy` | ✅ OK | |
| `NODE_ENV: production` | ✅ OK | |
| `PORT: 3000` | ✅ OK | |
| `DB_HOST: leafscan-mysql` | ✅ OK | |
| `DB_PORT: 3306` | ✅ OK | |
| `COOKIE_SECURE: "false"` | ✅ OK | Correto para HTTP puro |
| `TRUST_PROXY: "false"` | ✅ OK | Correto — sem reverse proxy |

---

## 4. Validação do server.js

| Verificação | Status | Detalhe |
|-------------|--------|---------|
| Serve apenas `public/` | ✅ OK | `express.static(path.join(__dirname, "public"))` — linha 353 |
| Sem `express.static(__dirname)` inseguro | ✅ OK | Nenhum resultado |
| `SESSION_SECRET` obrigatório em produção | ✅ OK | Lança erro na ausência — linha 23 |
| Lógica condicional de `COOKIE_SECURE` | ✅ OK | Suporta `"true"`, `"false"` e fallback — linhas 29–32 |
| `TRUST_PROXY` **condicional** | ✅ OK | `if (process.env.TRUST_PROXY === "true")` — linha 15 |
| Sem `app.set("trust proxy", 1)` incondicional | ✅ OK | Linha 16 está dentro do `if` — verificado com contexto |
| Rota `/api/health` presente | ✅ OK | Linha 361 |
| `app.listen(process.env.PORT \|\| 3000)` | ✅ OK | Linha 659 |

---

## 5. Validação do .env.example

**Variáveis presentes (valores ocultados):**

| Variável | Status |
|----------|--------|
| `NODE_ENV` | ✅ OK |
| `PORT` | ✅ OK |
| `COOKIE_SECURE` | ✅ OK (`false`) |
| `TRUST_PROXY` | ✅ OK (`false`) |
| `APP_URL` | ✅ OK |
| `ANTHROPIC_API_KEY` | ✅ OK |
| `ANTHROPIC_MODEL` | ✅ OK |
| `DEMO_FALLBACK_ENABLED` | ✅ OK |
| `DB_HOST` | ✅ OK (`leafscan-mysql`) |
| `DB_PORT` | ✅ OK |
| `DB_NAME` | ✅ OK |
| `DB_USER` | ✅ OK |
| `DB_PASSWORD` | ✅ OK |
| `DB_ROOT_PASSWORD` | ✅ OK |
| `SESSION_SECRET` | ✅ OK (placeholder com instrução de geração) |

**Arquivo .env local:** NÃO EXISTE — esperado para esta máquina de desenvolvimento.

---

## 6. docker compose config

**Status:** ⚠️ NÃO EXECUTADO

**Motivo:** O `docker-compose.yml` utiliza `env_file: - .env`. O Docker Compose exige que o arquivo `.env` exista fisicamente para executar qualquer subcomando, incluindo `config`, mesmo ao usar `--env-file`. Sem o arquivo `.env`, o comando falha com:

```
env file .../LeafScan-Al/.env not found: no such file or directory
```

**Isso é comportamento esperado** para uma máquina de desenvolvimento sem segredos configurados. O arquivo `.env` só deve existir no VPS Hostinger.

**Ação necessária no VPS:**
```bash
cp .env.example .env
nano .env   # preencher os valores reais
docker compose config   # agora funcionará
```

---

## 7. Startup local dos containers

**Status:** ⚠️ NÃO EXECUTADO

**Motivo:** Arquivo `.env` ausente. O `docker compose up -d --build` falha sem ele porque o serviço MySQL precisa de `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, e `MYSQL_ROOT_PASSWORD`.

Docker está disponível e funcional:
- Docker Engine: `29.4.0`
- Docker Compose: `v5.1.2`

Nenhum container LeafScan em execução no momento do teste.

---

## 8. Health check em runtime

**Status:** ⚠️ NÃO EXECUTADO — containers não iniciados.

**Comando a executar no VPS após deploy:**
```bash
curl -i http://localhost/api/health
```

**Resposta esperada:**
```json
{"ok":true,"provider":"anthropic","anthropicKeyConfigured":true,"model":"claude-3-5-sonnet-latest","dbConfigured":true}
```

---

## 9. Exposição de arquivos sensíveis

**Status:** ⚠️ NÃO EXECUTADO — containers não iniciados.

**Comandos a executar no VPS após deploy:**
```bash
curl -I http://localhost/server.js       # esperado: 404
curl -I http://localhost/db/schema.sql   # esperado: 404
curl -I http://localhost/package.json    # esperado: 404

curl http://localhost/server.js | head   # esperado: sem código-fonte
curl http://localhost/db/schema.sql | head  # esperado: sem SQL
curl http://localhost/package.json | head   # esperado: sem JSON de config
```

**Análise estática:** O Express serve apenas `public/` — nenhuma rota serve `server.js`, `db/` ou `package.json`. O risco de exposição é **muito baixo** com base na inspeção do código.

---

## 10. Banco de dados — inspeção estática do schema

**Tabelas definidas em `db/schema.sql`:**

| Tabela | Status |
|--------|--------|
| `users` | ✅ OK |
| `password_reset_tokens` | ✅ OK |
| `sessions` | ✅ OK |
| `analyses` | ✅ OK |

Todas as 4 tabelas usam `CREATE TABLE IF NOT EXISTS` (idempotente) e `ENGINE=InnoDB`.

O schema abre com `CREATE DATABASE IF NOT EXISTS leafscan` + `USE leafscan`, o que é correto e compatível com o volume `initdb.d/`.

**Nota importante sobre reinicialização do schema:**
O script `001-schema.sql` só é executado automaticamente pelo MySQL na **primeira criação** do volume `mysql_data`. Se o schema precisar ser reaplicado durante testes no VPS:
```bash
docker compose down -v   # ATENÇÃO: apaga todos os dados do banco
docker compose up -d --build
```

---

## 11. Exposição de portas — inspeção estática

**Baseado em `docker-compose.yml`:**

| Container | Porta pública | Porta interna | Status |
|-----------|---------------|---------------|--------|
| `leafscan-app` | `0.0.0.0:80` | `3000` | ✅ Correto |
| `leafscan-mysql` | **nenhuma** | `3306` (interna) | ✅ Correto |

**Saída esperada de `docker compose ps` no VPS:**
```
NAME              PORTS
leafscan-app      0.0.0.0:80->3000/tcp
leafscan-mysql    3306/tcp
```

`leafscan-mysql` **não deve** mostrar `0.0.0.0:3306->3306/tcp`.

**Comandos para verificar no VPS após deploy:**
```bash
docker compose ps
ss -tlnp | grep -E ':80|:3000|:3306'
```

---

## 12. Smoke test de autenticação

**Status:** ⚠️ NÃO EXECUTADO — containers não iniciados.

**Comando seguro a executar no VPS após deploy:**
```bash
curl -i http://localhost/auth/me
```

**Resposta esperada (não autenticado):** `401 Unauthorized` — não deve crashar o servidor.

---

## Comandos executados neste teste

```bash
# Inspeção de arquivos
for f in Dockerfile docker-compose.yml .dockerignore .env.example ...; do [ -e "$f" ] ...

# Verificação de variáveis do .env.example (valores ocultados)
grep -E "^[A-Z_]+" .env.example | sed 's/=.*/=***REDACTED***/'

# Validação de padrões no server.js
grep -n "express.static" server.js
grep -n -B3 "app.set.*trust proxy" server.js
grep -n "SESSION_SECRET|COOKIE_SECURE|api/health|app.listen" server.js

# Validação do Dockerfile e .dockerignore
cat Dockerfile
grep "\.env|node_modules" .dockerignore

# Validação do docker-compose.yml
grep -n "TRUST_PROXY|COOKIE_SECURE|NODE_ENV|ports|schema.sql|depends_on" docker-compose.yml

# Tabelas do schema
grep -E "^CREATE TABLE" db/schema.sql

# Verificação do script npm start
cat package.json | python3 -c "import sys,json; ..."

# docker compose ps (confirmação: sem containers rodando)
docker compose ps

# docker compose config → FALHOU por ausência de .env (esperado)
docker compose config
```

---

## Issues bloqueantes

**Nenhum.** Todos os arquivos de configuração estão corretos.

---

## Avisos (não bloqueantes)

| # | Aviso | Impacto |
|---|-------|---------|
| 1 | `.env` ausente nesta máquina | Esperado — o arquivo só deve existir no VPS |
| 2 | `docker compose config` não pôde ser executado | Consequência do item 1 — testar no VPS |
| 3 | Startup e runtime não testados localmente | Testar no VPS seguindo os passos do `DEPLOY_HOSTINGER.md` |
| 4 | `DEPLOY_HOSTINGER.md` incluído na imagem Docker | Inofensivo — não é servido pelo Express |

---

## Checklist final para o VPS Hostinger

Execute estes comandos **na ordem exata** após conectar via SSH:

```bash
# 1. Clonar o repositório
git clone <URL_DO_SEU_REPOSITORIO> /opt/leafscan
cd /opt/leafscan

# 2. Criar e preencher o .env
cp .env.example .env
nano .env
# Preencher: APP_URL, ANTHROPIC_API_KEY, DB_PASSWORD, DB_ROOT_PASSWORD, SESSION_SECRET
# Gerar SESSION_SECRET:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 3. Verificar configuração (deve ser limpo, sem erros)
docker compose config

# 4. Build e subida
docker compose up -d --build

# 5. Verificar status (aguardar ambos Up/healthy)
docker compose ps

# 6. Ver logs da aplicação
docker compose logs -f app

# 7. Testar health check
curl -i http://localhost/api/health

# 8. Testar exposição de arquivos sensíveis (deve retornar 404)
curl -I http://localhost/server.js
curl -I http://localhost/db/schema.sql
curl -I http://localhost/package.json

# 9. Verificar portas expostas
ss -tlnp | grep -E ':80|:3000|:3306'

# 10. Configurar firewall (APENAS após confirmar SSH funcionando)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow from MEU_IP_PUBLICO to any port 22 proto tcp
sudo ufw enable
sudo ufw status verbose
```

---

## É seguro executar `docker compose up -d --build`?

**Sim**, desde que:
- O arquivo `.env` exista e contenha `SESSION_SECRET`, `DB_PASSWORD`, `DB_ROOT_PASSWORD` e `ANTHROPIC_API_KEY` preenchidos com valores reais.

## É seguro ativar UFW?

**Sim**, desde que:
- `MEU_IP_PUBLICO` seja substituído pelo IP público real do administrador antes de `ufw enable`.
- A conectividade SSH seja confirmada antes de executar `ufw enable`.

---

## Veredicto final

```
╔══════════════════════════════════════════╗
║   APROVADO COM AVISOS                    ║
╚══════════════════════════════════════════╝
```

**Todos os arquivos de configuração estão corretos.** A ausência de `.env` nesta máquina é esperada e não é um defeito do projeto — é uma pré-condição que deve ser satisfeita no VPS antes do deploy.

O projeto está arquiteturalmente correto para o deploy acadêmico em VPS Hostinger com Docker:
- Dois containers (`app` + `mysql`)
- Porta pública única (`80:3000`)
- MySQL interno (sem exposição de 3306)
- Sem Nginx, sem HTTPS, sem serviços extras
- Segredos passados por variável de ambiente
- Frontend servido apenas de `public/`
- `TRUST_PROXY` e `COOKIE_SECURE` configurados corretamente para HTTP direto

**Próximo passo:** Criar `.env` no VPS com os segredos reais e executar `docker compose up -d --build`.
