import { Router, Request, Response } from 'express';
import { db, saveDb } from '../db';
import { authenticateToken } from '../auth';
import { Video } from '../../src/types';

const router = Router();

// GET /api/videos - List all videos
router.get('/', (_req: Request, res: Response) => {
  return res.json(db.videos);
});

// GET /api/videos/:id - Get single video
router.get('/:id', (req: Request, res: Response) => {
  const video = db.videos.find((v) => v.id === req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Vídeo não encontrado' });
  }
  return res.json(video);
});

// POST /api/videos - Create video / post (Protected)
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const { title, description, category, videoUrl, thumbnailUrl, duration, isPremium, tags } = req.body || {};

  if (!title || !videoUrl) {
    return res.status(400).json({ error: 'Título e URL do vídeo são obrigatórios.' });
  }

  const newVideo: Video = {
    id: `vid_${Date.now()}`,
    title: title.toString().trim(),
    description: (description || '').toString().trim(),
    category: (category || 'Geral').toString(),
    videoUrl: videoUrl.toString().trim(),
    thumbnailUrl: (thumbnailUrl || '/images/omeflash_hero_connection.jpg').toString().trim(),
    duration: (duration || '10:00').toString().trim(),
    views: 0,
    isPremium: Boolean(isPremium),
    createdAt: new Date().toISOString().split('T')[0],
    tags: Array.isArray(tags) ? tags : [],
  };

  db.videos.unshift(newVideo);
  const persisted = saveDb();
  if (!persisted) {
    return res.status(500).json({ error: 'Erro ao persistir o vídeo no banco de dados.' });
  }

  return res.status(201).json(newVideo);
});

// PUT /api/videos/:id - Update video / post (Protected)
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  const index = db.videos.findIndex((v) => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vídeo não encontrado' });
  }

  const existing = db.videos[index];
  const updated: Video = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID change
  };

  db.videos[index] = updated;
  const persisted = saveDb();
  if (!persisted) {
    return res.status(500).json({ error: 'Erro ao persistir alterações no banco de dados.' });
  }

  return res.json(updated);
});

// DELETE /api/videos/:id - Delete video / post (Protected)
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  const index = db.videos.findIndex((v) => v.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Vídeo não encontrado' });
  }

  db.videos.splice(index, 1);
  const persisted = saveDb();
  if (!persisted) {
    return res.status(500).json({ error: 'Erro ao persistir exclusão no banco de dados.' });
  }

  return res.json({ message: 'Vídeo removido com sucesso.' });
});

export default router;
