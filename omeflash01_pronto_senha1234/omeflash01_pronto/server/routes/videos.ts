import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const publicVideosRouter = Router();

/**
 * GET /api/videos
 * Retorna os vídeos com status 'published' para o catálogo público
 */
publicVideosRouter.get('/videos', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let sql = `
      SELECT 
        id, 
        title, 
        description, 
        video_url, 
        thumbnail_url, 
        category, 
        duration, 
        status, 
        created_at, 
        updated_at 
      FROM videos 
      WHERE status = 'published'
    `;
    const params: (string | number | bigint | null | Uint8Array)[] = [];

    if (category && typeof category === 'string' && category !== 'Todas') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ' AND title LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    sql += ' ORDER BY created_at DESC';

    const stmt = db.prepare(sql);
    const videos = stmt.all(...params);

    res.json({
      success: true,
      videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('Erro ao buscar catálogo público de vídeos:', error);
    res.status(500).json({ error: 'Erro ao carregar catálogo de vídeos.' });
  }
});

/**
 * GET /api/videos/:id
 * Retorna os detalhes de um vídeo público publicado
 */
publicVideosRouter.get('/videos/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT 
        id, 
        title, 
        description, 
        video_url, 
        thumbnail_url, 
        category, 
        duration, 
        status, 
        created_at, 
        updated_at 
      FROM videos 
      WHERE id = ? AND status = 'published'
    `);
    const video = stmt.get(id);

    if (!video) {
      res.status(404).json({ error: 'Vídeo não encontrado ou indisponível.' });
      return;
    }

    res.json({ success: true, video });
  } catch (error) {
    console.error('Erro ao buscar detalhes do vídeo:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do vídeo.' });
  }
});

/**
 * GET /api/categories
 * Retorna as categorias com vídeos publicados
 */
publicVideosRouter.get('/categories', (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT category 
      FROM videos 
      WHERE status = 'published' 
      ORDER BY category ASC
    `);
    const rows = stmt.all() as { category: string }[];
    const categories = rows.map((r) => r.category).filter(Boolean);

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias.' });
  }
});
