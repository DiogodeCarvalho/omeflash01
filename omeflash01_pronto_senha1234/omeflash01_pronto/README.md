# Vortex Stream — Plataforma de Streaming de Vídeos

## ETAPA 1 & ETAPA 2 — Catálogo de Vídeos, Painel Administrativo & Sistema de Planos de Assinatura

Este projeto representa a fundação técnica e comercial completa de uma plataforma de streaming com catálogo de vídeos, sistema administrativo e gestão de planos de assinatura.

- **Etapa 1**: Fundação técnica, banco de dados SQLite relacional, autenticação segura para administradores e CRUD completo de vídeos.
- **Etapa 2**: Sistema de planos de assinatura, tabela `plans` estruturada para gateways futuros, painel administrativo de planos (CRUD, ativação, ordenação e destaque) e página pública de preços em `/planos`.

---

## 1. Stack Tecnológica

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Node.js (v22), Express.js API, TypeScript (`tsx`).
- **Banco de Dados**: SQLite Relacional via módulo nativo `node:sqlite` (armazenado em `data/platform.db`, persistente entre reinicializações).
- **Criptografia & Sessão**: Hash scrypt com salt de 16 bytes e 64-byte key length (`node:crypto`), comparação em tempo constante (`crypto.timingSafeEqual`), sessões ativas persistidas na tabela `sessions`.

---

## 2. Estrutura do Banco de Dados Relacional

O banco de dados contém as seguintes tabelas relacionais:

### Tabela `users` (Administradores / Usuários com perfil admin)
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `uuid`: TEXT UNIQUE NOT NULL (UUID v4)
- `name`: TEXT NOT NULL
- `email`: TEXT UNIQUE NOT NULL (COLLATE NOCASE)
- `password_hash`: TEXT NOT NULL (Hash criptográfico scrypt)
- `salt`: TEXT NOT NULL (Salt aleatório de 16 bytes)
- `role`: TEXT NOT NULL DEFAULT 'admin'
- `created_at`: TEXT NOT NULL (ISO 8601)
- `updated_at`: TEXT NOT NULL (ISO 8601)

### Tabela `sessions` (Tokens de Sessão com Expiração)
- `token`: TEXT PRIMARY KEY (Token criptográfico de 32 bytes)
- `user_id`: INTEGER NOT NULL (Chave estrangeira para `users(id)` com `ON DELETE CASCADE`)
- `expires_at`: TEXT NOT NULL (Validade de 24 horas)
- `created_at`: TEXT NOT NULL

### Tabela `videos` (Gerenciamento do Catálogo)
- `id`: TEXT PRIMARY KEY (UUID v4)
- `title`: TEXT NOT NULL (Título do vídeo)
- `description`: TEXT NOT NULL (Descrição detalhada)
- `video_url`: TEXT NOT NULL (URL ou referência do arquivo de vídeo)
- `thumbnail_url`: TEXT NOT NULL (URL da imagem de capa)
- `category`: TEXT NOT NULL (Categoria do vídeo)
- `duration`: TEXT NOT NULL (Duração, ex: '14:20')
- `status`: TEXT NOT NULL CHECK(status IN ('published', 'draft'))
- `created_at`: TEXT NOT NULL (Data de cadastro)
- `updated_at`: TEXT NOT NULL (Data da última modificação)
- `created_by`: INTEGER (Chave estrangeira para `users(id)`)

### Tabela `plans` (Planos de Assinatura Comercial - Etapa 2)
- `id`: TEXT PRIMARY KEY (UUID v4)
- `name`: TEXT NOT NULL (Nome do plano)
- `description`: TEXT NOT NULL (Descrição do plano)
- `price_in_cents`: INTEGER NOT NULL (Valor monetário exato em centavos para evitar erros de ponto flutuante)
- `currency`: TEXT NOT NULL DEFAULT 'BRL' (Moeda explícita: BRL, USD, EUR)
- `billing_interval`: TEXT NOT NULL CHECK(billing_interval IN ('month', 'quarter', 'semester', 'year'))
- `interval_count`: INTEGER NOT NULL DEFAULT 1 (Periodicidade configurável)
- `benefits`: TEXT NOT NULL (Array JSON de benefícios)
- `status`: TEXT NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'active'
- `is_featured`: INTEGER NOT NULL DEFAULT 0 (1 para plano em destaque/recomendado)
- `auto_renewal`: INTEGER NOT NULL DEFAULT 1 (1 para renovação automática)
- `sort_order`: INTEGER NOT NULL DEFAULT 0 (Ordem de exibição no catálogo de preços)
- `created_at`: TEXT NOT NULL
- `updated_at`: TEXT NOT NULL
- `created_by`: INTEGER (Chave estrangeira para `users(id)`)

---

## 3. Autenticação e Segurança Administrativa

- O painel `/admin` é estritamente protegido. Visitantes sem token de sessão válido são barrados e direcionados para a tela de login.
- O login (`POST /api/auth/login`) valida e-mail e senha no servidor usando comparação em tempo constante.
- Todas as rotas administrativas (`/api/admin/*`) exigem o header `Authorization: Bearer <token>`, validando a sessão ativa no banco de dados e verificando se o usuário possui `role = 'admin'`.
- O botão de saída (`POST /api/auth/logout`) revoga e remove a sessão imediatamente do banco.
- Exclusões de vídeos exigem confirmação explícita em modal próprio antes de qualquer remoção do banco.

---

## 4. Variáveis de Ambiente (`.env`)

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Variáveis disponíveis:
```env
PORT=3000
NODE_ENV=development
ADMIN_INITIAL_EMAIL=admin@vortexstream.com
ADMIN_INITIAL_PASSWORD=1234
ADMIN_INITIAL_NAME="Administrador Geral"
SESSION_SECRET=troque-por-uma-chave-secreta-forte-em-producao
```

---

## 5. Como Executar Localmente

### Pré-requisitos
- Node.js versão 22 ou superior
- npm

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Inicializar o banco de dados e primeiro administrador
Execute o script de seed:
```bash
npm run seed:admin
```
*Obs: O servidor também executa automaticamente essa inicialização na primeira vez que for iniciado caso a tabela de usuários esteja vazia.*

### Passo 3: Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Acesse:
- **Página Inicial Pública**: `http://localhost:3000/`
- **Painel Administrativo**: `http://localhost:3000/admin`

Credenciais padrão do primeiro administrador:
- **Senha**: `1234`

---

## 6. Funcionalidades do CRUD de Vídeos no Painel

1. **Cadastrar vídeo**: Título, descrição, URL do vídeo, URL da miniatura (com preview em tempo real), categoria, duração e status (Publicado ou Rascunho).
2. **Listar vídeos**: Tabela completa com paginação e ordenação por data de cadastro.
3. **Pesquisar vídeos**: Busca em tempo real por título ou descrição.
4. **Filtrar**: Filtro por status (Todos, Publicados, Rascunhos) e por categorias.
5. **Editar**: Atualização de todos os campos com atualização automática do timestamp `updated_at`.
6. **Alternar status**: Alternância rápida de publicação (Publicado ↔ Rascunho) com um clique na tabela.
7. **Excluir**: Exclusão segura com modal de confirmação irreversível.
8. **Visualizar detalhes**: Modal com exibição de UUID, datas de criação e atualização, criador e teste do player.
