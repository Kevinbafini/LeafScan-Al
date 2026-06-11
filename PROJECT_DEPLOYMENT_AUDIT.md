# PROJECT_DEPLOYMENT_AUDIT.md

**LeafScan AI — Auditoria Técnica para Deploy em VPS com Docker**

> Gerado em: 2026-06-11
> Auditor: Claude (Sonnet 4.6) — somente leitura, nenhum arquivo foi modificado.

---

## Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Análise de Pacotes e Scripts](#4-análise-de-pacotes-e-scripts)
5. [Análise do Frontend](#5-análise-do-frontend)
6. [Análise do Backend](#6-análise-do-backend)
7. [Análise do Banco de Dados](#7-análise-do-banco-de-dados)
8. [Análise de Upload e Armazenamento de Imagens](#8-análise-de-upload-e-armazenamento-de-imagens)
9. [Análise de Autenticação e Segurança](#9-análise-de-autenticação-e-segurança)
10. [Variáveis de Ambiente](#10-variáveis-de-ambiente)
11. [Portas e Rede](#11-portas-e-rede)
12. [Premissas para Deploy em Produção](#12-premissas-para-deploy-em-produção)
13. [Arquitetura Docker Recomendada](#13-arquitetura-docker-recomendada)
14. [Problemas a Resolver Antes de Dockerizar](#14-problemas-a-resolver-antes-de-dockerizar)
15. [Arquivos Importantes para a Dockerização](#15-arquivos-importantes-para-a-dockerização)
16. [Próximos Passos Sugeridos](#16-próximos-passos-sugeridos)
17. [Comandos Executados](#17-comandos-executados)

---

## 1. Visão Geral do Projeto

**LeafScan AI** é uma aplicação web full-stack para análise visual de doenças em folhas de plantas cítricas (especialmente limão). O usuário faz upload de uma foto da folha e a plataforma identifica automaticamente a condição da planta usando visão computacional via API da Anthropic (Claude Vision AI).

### Funcionalidades principais

- Upload de imagem de folha (JPG, PNG, WEBP — máx. 10 MB)
- Análise automática pela API Anthropic Claude (modelo claude-3-5-sonnet)
- Classificação em 9 condições de doença pré-definidas (ex: Folha Saudável, Cancro Cítrico, Mancha Preta, Greening dos Citros, etc.)
- Score de confiança e diagnósticos alternativos
- Histórico de análises por usuário, persistido em MySQL
- Autenticação completa (login, registro, recuperação de senha)
- Tema claro/escuro
- Migração automática de histórico antigo do `localStorage` para o banco de dados
- Modo de demonstração com resposta simulada (`DEMO_FALLBACK_ENABLED`)

> **Observação importante:** O `README.md` do repositório está desatualizado — descreve um protótipo puramente frontend com TensorFlow.js e sem backend. O código real é uma aplicação full-stack com Node.js, Express, MySQL e integração com a API da Anthropic. O README deve ser atualizado.

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend Framework** | Nenhum (HTML/CSS/JavaScript puro — sem React, Vue, Angular ou Svelte) |
| **Backend Framework** | Node.js + Express 4 |
| **Banco de Dados** | MySQL (via `mysql2/promise`) |
| **ORM / Query Builder** | Nenhum — SQL puro com `mysql2` |
| **Autenticação** | Sessions com `express-session` + `express-mysql-session` (sessão persistida no MySQL) |
| **Hash de Senha** | `bcryptjs` (12 rounds) |
| **Reset de Senha** | Token SHA-256 gerado com `crypto.randomBytes`, link logado no console (sem e-mail) |
| **Upload / Imagens** | **Sem upload de arquivos em disco.** Imagens recebidas como Base64 via JSON, enviadas direto à API Anthropic. Resultado salvo no banco como Base64/SVG. |
| **Integração de IA** | Anthropic SDK (`@anthropic-ai/sdk ^0.52.0`) — Claude Vision |
| **Rate Limiting** | `express-rate-limit` (login: 10 req/15min; forgot-password: 5 req/hora) |
| **Framework de Estilo** | CSS puro (3.259 linhas) — sem Tailwind, Bootstrap, etc. |
| **Build Tool** | Nenhum (sem Vite, Webpack, Rollup ou similar) |
| **Package Manager** | npm |
| **Versão Node.js requerida** | `>=18.0.0` (detectado no ambiente: v22.22.2) |
| **Versão npm detectada** | 10.9.7 |

---

## 3. Estrutura de Pastas

```
LeafScan-Al/
├── .env.example              # Exemplo de variáveis de ambiente (sem valores reais)
├── .gitignore                # Ignora .env e node_modules
├── package.json              # Definição do projeto Node.js
├── package-lock.json         # Lockfile de dependências
├── README.md                 # DESATUALIZADO — descreve versão frontend-only
│
├── server.js                 # Ponto de entrada do servidor Express (backend + serve estático)
│
├── routes/
│   └── auth.js               # Rotas de autenticação (register, login, logout, me, forgot/reset-password)
│
├── db/
│   ├── database.js           # Pool de conexão MySQL (mysql2/promise)
│   ├── auth.js               # Funções de acesso ao banco para usuários e tokens
│   └── schema.sql            # Esquema completo do banco (criar manualmente antes do deploy)
│
├── index.html                # Frontend — única página HTML (SPA sem framework)
├── script.js                 # Frontend — toda a lógica JS (~1.754 linhas)
├── styles.css                # Frontend — todo o CSS (~3.259 linhas)
│
└── images/
    └── img_planta.png        # Imagem estática de decoração (usada na hero section)
```

> Não existem pastas `dist/`, `build/`, `src/`, `public/` ou subpastas de frontend separado.
> Não existe `node_modules/` commitado (corretamente ignorado).
> Não existem Dockerfiles, docker-compose, nginx.conf ou arquivos de configuração de servidor web.

---

## 4. Análise de Pacotes e Scripts

### Arquivo: `package.json` (raiz — único arquivo no projeto)

**Dependências de produção:**

| Pacote | Versão | Finalidade |
|--------|--------|-----------|
| `@anthropic-ai/sdk` | ^0.52.0 | Integração com Claude Vision AI |
| `bcryptjs` | ^3.0.3 | Hash de senhas |
| `dotenv` | ^16.4.5 | Carregamento de variáveis `.env` |
| `express` | ^4.19.2 | Framework web (API + serve estático) |
| `express-mysql-session` | ^3.0.3 | Store de sessões no MySQL |
| `express-rate-limit` | ^8.5.2 | Rate limiting nas rotas de auth |
| `express-session` | ^1.19.0 | Gerenciamento de sessões HTTP |
| `mysql2` | ^3.22.5 | Driver MySQL (Promises) |

**devDependencies:** Nenhuma.

**Scripts disponíveis:**

```json
{
  "start": "node server.js",
  "dev":   "node --watch server.js"
}
```

| Script | Uso |
|--------|-----|
| `npm start` | Inicia o servidor em produção |
| `npm run dev` | Inicia o servidor em desenvolvimento com hot-reload nativo |

### Tipo de projeto

**Monolito** — não é monorepo. Frontend e backend são servidos pelo mesmo processo Express na mesma porta. Não há separação física entre frontend e backend em pastas distintas com `package.json` individuais.

---

## 5. Análise do Frontend

### Ponto de entrada

- `index.html` — página raiz, servida diretamente pelo Express via `express.static`

### Pasta de saída do build

**Não existe build.** Não há processo de compilação (sem Vite, sem `npm run build`). Os arquivos são servidos estáticos como estão.

### Tipo de roteamento

**Hash/anchor navigation** (SPA sem router de framework) — as seções são controladas com âncoras (`#top`, `#analysis`, `#history`, `#diseases`) e o JavaScript manipula o DOM diretamente.

### URL base da API

**Não há URL base configurada externamente.** Todas as chamadas de API usam **paths relativos**:

```javascript
// Exemplos do script.js
fetch("/api/analyze-image", ...)
fetch("/api/history", ...)
fetch("/auth/login", ...)
fetch("/auth/me")
fetch("/auth/logout", ...)
```

> **Ponto positivo para Docker:** Como todas as chamadas usam paths relativos, o frontend funciona corretamente em qualquer domínio/porta desde que seja servido pelo mesmo servidor Express. Não há necessidade de reconfigurar URLs de API para produção.

### Localhost hardcoded

Não há URLs `http://localhost` hardcoded nas chamadas de API. O único uso de "localhost" no script.js é em uma mensagem de erro de UX para o usuário:

```javascript
// script.js — mensagem de erro amigável (não é URL de API)
"Não foi possível conectar ao servidor. Verifique se o servidor está rodando com 'npm run dev'."
```

> Esta string não afeta o deploy, mas pode confundir usuários de produção e deve ser ajustada.

### Variáveis de ambiente usadas pelo frontend

**Nenhuma.** O frontend é HTML/JS/CSS puro sem processo de build, portanto não existe `VITE_`, `NEXT_PUBLIC_`, `REACT_APP_` ou similar.

### Autenticação no frontend

- Ao carregar, o frontend faz `GET /auth/me` para verificar a sessão ativa
- Se autenticado, exibe a interface principal; se não, exibe o overlay de autenticação
- Após login/registro bem-sucedido, recebe o objeto `user` e armazena em variável em memória (`currentUser`)
- **Sem JWT no frontend** — a autenticação é baseada em cookie de sessão gerenciado pelo navegador

### localStorage / sessionStorage

| Chave | Uso |
|-------|-----|
| `leafscan-ai-history` | Histórico legado (versão anterior do app). Migrado automaticamente para o banco de dados na primeira autenticação e depois removido. |
| `leafscan-theme` | Preferência de tema claro/escuro. Sem informações sensíveis. |

### Páginas / Seções detectadas

| Rota (âncora) | Conteúdo |
|---------------|---------|
| `#top` (default) | Hero / Painel |
| `#analysis` | Upload e análise de imagem |
| `#history` | Histórico de análises |
| `#diseases` | Catálogo de condições detectáveis |
| `/?action=reset&token=<token>` | Tela de redefinição de senha (via query string) |

---

## 6. Análise do Backend

### Ponto de entrada

`server.js` (linha 636: `app.listen(PORT, ...)`)

### Porta do servidor

```javascript
const PORT = process.env.PORT || 3000;
```

Padrão: **3000**. Configurável via variável de ambiente `PORT`.

### Registro de rotas

```javascript
app.use(express.json({ limit: "20mb" }));    // Body parser JSON — limite 20 MB
app.use(session(...))                         // Sessão (MySQL store ou in-memory)
app.use(express.static(path.join(__dirname))) // Serve arquivos estáticos da raiz
app.use("/auth", authRouter)                  // Rotas de autenticação
```

### Grupos de rotas da API

#### Rotas de Autenticação (`/auth` — `routes/auth.js`)

| Método | Rota | Auth requerido | Descrição |
|--------|------|:--------------:|-----------|
| `POST` | `/auth/register` | Não | Cria novo usuário |
| `POST` | `/auth/login` | Não | Autentica usuário (rate-limited: 10/15min) |
| `POST` | `/auth/logout` | Não | Destrói sessão |
| `GET`  | `/auth/me` | Sim | Retorna usuário da sessão atual |
| `POST` | `/auth/forgot-password` | Não | Solicita reset de senha (rate-limited: 5/hora) |
| `POST` | `/auth/reset-password` | Não | Redefine senha com token |

#### Rotas da API (`/api` — `server.js`)

| Método | Rota | Auth requerido | Descrição |
|--------|------|:--------------:|-----------|
| `GET`  | `/api/health` | Não | Health check (status do servidor) |
| `POST` | `/api/analyze-image` | **Sim** | Analisa imagem via Claude API |
| `GET`  | `/api/history` | **Sim** | Lista histórico do usuário |
| `POST` | `/api/history` | **Sim** | Salva entrada no histórico |
| `POST` | `/api/history/migrate` | **Sim** | Migra histórico do localStorage |
| `DELETE` | `/api/history` | **Sim** | Limpa todo o histórico do usuário |
| `DELETE` | `/api/history/:id` | **Sim** | Remove entrada específica do histórico |

### Servindo arquivos estáticos

```javascript
// server.js — linha 330
app.use(express.static(path.join(__dirname)));
```

> **Atenção — Risco de segurança:** `express.static` serve **todos** os arquivos da raiz do projeto, incluindo `server.js`, `package.json`, `db/schema.sql`, `db/database.js` e `db/auth.js`. Em produção, qualquer pessoa pode acessar `http://dominio/server.js` e visualizar o código-fonte do servidor. Isso deve ser corrigido antes do deploy.

### Configuração de CORS

**Não há middleware `cors` instalado ou configurado.** Isso não é um problema operacional pois o frontend e o backend são servidos pela mesma origem (mesmo servidor Express, mesma porta). Não há cross-origin aqui.

> Se no futuro o frontend for separado para um container/domínio diferente, será necessário adicionar CORS.

### Configuração de Cookie/Sessão

```javascript
session({
  key: "leafscan.sid",
  secret: process.env.SESSION_SECRET || "leafscan-dev-secret-CHANGE-IN-PRODUCTION",
  store: sessionStore,           // MySQL store quando DB configurado
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // HTTPS obrigatório em prod
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 dias
  }
})
```

> **Atenção:** O cookie só enviará a flag `Secure` quando `NODE_ENV=production`. Para funcionar corretamente atrás de um reverse proxy com HTTPS, é necessário definir `NODE_ENV=production` no container e possivelmente `app.set('trust proxy', 1)` (ver Seção 14).

### Middleware usado

| Middleware | Fonte |
|-----------|-------|
| `express.json` | Express embutido |
| `express-session` | `express-session` |
| `express-mysql-session` (store) | `express-mysql-session` |
| `express.static` | Express embutido |
| `express-rate-limit` | `express-rate-limit` (apenas em rotas de auth) |
| `requireAuth` | Middleware customizado em `routes/auth.js` |

**Não utilizados:** helmet, morgan, compression, cors.

### Tratamento de erros

Padrão try/catch em cada rota, retornando JSON com `{ success: false, error: "mensagem" }` e HTTP status code adequado. Sem middleware global de erro `app.use((err, req, res, next) => ...)`.

---

## 7. Análise do Banco de Dados

### Tipo

**MySQL** (compatível com MySQL 5.7+ e MySQL 8.x)

### Arquivo de conexão

`db/database.js` — pool de conexões via `mysql2/promise`

```javascript
mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME     || "leafscan",
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
  timezone: "Z"
})
```

### Variáveis de ambiente do banco

| Variável | Padrão | Obrigatório |
|----------|--------|------------|
| `DB_HOST` | `localhost` | Sim (em prod usar nome do container Docker) |
| `DB_PORT` | `3306` | Não (pode omitir se usar 3306) |
| `DB_NAME` | `leafscan` | Sim |
| `DB_USER` | sem padrão | **Obrigatório** |
| `DB_PASSWORD` | sem padrão | Sim (pode ser vazio, mas não recomendado) |

### Arquivo de schema

`db/schema.sql` — deve ser executado manualmente antes do primeiro start em produção.

**Inicialização do banco é MANUAL** — não há migrations automáticas, nem ORM com `sync`. O schema precisa ser aplicado uma única vez:

```bash
mysql -u root -p < db/schema.sql
```

### Tabelas detectadas

#### `users`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(36) | UUID |
| `name` | VARCHAR(100) | Nome do usuário |
| `email` | VARCHAR(254) | E-mail único |
| `password_hash` | VARCHAR(255) | Hash bcrypt |
| `is_active` | TINYINT(1) | Conta ativa |
| `email_verified_at` | DATETIME | Data de verificação (não implementado) |
| `last_login_at` | DATETIME | Último login |
| `created_at` | DATETIME | Data de criação |
| `updated_at` | DATETIME | Data de atualização |

#### `password_reset_tokens`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(36) | UUID |
| `user_id` | VARCHAR(36) | FK para `users` |
| `token_hash` | VARCHAR(64) | SHA-256 do token |
| `expires_at` | DATETIME | Expiração (1 hora) |
| `used_at` | DATETIME | Quando foi usado |
| `created_at` | DATETIME | Data de criação |

#### `sessions`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `session_id` | VARCHAR(128) | ID da sessão |
| `expires` | INT UNSIGNED | Timestamp de expiração |
| `data` | MEDIUMTEXT | Dados da sessão (JSON) |

#### `analyses`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(36) | UUID (gerado no frontend) |
| `user_id` | VARCHAR(36) | FK para `users` |
| `date_time` | DATETIME | Data/hora da análise |
| `predicted_class` | VARCHAR(100) | Classe predita (inglês) |
| `disease_display_name` | VARCHAR(100) | Nome exibido (português) |
| `confidence` | TINYINT UNSIGNED | Score 0–100 |
| `image` | MEDIUMTEXT | Imagem em Base64 ou SVG placeholder |
| `original_file_name` | VARCHAR(255) | Nome do arquivo original |
| `description` | TEXT | Descrição da condição |
| `recommendation` | TEXT | Recomendação de manejo |
| `severity` | VARCHAR(10) | Baixa / Média / Alta |
| `causes` | JSON | Causas identificadas |
| `treatment` | JSON | Tratamentos recomendados |
| `prevention` | JSON | Medidas preventivas |
| `probabilities` | JSON | Probabilidades por classe |
| `fallback` | TINYINT(1) | Se usou resposta de fallback |
| `created_at` | DATETIME | Data de criação |

### Seed files

**Não existem** arquivos de seed.

---

## 8. Análise de Upload e Armazenamento de Imagens

### Forma de envio

As imagens **não são enviadas como arquivos** (multipart/form-data). O fluxo é:

1. Usuário seleciona imagem no browser
2. O JavaScript converte para Base64 no próprio browser (via `FileReader`)
3. A string Base64 é enviada ao backend como JSON: `{ imageBase64, mimeType }`
4. O backend recebe via `express.json` (limite: **20 MB**) e passa diretamente à API Anthropic
5. A imagem em Base64 é armazenada no campo `analyses.image` (MEDIUMTEXT) no MySQL

### Não existe

- Pasta `uploads/` no servidor
- Pacote `multer` ou similar
- Armazenamento em disco de imagens enviadas
- Integração com S3, GCS ou outro storage externo

### Imagem estática

A única imagem em disco é `images/img_planta.png` (decorativa, 2,4 MB), servida pelo `express.static`.

### Volume Docker necessário

**Nenhum volume Docker é necessário para imagens de upload.** As imagens são armazenadas no banco MySQL.

> **Atenção:** Como `analyses.image` é MEDIUMTEXT e armazena Base64, imagens podem ocupar até ~13 MB por registro no banco. Isso pode tornar o banco de dados grande rapidamente em produção com uso intenso. Considerar migrar para storage externo no futuro.

### Tipos aceitos

| Tipo MIME | Suportado |
|-----------|-----------|
| `image/jpeg` | Sim |
| `image/png` | Sim |
| `image/webp` | Sim |

### Limite de tamanho

- **Frontend:** 10 MB (`MAX_FILE_SIZE = 10 * 1024 * 1024`)
- **Backend:** 10 MB na validação (`MAX_IMAGE_BYTES = 10 * 1024 * 1024`)
- **Express body-parser:** 20 MB (`express.json({ limit: "20mb" })`)

> Em Nginx/Apache como proxy reverso, o `client_max_body_size` deve ser configurado para pelo menos **25m** (Base64 aumenta o tamanho em ~33%).

---

## 9. Análise de Autenticação e Segurança

### Rotas de login/registro

| Rota | Método | Rate Limit |
|------|--------|-----------|
| `POST /auth/register` | Criação de conta | Sem rate limit |
| `POST /auth/login` | Login | 10 req / 15 min por IP |
| `POST /auth/logout` | Logout | Sem rate limit |
| `GET /auth/me` | Verifica sessão | Sem rate limit |
| `POST /auth/forgot-password` | Solicita reset | 5 req / hora por IP |
| `POST /auth/reset-password` | Redefine senha | Sem rate limit |

### Hash de senha

`bcryptjs` com **12 rounds**. Proteção contra timing attacks implementada: sempre roda `bcrypt.compare` mesmo quando o usuário não existe (usando `DUMMY_HASH`).

### JWT / Session / Cookie

- **Sem JWT.** Autenticação via sessão server-side (cookie).
- Cookie: `leafscan.sid` (httpOnly, sameSite: strict)
- Flag `Secure` ativada quando `NODE_ENV === "production"`
- Sessão armazenada no MySQL (tabela `sessions`), expiração de **7 dias**

### Onde tokens são armazenados

- **Frontend:** Nenhum token é armazenado. O browser gerencia o cookie de sessão automaticamente.
- **Backend:** ID da sessão no cookie; dados da sessão no MySQL.

### Recuperação de senha

- Gera token com `crypto.randomBytes(32)`, armazena o hash SHA-256 no banco
- **Não há integração com e-mail.** O link de reset é logado apenas no console do servidor:
  ```
  [Auth] Reset link (copy and send to user): http://dominio/?action=reset&token=...
  ```
- Em produção, o administrador precisa ler os logs para enviar o link manualmente.

### Configurações de CORS

**Sem CORS configurado** — não é necessário no estado atual (mesmo servidor para frontend e backend).

### Variáveis sensíveis

| Variável | Risco em produção |
|----------|------------------|
| `ANTHROPIC_API_KEY` | ***REDACTED*** — exposta = cobrança não autorizada na conta Anthropic |
| `SESSION_SECRET` | ***REDACTED*** — fraco em dev: `"leafscan-dev-secret-CHANGE-IN-PRODUCTION"` |
| `DB_PASSWORD` | ***REDACTED*** — sem padrão, mas pode estar vazia |

### Riscos de segurança identificados

1. **`express.static` expõe código-fonte:** `server.js`, `db/schema.sql`, `db/database.js` e `db/auth.js` são acessíveis publicamente via HTTP (ex: `http://dominio/server.js`). Deve ser corrigido antes do deploy.

2. **`SESSION_SECRET` fraco como fallback:** Se `SESSION_SECRET` não estiver definido, usa `"leafscan-dev-secret-CHANGE-IN-PRODUCTION"`. Definir obrigatoriamente em produção.

3. **`trust proxy` não configurado:** O `express-rate-limit` usa o IP do cliente, mas por trás de um Nginx/proxy o IP real virá no header `X-Forwarded-For`. Sem `app.set('trust proxy', 1)`, o rate limiting pode ser contornado ou aplicado incorretamente.

4. **`NODE_ENV` não definido por padrão:** O cookie de sessão não terá a flag `Secure` a menos que `NODE_ENV=production` seja definido explicitamente.

5. **`express.json` com limite 20 MB:** Pode facilitar ataques de DoS por payload grande. Considerar reduzir ou adicionar verificação de autenticação antes do body-parser nas rotas de análise.

6. **Sem `helmet`:** Sem headers HTTP de segurança (CSP, HSTS, X-Frame-Options, etc.).

7. **Sem verificação de e-mail:** A coluna `email_verified_at` existe no schema, mas não é usada. Qualquer e-mail pode ser registrado sem verificação.

---

## 10. Variáveis de Ambiente

Lista completa de variáveis de ambiente usadas pelo projeto:

| Variável | Usado por | Arquivo de referência | Finalidade | Obrigatório em prod | Exemplo seguro |
|----------|-----------|----------------------|-----------|:-------------------:|----------------|
| `ANTHROPIC_API_KEY` | Backend | `server.js:376` | Chave de API da Anthropic para Claude Vision | **Sim** | `sk-ant-api03-...` (***REDACTED***) |
| `ANTHROPIC_MODEL` | Backend | `server.js:12` | Modelo Claude a usar | Não | `claude-3-5-sonnet-latest` |
| `PORT` | Backend | `server.js:11` | Porta do servidor Express | Não | `3000` |
| `DEMO_FALLBACK_ENABLED` | Backend | `server.js:13` | Ativa resposta simulada em caso de erro de quota | Não | `false` |
| `DB_HOST` | Backend | `db/database.js:8` | Host do MySQL | **Sim** | `mysql` (nome do container Docker) |
| `DB_PORT` | Backend | `db/database.js:9` | Porta do MySQL | Não | `3306` |
| `DB_NAME` | Backend | `db/database.js:10` | Nome do banco de dados | **Sim** | `leafscan` |
| `DB_USER` | Backend | `db/database.js:11` | Usuário do MySQL | **Sim** | `leafscan_user` |
| `DB_PASSWORD` | Backend | `db/database.js:12` | Senha do MySQL | **Sim** | `***REDACTED***` |
| `SESSION_SECRET` | Backend | `server.js:305` | Segredo para assinar cookies de sessão | **Sim** | Gere com: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `APP_URL` | Backend | `routes/auth.js:163` | URL base para links de reset de senha | **Sim** | `https://seudominio.com` |
| `NODE_ENV` | Backend | `server.js:311` | Ativa cookie `Secure` e comportamento de produção | **Sim** | `production` |

> **Nota:** Nenhuma variável de ambiente é necessária no frontend (sem processo de build).

---

## 11. Portas e Rede

| Serviço | Porta padrão | Exposição recomendada |
|---------|:------------:|----------------------|
| Express (backend + frontend) | `3000` | **Interna** ao Docker — acessada apenas pelo Nginx |
| MySQL | `3306` | **Interna** ao Docker — nunca expor ao público |
| Nginx reverse proxy | `80` (HTTP) | **Pública** — redireciona para HTTPS |
| Nginx reverse proxy | `443` (HTTPS) | **Pública** — termina SSL, proxy para Express |

### Portas que devem ser expostas publicamente no VPS

- **Porta 80** — para redirect HTTP → HTTPS (ou acesso direto se sem HTTPS)
- **Porta 443** — para HTTPS em produção real

### Portas que devem permanecer internas no Docker

- **Porta 3000** — Express: acessível apenas dentro da rede Docker interna
- **Porta 3306** — MySQL: nunca expor ao host ou à internet

---

## 12. Premissas para Deploy em Produção

Baseado na análise do projeto, as seguintes premissas se aplicam ao deploy em VPS com Docker:

1. **Arquitetura monolítica — um único container Node.js** serve tanto o frontend estático quanto as rotas de API. Não é necessário um container separado de frontend (sem Nginx ou Apache para servir arquivos estáticos do frontend).

2. **Nginx como reverse proxy** deve ser configurado na frente do Express para:
   - Terminar SSL/TLS (HTTPS)
   - Repassar requisições à porta 3000 (Express)
   - Definir `proxy_set_header X-Forwarded-For` e `X-Forwarded-Proto` (necessário para cookies `Secure` e rate limiting correto)
   - Limitar `client_max_body_size` para pelo menos 25 MB

3. **MySQL como container interno** — nunca exposto ao público.

4. **Schema deve ser aplicado manualmente** antes do primeiro start:
   ```bash
   docker exec -i mysql_container mysql -u root -p leafscan < db/schema.sql
   ```
   Ou via `docker compose exec`.

5. **Volumes Docker:**
   - `mysql_data` — para persistência do banco de dados (obrigatório)
   - **Nenhum volume para uploads** (imagens armazenadas no MySQL)

6. **Variáveis de ambiente** devem ser fornecidas via arquivo `.env` ou secrets do Docker.

7. **`NODE_ENV=production`** deve ser definido no container para ativar cookies seguros.

8. **`trust proxy`** deve ser configurado no Express para o rate limiting funcionar corretamente atrás do Nginx.

---

## 13. Arquitetura Docker Recomendada

> Apenas recomendação — sem criar arquivos ainda.

### Containers

```
┌─────────────────────────────────────────────────────────┐
│                     VPS (Públic)                        │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Docker Network: leafscan-net         │  │
│  │                                                   │  │
│  │  ┌─────────────┐    ┌──────────────────────────┐  │  │
│  │  │   nginx     │    │   leafscan-app           │  │  │
│  │  │  :80 / :443 │───▶│   Node.js :3000          │  │  │
│  │  │  (público)  │    │   (Express + static)     │  │  │
│  │  └─────────────┘    └──────────────────────────┘  │  │
│  │         │                        │                 │  │
│  │         │                        ▼                 │  │
│  │         │           ┌──────────────────────────┐  │  │
│  │         │           │   leafscan-mysql          │  │  │
│  │         │           │   MySQL 8 :3306           │  │  │
│  │         │           │   (interno apenas)        │  │  │
│  │         │           └──────────────────────────┘  │  │
│  │         │                        │                 │  │
│  │         │           ┌──────────────────────────┐  │  │
│  │         │           │   Volume: mysql_data      │  │  │
│  │         │           │   (persistência do banco) │  │  │
│  │         │           └──────────────────────────┘  │  │
│  └─────────┼───────────────────────────────────────┘  │  │
│            │                                           │
└────────────┼───────────────────────────────────────────┘
             │
         Internet
```

### Serviços sugeridos

| Serviço | Imagem base | Portas |
|---------|-------------|--------|
| `nginx` | `nginx:alpine` | `80:80`, `443:443` (públicas) |
| `leafscan-app` | `node:22-alpine` | `3000` (interna) |
| `leafscan-mysql` | `mysql:8` | `3306` (interna) |

### Volumes

| Volume | Montado em | Finalidade |
|--------|-----------|-----------|
| `mysql_data` | `/var/lib/mysql` no container MySQL | Persistir dados do banco |
| `nginx_certs` | `/etc/nginx/certs` no container Nginx | Certificados SSL |

### Rede Docker

- Rede interna: `leafscan-net` (bridge)
- Todos os containers nesta rede
- Apenas as portas 80/443 do Nginx expostas ao host

### Variáveis de ambiente no container `leafscan-app`

```env
NODE_ENV=production
PORT=3000
ANTHROPIC_API_KEY=***REDACTED***
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
DEMO_FALLBACK_ENABLED=false
DB_HOST=leafscan-mysql        # Nome do container MySQL na rede Docker
DB_PORT=3306
DB_NAME=leafscan
DB_USER=leafscan_user
DB_PASSWORD=***REDACTED***
SESSION_SECRET=***REDACTED***
APP_URL=https://seudominio.com
```

### Healthchecks sugeridos

- **MySQL:** `mysqladmin ping -h localhost --silent`
- **Express:** `curl -f http://localhost:3000/api/health || exit 1`
- **Nginx:** depende do upstream (após Express estar healthy)

---

## 14. Problemas a Resolver Antes de Dockerizar

### 🔴 Crítico (blockers)

1. **`express.static` expõe código-fonte do servidor**
   - `server.js`, `db/schema.sql`, `db/auth.js`, `db/database.js` e `package.json` são servidos publicamente como arquivos estáticos
   - Qualquer usuário pode acessar `http://dominio/server.js`
   - **Solução:** Mover os arquivos estáticos do frontend para uma subpasta `public/` e alterar o `express.static` para apontar apenas para ela:
     ```javascript
     app.use(express.static(path.join(__dirname, 'public')));
     ```
   - Ou adicionar regras para bloquear rotas de arquivos sensíveis

2. **`SESSION_SECRET` inseguro como fallback**
   - Se `SESSION_SECRET` não for definido, o Express usa `"leafscan-dev-secret-CHANGE-IN-PRODUCTION"`, que é público e previsível
   - **Solução:** Sempre definir `SESSION_SECRET` como variável de ambiente obrigatória; considerar lançar erro e encerrar o processo se não estiver definida

3. **Schema do banco não é aplicado automaticamente**
   - Sem migrations automáticas, o banco precisa ser inicializado manualmente antes do primeiro start
   - **Solução:** Adicionar um script de inicialização ou usar `docker compose --depends-on` com healthcheck + script de init que execute `schema.sql`

### 🟡 Importante (riscos em produção)

4. **`app.set('trust proxy', 1)` ausente**
   - Por trás de Nginx, o IP do cliente virá no header `X-Forwarded-For`
   - Sem `trust proxy`, o `express-rate-limit` verá o IP do Nginx (sempre o mesmo), o que invalida o rate limiting por IP
   - **Solução:** Adicionar `app.set('trust proxy', 1)` antes de qualquer middleware em `server.js`

5. **`NODE_ENV` não definido por padrão**
   - Cookies de sessão não terão flag `Secure` até `NODE_ENV=production` ser definido
   - Em produção com HTTPS, sessões podem ser enviadas em requisições HTTP (inseguro)
   - **Solução:** Definir `NODE_ENV=production` no `.env` de produção e no Dockerfile/docker-compose

6. **Sem integração de e-mail para reset de senha**
   - O link de recuperação de senha só é logado no console do servidor
   - Em produção, os usuários não conseguirão recuperar senhas sem intervenção manual do administrador
   - **Solução:** Integrar SMTP (Nodemailer + Gmail, SendGrid, Resend, etc.) ou documentar claramente o processo manual

7. **Sem middleware de segurança HTTP (`helmet`)**
   - Sem headers como Content-Security-Policy, X-Frame-Options, HSTS, X-Content-Type-Options
   - **Solução:** Adicionar `helmet` como dependência e `app.use(helmet())` no início do middleware chain

8. **Ausência de `.env.example` com todos os campos**
   - O `.env.example` existe mas não inclui `NODE_ENV`
   - **Solução:** Adicionar `NODE_ENV=production` ao `.env.example`

9. **Limite de body parser de 20 MB sem autenticação**
   - `express.json({ limit: "20mb" })` é aplicado globalmente, antes da autenticação
   - Usuários não autenticados podem enviar payloads de 20 MB, consumindo memória
   - **Solução:** Aplicar limites menores nas rotas públicas

10. **Mensagem de erro do frontend menciona `npm run dev`**
    - `"Verifique se o servidor está rodando com 'npm run dev'"` aparece para usuários de produção
    - Não é um blocker funcional, mas é ruim para UX em produção

11. **README desatualizado**
    - Descreve o projeto como frontend-only com TensorFlow.js e sem backend
    - Pode confundir novos contribuidores e administradores
    - **Solução:** Atualizar o README para refletir a arquitetura real

---

## 15. Arquivos Importantes para a Dockerização

| Arquivo | Importância | Motivo |
|---------|:-----------:|--------|
| `package.json` | ⭐⭐⭐ | Dependências, scripts de start |
| `server.js` | ⭐⭐⭐ | Entry point, porta, middleware, todas as rotas da API |
| `routes/auth.js` | ⭐⭐⭐ | Rotas de autenticação, rate limiting |
| `db/database.js` | ⭐⭐⭐ | Conexão MySQL, variáveis de ambiente do banco |
| `db/schema.sql` | ⭐⭐⭐ | Schema completo — deve ser executado na inicialização |
| `db/auth.js` | ⭐⭐ | Funções de acesso ao banco |
| `.env.example` | ⭐⭐⭐ | Template para as variáveis de ambiente de produção |
| `.gitignore` | ⭐ | Confirmar que `.env` não está commitado |
| `index.html` | ⭐⭐ | Ponto de entrada do frontend |
| `script.js` | ⭐⭐ | Lógica do frontend, todas as chamadas de API |
| `images/img_planta.png` | ⭐ | Asset estático — deve estar presente no container |

**Arquivos que NÃO existem mas serão necessários:**

| Arquivo | Motivo |
|---------|--------|
| `Dockerfile` | Build do container Node.js |
| `docker-compose.yml` | Orquestração de todos os serviços |
| `.dockerignore` | Excluir `node_modules`, `.env`, `.git` da imagem |
| `nginx/nginx.conf` | Configuração do reverse proxy |
| `.env.production` | Variáveis de ambiente reais (nunca commitado) |

---

## 16. Próximos Passos Sugeridos

### Fase 1 — Corrigir blockers antes de dockerizar

1. **Isolar arquivos estáticos:** Mover `index.html`, `script.js`, `styles.css` e `images/` para uma subpasta `public/` e atualizar `express.static` para servir apenas essa pasta.

2. **Adicionar `trust proxy`:** Adicionar `app.set('trust proxy', 1)` logo após criar o `app` em `server.js`.

3. **Tornar `SESSION_SECRET` obrigatório:** Adicionar verificação no início de `server.js`:
   ```javascript
   if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET é obrigatório em produção");
   ```

4. **Adicionar `NODE_ENV` ao `.env.example`.**

5. **Corrigir mensagem de erro de conexão** no `script.js` para não mencionar `npm run dev`.

### Fase 2 — Criar arquivos Docker

6. **Criar `.dockerignore`** — excluir `node_modules`, `.env`, `.git`, `*.md`.

7. **Criar `Dockerfile`** para o container Node.js:
   - Base: `node:22-alpine`
   - Copiar apenas o necessário (sem code-source sensível se isolado em `public/`)
   - `npm ci --omit=dev` para instalar apenas dependências de produção
   - `CMD ["node", "server.js"]`

8. **Criar `docker-compose.yml`** com os 3 serviços: `leafscan-app`, `leafscan-mysql`, `nginx`.

9. **Criar `nginx/nginx.conf`** com:
   - `proxy_pass http://leafscan-app:3000`
   - `client_max_body_size 25m`
   - Headers `X-Forwarded-For` e `X-Forwarded-Proto`
   - Configuração SSL (Let's Encrypt / Certbot)

### Fase 3 — Deploy no VPS

10. **Aplicar o schema do banco** na primeira execução:
    ```bash
    docker compose exec leafscan-mysql mysql -u root -p < db/schema.sql
    ```

11. **Configurar SSL** com Certbot/Let's Encrypt no container Nginx ou no host.

12. **Testar o health check:** `GET /api/health` deve retornar `ok: true`.

13. **Monitorar logs** para confirmar que sessões e análises estão sendo salvas corretamente.

14. **(Opcional) Integrar envio de e-mail** para recuperação de senha (Nodemailer + Resend/SendGrid).

---

## 17. Comandos Executados

Todos os comandos foram somente de leitura — nenhum arquivo foi modificado ou criado durante a auditoria (exceto este relatório).

```bash
# Estrutura do projeto
pwd
ls -la
find /Users/kevinluz/projects/LeafScan-Al -maxdepth 5 -type f \
  | grep -v node_modules | grep -v ".git/" | grep -v "dist/" | grep -v "build/" | sort

# Arquivos de configuração e ambiente
# (Read tool) package.json
# (Read tool) .env.example
# (Read tool) .gitignore

# Backend
# (Read tool) server.js
# (Read tool) db/database.js
# (Read tool) db/schema.sql
# (Read tool) db/auth.js
# (Read tool) routes/auth.js
# (Read tool) README.md

# Frontend
# (Read tool) index.html (primeiras 100 linhas + linhas 430-480)
# (Read tool) script.js (múltiplos offsets: 1-150, 480-560, 700-820, 1330-1410, 1490-1530)

# Buscas por padrões relevantes
grep -n "fetch|axios|localhost|/api|/auth|localStorage|sessionStorage|VITE_|process.env" script.js
grep -n "fetch|axios|localhost|/api|/auth|localStorage|sessionStorage" index.html
grep -n "app.use|cors|CORS|rate.limit|multer|upload|static|process.env|cookie" server.js
grep -n "HISTORY_KEY|THEME_KEY|localStorage" script.js
grep -n "trust proxy|trustProxy|proxy" server.js routes/auth.js
grep -n "helmet|hpp|morgan|compression|pm2|cluster" server.js package.json
grep -rn "NODE_ENV" server.js routes/auth.js

# Metadados
wc -l script.js index.html styles.css server.js
ls -la images/
node --version
npm --version

# Busca por arquivos Docker/web server (retornou vazio — não existem)
find . -name "Dockerfile*" -o -name "docker-compose*" -o -name ".dockerignore" -o -name "nginx.conf"

# Busca por arquivos .env existentes
find . -name "*.env*" | grep -v node_modules | grep -v .git
```

---

*Auditoria concluída. Nenhum arquivo foi modificado. Apenas leitura e análise.*
