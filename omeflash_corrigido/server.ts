import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/auth';
import videoRoutes from './server/routes/videos';
import planRoutes from './server/routes/plans';
import adminRoutes from './server/routes/admin';
import subscriberRoutes from './server/routes/subscribers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing middlewares - CRITICAL for JSON & form data
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static files in /public (images, etc.)
  app.use('/images', express.static(path.join(__dirname, 'public/images')));
  app.use(express.static(path.join(__dirname, 'public')));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/videos', videoRoutes);
  app.use('/api/plans', planRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/subscribers', subscriberRoutes);

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'omeflash-api', time: new Date().toISOString() });
  });

  // Return clean JSON 404 for unmatched API routes
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'Endpoint da API não encontrado (404)' });
  });

  if (!isProd) {
    // Vite middleware for development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 OmeFlash server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
