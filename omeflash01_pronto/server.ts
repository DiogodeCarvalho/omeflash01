import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import fs from 'node:fs';
import { initDatabase } from './server/db.ts';
import { seedAdmin } from './server/seed.ts';
import { authRouter } from './server/routes/auth.ts';
import { adminRouter } from './server/routes/admin.ts';
import { publicVideosRouter } from './server/routes/videos.ts';
import { publicPlansRouter } from './server/routes/plans.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Em produção (Render), o backend roda isolado e o frontend fica no Netlify.
// CORS_ORIGIN deve conter a URL real do Netlify (várias origens separadas por vírgula).
if (isProduction && !process.env.CORS_ORIGIN) {
  console.warn('[Server] AVISO: CORS_ORIGIN não definido em produção. Defina a URL do frontend (Netlify).');
}

// Inicializa banco de dados e cria primeiro administrador caso ainda não exista
initDatabase();
seedAdmin(false);

// Middlewares essenciais e CORS robusto para produção cross-origin (Netlify -> Backend)
app.use((req, res, next) => {
  const corsEnv = process.env.CORS_ORIGIN || '*';
  // Remove espaços e barras finais (o header Origin do navegador nunca tem barra final)
  const allowedOrigins = corsEnv.split(',').map((o) => o.trim().replace(/\/+$/, '')).filter(Boolean);
  const requestOrigin = req.headers.origin;

  if (corsEnv === '*' || allowedOrigins.includes('*')) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  } else if (allowedOrigins.length > 0 && allowedOrigins[0]) {
    res.header('Access-Control-Allow-Origin', allowedOrigins[0]);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', publicVideosRouter);
app.use('/api', publicPlansRouter);

// Rota de saúde/status da API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vortex Stream Platform API',
  });
});

// Captura qualquer rota sob /api/* não mapeada e responde com JSON 404 explícito
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `Endpoint '${req.method} ${req.originalUrl}' não encontrado na API.`,
  });
});

// Integração com Vite (modo desenvolvimento) ou arquivos estáticos gerados (modo produção)
if (!isProduction) {
  // Import dinâmico: o Vite só é carregado em desenvolvimento
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    // Deploy "tudo em um" (frontend compilado servido pelo próprio Express)
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Backend isolado (Render): o frontend está hospedado no Netlify
    app.get('/', (_req, res) => {
      res.json({ status: 'ok', message: 'API em execução. Use /api/health para verificar o status.' });
    });
    app.use((_req, res) => {
      res.status(404).json({ error: 'Rota não encontrada.' });
    });
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Vortex Stream em execução na porta ${PORT} (${isProduction ? 'production' : 'development'})`);
});
