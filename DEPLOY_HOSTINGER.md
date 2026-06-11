# DEPLOY_HOSTINGER.md

**LeafScan AI — Guia de Deploy em VPS Hostinger com Docker**

---

## Arquitetura

```
Internet (HTTP porta 80)
        |
        v
VPS Hostinger — porta 80 exposta publicamente
        |
        v
leafscan-app  (container Node.js / Express — porta interna 3000)
        |
        v
leafscan-mysql  (container MySQL 8 — porta interna 3306, nunca exposta)
        |
        v
Volume Docker: mysql_data  (persistência do banco de dados)
```

Dois containers conectados em uma rede Docker interna (`leafscan-net`).
Apenas a porta 80 do container `leafscan-app` é exposta ao host VPS.
O MySQL é acessível somente pelo container da aplicação, nunca pela internet.

---

## Arquivos criados neste deploy

| Arquivo | Finalidade |
|---------|-----------|
| `Dockerfile` | Build do container Node.js |
| `docker-compose.yml` | Orquestração dos dois serviços |
| `.dockerignore` | Exclui node_modules, .env e arquivos desnecessários da imagem |
| `.env.example` | Template de variáveis de ambiente |
| `public/` | Pasta com os arquivos estáticos do frontend (HTML, CSS, JS, imagens) |
| `DEPLOY_HOSTINGER.md` | Este guia |

---

## Pré-requisitos no VPS

- Ubuntu 22.04 ou superior
- Docker instalado: https://docs.docker.com/engine/install/ubuntu/
- Docker Compose plugin instalado (incluído no Docker Engine moderno)
- Acesso SSH ao VPS

Verifique as versões após instalar:

```bash
docker --version
docker compose version
```

---

## Passo 1 — Clonar o projeto no VPS

```bash
git clone <URL_DO_SEU_REPOSITORIO> /opt/leafscan
cd /opt/leafscan
```

---

## Passo 2 — Criar o arquivo .env

Copie o template e preencha os valores reais:

```bash
cp .env.example .env
nano .env
```

Campos obrigatórios a preencher:

```
APP_URL=http://SEU_IP_HOSTINGER

ANTHROPIC_API_KEY=sk-ant-api03-...

DB_PASSWORD=uma_senha_forte_aqui
DB_ROOT_PASSWORD=outra_senha_forte_aqui

SESSION_SECRET=<string_longa_e_aleatoria>
```

### Gerar SESSION_SECRET

Execute no servidor (ou localmente) e cole o resultado no .env:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> **Importante:** Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

---

## Passo 3 — Build e subida dos containers

```bash
docker compose up -d --build
```

O Docker irá:
1. Construir a imagem Node.js a partir do `Dockerfile`
2. Baixar a imagem `mysql:8.0`
3. Subir o container `leafscan-mysql` e aguardar o healthcheck
4. Subir o container `leafscan-app` após o MySQL estar pronto
5. Inicializar o banco automaticamente com `db/schema.sql`

> **Nota sobre inicialização do schema:** O arquivo `db/schema.sql` (montado em `/docker-entrypoint-initdb.d/001-schema.sql`) é executado automaticamente **apenas na primeira criação** do volume `mysql_data`. Se o schema falhar ou precisar ser reaplicado durante os testes, destrua o volume e recrie tudo do zero:
>
> ```bash
> docker compose down -v   # ATENÇÃO: apaga permanentemente todos os dados do banco
> docker compose up -d --build
> ```
>
> **Aviso:** `docker compose down -v` **apaga permanentemente** os dados do banco de dados. Use apenas em ambiente de testes ou quando for necessário recriar o schema do zero.

---

## Passo 4 — Verificar status dos containers

```bash
docker compose ps
```

Saída esperada: ambos com `Status: Up (healthy)` ou `Up`.

---

## Passo 5 — Ver logs

Logs da aplicação:

```bash
docker compose logs -f app
```

Logs do MySQL:

```bash
docker compose logs -f mysql
```

Para sair dos logs: `Ctrl+C`

---

## Passo 6 — Testar a aplicação

### Health check da API

```bash
curl http://localhost/api/health
```

Resposta esperada:

```json
{"ok":true,"provider":"anthropic","anthropicKeyConfigured":true,"model":"claude-3-5-sonnet-latest","dbConfigured":true}
```

### Testar pelo IP do VPS (fora do servidor)

```bash
curl http://SEU_IP_HOSTINGER/api/health
```

### Confirmar que arquivos do backend NÃO são acessíveis publicamente

Os seguintes URLs devem retornar um status 404 ou qualquer resposta que **NÃO contenha o conteúdo real do arquivo**:

```bash
curl -I http://SEU_IP_HOSTINGER/server.js
curl -I http://SEU_IP_HOSTINGER/db/schema.sql
curl -I http://SEU_IP_HOSTINGER/package.json

curl http://SEU_IP_HOSTINGER/server.js | head
curl http://SEU_IP_HOSTINGER/db/schema.sql | head
curl http://SEU_IP_HOSTINGER/package.json | head
```

Resultado esperado: `HTTP/1.1 404 Not Found` nos três comandos com `-I`. Nos comandos com `| head`, nenhum trecho de código-fonte JavaScript, SQL ou JSON de configuração deve aparecer na saída. Qualquer retorno `200 OK` com conteúdo real do arquivo indica vazamento crítico de código-fonte.

### Testar login e registro

Abra no navegador: `http://SEU_IP_HOSTINGER`

