# Publicação: Netlify (frontend) + Render (backend Node.js)

O frontend (React/Vite) é estático e vai para o **Netlify**. O backend (`server.ts`, Express + SQLite via `node:sqlite`) roda no **Render** com o runtime **Node nativo** (sem Docker). O Node precisa ser **22.13 ou superior**.

## 1. Backend no Render

Configurações do Web Service (ou use o `render.yaml` deste repositório como Blueprint):

| Campo | Valor |
|---|---|
| Language / Runtime | **Node** (não Docker) |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

Variáveis de ambiente:

| Variável | Valor |
|---|---|
| `NODE_VERSION` | `22` |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | URL real do Netlify, ex.: `https://seu-site.netlify.app` (sem barra final) |
| `ADMIN_INITIAL_EMAIL` | e-mail do administrador |
| `ADMIN_INITIAL_PASSWORD` | ignorado: a senha do admin é fixa (1234) |
| `ADMIN_INITIAL_NAME` | opcional |
| `DATA_DIR` | somente se usar Disk persistente, ex.: `/var/data` |

Não defina `PORT`: o Render injeta a porta e o servidor já escuta em `0.0.0.0`.
`ADMIN_INITIAL_*` só valem na primeira inicialização (quando ainda não existe administrador no banco).

> **Persistência:** o plano gratuito do Render tem disco efêmero. O banco SQLite (admin, vídeos, planos, sessões) é recriado a cada deploy/reinício. Para manter os dados, use um plano pago com **Disk** (mount path `/var/data`) e `DATA_DIR=/var/data`.

Teste: abra `https://SEU-BACKEND.onrender.com/api/health` e confira o JSON `{"status":"ok",...}`.

## 2. Frontend no Netlify

1. Em **Site configuration → Environment variables**, crie `VITE_API_URL` = URL do backend no Render (ex.: `https://omeflash-api.onrender.com`). Barra final ou `/api` no fim são normalizados.
2. Faça um novo deploy (**Deploys → Trigger deploy → Clear cache and deploy site**). O Vite grava o valor no build, então alterar a variável sem novo deploy não tem efeito.
3. Build: `npm run build`, publicação: `dist` (já em `netlify.toml`).

## 3. Segurança

- Nunca versione `.env` nem a pasta `data/` (ambos estão no `.gitignore`).
- Troque a senha do admin se algum dia usou `admin123456` em um ambiente público.