- Registre uma conta nova
- Faça login
- Envie uma imagem para análise
- Verifique o histórico de análises

---

## Passo 7 — Confirmar que o MySQL está interno

O MySQL não deve ter porta exposta ao host. Verifique:

```bash
docker compose ps
```

Saída esperada (colunas simplificadas):

```
NAME              PORTS
leafscan-app      0.0.0.0:80->3000/tcp
leafscan-mysql    3306/tcp
```

- `leafscan-app` deve mostrar `0.0.0.0:80->3000/tcp` — somente a porta 80 HTTP é pública.
- `leafscan-mysql` deve mostrar apenas `3306/tcp` (porta interna da rede Docker), **nunca** `0.0.0.0:3306->3306/tcp`. Se a porta 3306 aparecer mapeada para o host, o banco de dados está exposto publicamente — o que não deve ocorrer neste deploy.

Confirme que a porta 3306 não está acessível de fora:

```bash
ss -tlnp | grep 3306
```

Resultado esperado: sem saída (porta não exposta).

---

## Passo 8 — Reiniciar a aplicação

```bash
docker compose restart app
```

Rebuild completo (após atualização do código):

```bash
docker compose up -d --build
```

---

## Passo 9 — Firewall (UFW) — equivalente ao Security Group

Configure o UFW para permitir apenas o tráfego necessário:

```bash
# Bloquear todo tráfego de entrada por padrão
sudo ufw default deny incoming

# Permitir todo tráfego de saída
sudo ufw default allow outgoing

# Permitir apenas HTTP na porta 80
sudo ufw allow 80/tcp

# Restringir SSH ao seu IP (substitua MEU_IP_PUBLICO pelo seu IP real)
# Isso evita ataques de força bruta ao SSH
sudo ufw allow from MEU_IP_PUBLICO to any port 22 proto tcp

# Ativar o firewall
sudo ufw enable

# Verificar status
sudo ufw status verbose
```

> **Atenção:** Defina `MEU_IP_PUBLICO` antes de ativar o UFW, ou você pode perder o acesso SSH ao VPS.
> Saída esperada de `ufw status verbose`: somente porta 80 (e SSH do seu IP) listadas como ALLOW.

---

## Observação: HTTPS, COOKIE_SECURE e TRUST_PROXY

Este deploy acadêmico usa **somente HTTP (porta 80)** sem Nginx ou Cloudflare à frente. Por isso:

- `COOKIE_SECURE=false` está definido no `.env.example` e no `docker-compose.yml` — permite que o cookie de sessão funcione sem HTTPS
- `TRUST_PROXY=false` está definido no `.env.example` e no `docker-compose.yml` — desativa o `trust proxy` do Express, impedindo que um atacante falsifique o header `X-Forwarded-For` para contornar rate limiting e controles baseados em IP
- Em um ambiente de produção real com Nginx ou Cloudflare na frente, mude ambos para `true` e `COOKIE_SECURE=true`
- Para este trabalho acadêmico, HTTP porta 80 direto ao container é suficiente e intencional

---

## Comandos de manutenção

| Ação | Comando |
|------|---------|
| Ver logs em tempo real | `docker compose logs -f app` |
| Reiniciar app | `docker compose restart app` |
| Parar tudo | `docker compose down` |
| Parar e remover volume (apaga DB) | `docker compose down -v` |
| Rebuild após mudança de código | `docker compose up -d --build` |
| Acessar shell do container | `docker exec -it leafscan-app sh` |
| Acessar MySQL interativo | `docker exec -it leafscan-mysql mysql -u leafscan_user -p leafscan` |

---

## Relação com os requisitos do trabalho

Este deploy atende aos requisitos acadêmicos de computação em nuvem, containerização e segurança:

| Requisito | Como foi atendido |
|-----------|------------------|
| **Containerização** | A aplicação foi empacotada em uma imagem Docker construída via `Dockerfile` com `node:22-alpine` |
| **Container da aplicação** | O serviço `leafscan-app` executa o Node.js/Express dentro de um container isolado |
| **Container do banco de dados** | O serviço `leafscan-mysql` executa o MySQL 8 em um container separado |
| **Persistência de dados** | O volume Docker nomeado `mysql_data` mantém os dados do banco entre reinicializações |
| **Porta pública única** | Apenas a porta 80 HTTP é exposta ao host e à internet |
| **Banco de dados interno** | O MySQL escuta somente na rede Docker interna (`leafscan-net`); porta 3306 nunca exposta |
| **Segredos por variável de ambiente** | `ANTHROPIC_API_KEY`, `SESSION_SECRET`, `DB_PASSWORD` e `DB_ROOT_PASSWORD` são passados via arquivo `.env`, nunca hardcoded na imagem |
| **Isolamento de rede** | A rede Docker `leafscan-net` (bridge) isola os containers; apenas o `leafscan-app` é alcançável pela porta 80 |
| **Firewall / Security Group** | O UFW no VPS Hostinger age como um Security Group de nuvem: bloqueia todo tráfego de entrada exceto a porta 80 e SSH restrito ao IP do administrador |
| **Inicialização do banco** | O schema é aplicado automaticamente na primeira execução via `/docker-entrypoint-initdb.d/001-schema.sql` |
| **Exposição segura de arquivos estáticos** | O Express serve apenas a pasta `public/`; `server.js`, `db/`, `package.json` e outros arquivos do backend nunca são acessíveis via HTTP |
