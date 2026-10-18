import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.ts';
import { requireAdminAuth, AuthRequest } from '../auth.ts';

export const adminRouter = Router();

// Todas as rotas deste router exigem autenticação administrativa real no backend
adminRouter.use(requireAdminAuth);

/**
 * GET /api/admin/stats
 * Resumo do painel administrativo
 */
adminRouter.get('/stats', (_req: AuthRequest, res: Response) => {
  try {
    const totalStmt = db.prepare('SELECT COUNT(*) as count FROM videos');
    const total = (totalStmt.get() as { count: number }).count;

    const publishedStmt = db.prepare("SELECT COUNT(*) as count FROM videos WHERE status = 'published'");
    const published = (publishedStmt.get() as { count: number }).count;

    const draftStmt = db.prepare("SELECT COUNT(*) as count FROM videos WHERE status = 'draft'");
    const drafts = (draftStmt.get() as { count: number }).count;

    const categoriesStmt = db.prepare('SELECT COUNT(DISTINCT category) as count FROM videos');
    const categoriesCount = (categoriesStmt.get() as { count: number }).count;

    const recentStmt = db.prepare('SELECT id, title, category, status, created_at FROM videos ORDER BY created_at DESC LIMIT 5');
    const recentVideos = recentStmt.all();

    // Estatísticas de Planos de Assinatura
    const totalPlansStmt = db.prepare('SELECT COUNT(*) as count FROM plans');
    const totalPlans = (totalPlansStmt.get() as { count: number }).count;

    const activePlansStmt = db.prepare("SELECT COUNT(*) as count FROM plans WHERE status = 'active'");
    const activePlans = (activePlansStmt.get() as { count: number }).count;

    const inactivePlansStmt = db.prepare("SELECT COUNT(*) as count FROM plans WHERE status = 'inactive'");
    const inactivePlans = (inactivePlansStmt.get() as { count: number }).count;

    res.json({
      success: true,
      stats: {
        total,
        published,
        drafts,
        categoriesCount,
        recentVideos,
        totalPlans,
        activePlans,
        inactivePlans,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas do admin:', error);
    res.status(500).json({ error: 'Erro ao carregar estatísticas do painel.' });
  }
});

/**
 * GET /api/admin/videos
 * Listagem completa de vídeos para o painel de gerenciamento
 */
adminRouter.get('/videos', (req: AuthRequest, res: Response) => {
  try {
    const { search, status, category } = req.query;

    let sql = `
      SELECT 
        v.id, 
        v.title, 
        v.description, 
        v.video_url, 
        v.thumbnail_url, 
        v.category, 
        v.duration, 
        v.status, 
        v.created_at, 
        v.updated_at,
        u.name as creator_name
      FROM videos v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE 1=1
    `;
    const params: (string | number | bigint | null | Uint8Array)[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ' AND (v.title LIKE ? OR v.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (status && typeof status === 'string' && ['published', 'draft'].includes(status)) {
      sql += ' AND v.status = ?';
      params.push(status);
    }

    if (category && typeof category === 'string' && category !== 'Todas') {
      sql += ' AND v.category = ?';
      params.push(category);
    }

    sql += ' ORDER BY v.created_at DESC';

    const stmt = db.prepare(sql);
    const videos = stmt.all(...params);

    // Lista todas as categorias existentes para o filtro
    const catStmt = db.prepare('SELECT DISTINCT category FROM videos ORDER BY category ASC');
    const categoriesList = (catStmt.all() as { category: string }[]).map((c) => c.category).filter(Boolean);

    res.json({
      success: true,
      videos,
      count: videos.length,
      categories: categoriesList,
    });
  } catch (error) {
    console.error('Erro ao listar vídeos no admin:', error);
    res.status(500).json({ error: 'Erro ao carregar lista de vídeos.' });
  }
});

/**
 * GET /api/admin/videos/:id
 * Detalhes de um vídeo específico
 */
adminRouter.get('/videos/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT 
        v.id, 
        v.title, 
        v.description, 
        v.video_url, 
        v.thumbnail_url, 
        v.category, 
        v.duration, 
        v.status, 
        v.created_at, 
        v.updated_at,
        u.name as creator_name
      FROM videos v
      LEFT JOIN users u ON v.created_by = u.id
      WHERE v.id = ?
    `);

    const video = stmt.get(id);

    if (!video) {
      res.status(404).json({ error: 'Vídeo não encontrado.' });
      return;
    }

    res.json({ success: true, video });
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes do vídeo.' });
  }
});

/**
 * POST /api/admin/videos
 * Cadastrar um novo vídeo no banco de dados
 */
adminRouter.post('/videos', (req: AuthRequest, res: Response) => {
  try {
    const { title, description, video_url, thumbnail_url, category, duration, status } = req.body;

    // Validações
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      res.status(400).json({ error: 'O título do vídeo é obrigatório e deve ter pelo menos 2 caracteres.' });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'A descrição do vídeo é obrigatória.' });
      return;
    }

    if (!video_url || typeof video_url !== 'string' || video_url.trim() === '') {
      res.status(400).json({ error: 'A URL ou referência do arquivo de vídeo é obrigatória.' });
      return;
    }

    const cleanCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'Geral';
    const cleanThumbnail = (thumbnail_url && typeof thumbnail_url === 'string' && thumbnail_url.trim()) 
      ? thumbnail_url.trim() 
      : 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';
    const cleanDuration = (duration && typeof duration === 'string') ? duration.trim() : '';
    const cleanStatus = status === 'published' ? 'published' : 'draft';

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const createdBy = req.user?.id || null;

    const stmt = db.prepare(`
      INSERT INTO videos (
        id, 
        title, 
        description, 
        video_url, 
        thumbnail_url, 
        category, 
        duration, 
        status, 
        created_at, 
        updated_at, 
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      title.trim(),
      description.trim(),
      video_url.trim(),
      cleanThumbnail,
      cleanCategory,
      cleanDuration,
      cleanStatus,
      now,
      now,
      createdBy
    );

    const createdVideo = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);

    res.status(201).json({
      success: true,
      message: 'Vídeo cadastrado com sucesso!',
      video: createdVideo,
    });
  } catch (error) {
    console.error('Erro ao cadastrar vídeo:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar vídeo.' });
  }
});

/**
 * PUT /api/admin/videos/:id
 * Atualizar todos os dados de um vídeo existente
 */
adminRouter.put('/videos/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, video_url, thumbnail_url, category, duration, status } = req.body;

    const exists = db.prepare('SELECT id FROM videos WHERE id = ?').get(id);
    if (!exists) {
      res.status(404).json({ error: 'Vídeo não encontrado para atualização.' });
      return;
    }

    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      res.status(400).json({ error: 'O título do vídeo é obrigatório e deve ter pelo menos 2 caracteres.' });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'A descrição do vídeo é obrigatória.' });
      return;
    }

    if (!video_url || typeof video_url !== 'string' || video_url.trim() === '') {
      res.status(400).json({ error: 'A URL do vídeo é obrigatória.' });
      return;
    }

    const cleanCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'Geral';
    const cleanThumbnail = (thumbnail_url && typeof thumbnail_url === 'string' && thumbnail_url.trim()) 
      ? thumbnail_url.trim() 
      : 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';
    const cleanDuration = (duration && typeof duration === 'string') ? duration.trim() : '';
    const cleanStatus = status === 'published' ? 'published' : 'draft';
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE videos 
      SET 
        title = ?, 
        description = ?, 
        video_url = ?, 
        thumbnail_url = ?, 
        category = ?, 
        duration = ?, 
        status = ?, 
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      title.trim(),
      description.trim(),
      video_url.trim(),
      cleanThumbnail,
      cleanCategory,
      cleanDuration,
      cleanStatus,
      now,
      id
    );

    const updatedVideo = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);

    res.json({
      success: true,
      message: 'Vídeo atualizado com sucesso!',
      video: updatedVideo,
    });
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar vídeo.' });
  }
});

/**
 * PATCH /api/admin/videos/:id/status
 * Alterar apenas o status de publicação ('published' ou 'draft')
 */
adminRouter.patch('/videos/:id/status', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['published', 'draft'].includes(status)) {
      res.status(400).json({ error: 'Status inválido. Deve ser "published" ou "draft".' });
      return;
    }

    const exists = db.prepare('SELECT id FROM videos WHERE id = ?').get(id);
    if (!exists) {
      res.status(404).json({ error: 'Vídeo não encontrado.' });
      return;
    }

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE videos SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, now, id);

    res.json({
      success: true,
      message: `Status do vídeo alterado para ${status === 'published' ? 'Publicado' : 'Rascunho'}.`,
      status,
      updated_at: now,
    });
  } catch (error) {
    console.error('Erro ao alterar status do vídeo:', error);
    res.status(500).json({ error: 'Erro ao alterar status do vídeo.' });
  }
});

/**
 * DELETE /api/admin/videos/:id
 * Excluir permanentemente um vídeo do banco de dados
 */
adminRouter.delete('/videos/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const video = db.prepare('SELECT id, title FROM videos WHERE id = ?').get(id) as { id: string; title: string } | undefined;
    if (!video) {
      res.status(404).json({ error: 'Vídeo não encontrado ou já excluído.' });
      return;
    }

    const stmt = db.prepare('DELETE FROM videos WHERE id = ?');
    stmt.run(id);

    res.json({
      success: true,
      message: `Vídeo "${video.title}" foi excluído com sucesso.`,
    });
  } catch (error) {
    console.error('Erro ao excluir vídeo:', error);
    res.status(500).json({ error: 'Erro interno ao excluir vídeo.' });
  }
});

// ============================================================================
// ROTAS DE GERENCIAMENTO DE PLANOS DE ASSINATURA (ETAPA 2)
// ============================================================================

interface AdminPlanRow {
  id: string;
  name: string;
  description: string;
  price_in_cents: number;
  currency: string;
  billing_interval: string;
  interval_count: number;
  benefits: string;
  status: string;
  is_featured: number;
  auto_renewal: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

/**
 * GET /api/admin/plans
 * Listagem completa de planos para o painel de administração (ativos e inativos)
 */
adminRouter.get('/plans', (req: AuthRequest, res: Response) => {
  try {
    const { search, status } = req.query;

    let sql = `
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price_in_cents, 
        p.currency, 
        p.billing_interval, 
        p.interval_count, 
        p.benefits, 
        p.status, 
        p.is_featured, 
        p.auto_renewal, 
        p.sort_order, 
        p.created_at, 
        p.updated_at,
        u.name as creator_name
      FROM plans p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    const params: (string | number | bigint | null | Uint8Array)[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (status && typeof status === 'string' && ['active', 'inactive'].includes(status)) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY p.sort_order ASC, p.created_at DESC';

    const stmt = db.prepare(sql);
    const rows = stmt.all(...params) as unknown as AdminPlanRow[];

    const plans = rows.map((p) => {
      let parsedBenefits: string[] = [];
      try {
        parsedBenefits = JSON.parse(p.benefits);
      } catch {
        parsedBenefits = [p.benefits];
      }

      return {
        ...p,
        benefits: parsedBenefits,
        is_featured: Boolean(p.is_featured),
        auto_renewal: Boolean(p.auto_renewal),
      };
    });

    res.json({
      success: true,
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error('Erro ao listar planos no admin:', error);
    res.status(500).json({ error: 'Erro ao listar planos de assinatura.' });
  }
});

/**
 * GET /api/admin/plans/:id
 * Detalhes de um plano específico
 */
adminRouter.get('/plans/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.price_in_cents, 
        p.currency, 
        p.billing_interval, 
        p.interval_count, 
        p.benefits, 
        p.status, 
        p.is_featured, 
        p.auto_renewal, 
        p.sort_order, 
        p.created_at, 
        p.updated_at,
        u.name as creator_name
      FROM plans p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = ?
    `);

    const plan = stmt.get(id) as unknown as AdminPlanRow | undefined;

    if (!plan) {
      res.status(404).json({ error: 'Plano não encontrado.' });
      return;
    }

    let parsedBenefits: string[] = [];
    try {
      parsedBenefits = JSON.parse(plan.benefits);
    } catch {
      parsedBenefits = [plan.benefits];
    }

    res.json({
      success: true,
      plan: {
        ...plan,
        benefits: parsedBenefits,
        is_featured: Boolean(plan.is_featured),
        auto_renewal: Boolean(plan.auto_renewal),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar plano no admin:', error);
    res.status(500).json({ error: 'Erro ao carregar detalhes do plano.' });
  }
});

/**
 * POST /api/admin/plans
 * Cadastrar um novo plano de assinatura
 */
adminRouter.post('/plans', (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      description,
      price_in_cents,
      currency,
      billing_interval,
      interval_count,
      benefits,
      status,
      is_featured,
      auto_renewal,
      sort_order,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'O nome do plano é obrigatório (mínimo 2 caracteres).' });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'A descrição do plano é obrigatória.' });
      return;
    }

    const priceCentsNum = parseInt(price_in_cents, 10);
    if (isNaN(priceCentsNum) || priceCentsNum < 0) {
      res.status(400).json({ error: 'O preço deve ser um valor monetário positivo em centavos.' });
      return;
    }

    const cleanCurrency = (currency && typeof currency === 'string' && currency.trim()) 
      ? currency.trim().toUpperCase() 
      : 'BRL';

    const validIntervals = ['month', 'quarter', 'semester', 'year'];
    if (!billing_interval || !validIntervals.includes(billing_interval)) {
      res.status(400).json({ error: 'Intervalo de cobrança inválido. Use "month", "quarter", "semester" ou "year".' });
      return;
    }

    const cleanIntervalCount = Math.max(1, parseInt(interval_count || '1', 10));

    let benefitsJson = '[]';
    if (Array.isArray(benefits)) {
      const filtered = benefits.map((b) => String(b).trim()).filter(Boolean);
      benefitsJson = JSON.stringify(filtered);
    } else if (typeof benefits === 'string') {
      benefitsJson = JSON.stringify(benefits.split('\n').map((b) => b.trim()).filter(Boolean));
    }

    const cleanStatus = status === 'inactive' ? 'inactive' : 'active';
    const cleanIsFeatured = is_featured ? 1 : 0;
    const cleanAutoRenewal = auto_renewal === false || auto_renewal === 0 ? 0 : 1;
    const cleanSortOrder = parseInt(sort_order || '0', 10) || 0;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const createdBy = req.user?.id || null;

    const stmt = db.prepare(`
      INSERT INTO plans (
        id, 
        name, 
        description, 
        price_in_cents, 
        currency, 
        billing_interval, 
        interval_count, 
        benefits, 
        status, 
        is_featured, 
        auto_renewal, 
        sort_order, 
        created_at, 
        updated_at, 
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      name.trim(),
      description.trim(),
      priceCentsNum,
      cleanCurrency,
      billing_interval,
      cleanIntervalCount,
      benefitsJson,
      cleanStatus,
      cleanIsFeatured,
      cleanAutoRenewal,
      cleanSortOrder,
      now,
      now,
      createdBy
    );

    const createdPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as unknown as AdminPlanRow;

    res.status(201).json({
      success: true,
      message: 'Plano de assinatura cadastrado com sucesso!',
      plan: {
        ...createdPlan,
        benefits: JSON.parse(createdPlan.benefits),
        is_featured: Boolean(createdPlan.is_featured),
        auto_renewal: Boolean(createdPlan.auto_renewal),
      },
    });
  } catch (error) {
    console.error('Erro ao criar plano no admin:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar plano de assinatura.' });
  }
});

/**
 * PUT /api/admin/plans/:id
 * Atualizar todos os dados de um plano existente
 */
adminRouter.put('/plans/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price_in_cents,
      currency,
      billing_interval,
      interval_count,
      benefits,
      status,
      is_featured,
      auto_renewal,
      sort_order,
    } = req.body;

    const exists = db.prepare('SELECT id FROM plans WHERE id = ?').get(id);
    if (!exists) {
      res.status(404).json({ error: 'Plano não encontrado para atualização.' });
      return;
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'O nome do plano é obrigatório (mínimo 2 caracteres).' });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'A descrição do plano é obrigatória.' });
      return;
    }

    const priceCentsNum = parseInt(price_in_cents, 10);
    if (isNaN(priceCentsNum) || priceCentsNum < 0) {
      res.status(400).json({ error: 'O preço deve ser um valor monetário positivo em centavos.' });
      return;
    }

    const cleanCurrency = (currency && typeof currency === 'string' && currency.trim()) 
      ? currency.trim().toUpperCase() 
      : 'BRL';

    const validIntervals = ['month', 'quarter', 'semester', 'year'];
    if (!billing_interval || !validIntervals.includes(billing_interval)) {
      res.status(400).json({ error: 'Intervalo de cobrança inválido.' });
      return;
    }

    const cleanIntervalCount = Math.max(1, parseInt(interval_count || '1', 10));

    let benefitsJson = '[]';
    if (Array.isArray(benefits)) {
      const filtered = benefits.map((b) => String(b).trim()).filter(Boolean);
      benefitsJson = JSON.stringify(filtered);
    } else if (typeof benefits === 'string') {
      benefitsJson = JSON.stringify(benefits.split('\n').map((b) => b.trim()).filter(Boolean));
    }

    const cleanStatus = status === 'inactive' ? 'inactive' : 'active';
    const cleanIsFeatured = is_featured ? 1 : 0;
    const cleanAutoRenewal = auto_renewal === false || auto_renewal === 0 ? 0 : 1;
    const cleanSortOrder = parseInt(sort_order || '0', 10) || 0;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE plans 
      SET 
        name = ?, 
        description = ?, 
        price_in_cents = ?, 
        currency = ?, 
        billing_interval = ?, 
        interval_count = ?, 
        benefits = ?, 
        status = ?, 
        is_featured = ?, 
        auto_renewal = ?, 
        sort_order = ?, 
        updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      name.trim(),
      description.trim(),
      priceCentsNum,
      cleanCurrency,
      billing_interval,
      cleanIntervalCount,
      benefitsJson,
      cleanStatus,
      cleanIsFeatured,
      cleanAutoRenewal,
      cleanSortOrder,
      now,
      id
    );

    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as unknown as AdminPlanRow;

    res.json({
      success: true,
      message: 'Plano atualizado com sucesso!',
      plan: {
        ...updatedPlan,
        benefits: JSON.parse(updatedPlan.benefits),
        is_featured: Boolean(updatedPlan.is_featured),
        auto_renewal: Boolean(updatedPlan.auto_renewal),
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar plano no admin:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar plano.' });
  }
});

/**
 * PATCH /api/admin/plans/:id/status
 * Alterar status de publicação do plano (active / inactive)
 */
adminRouter.patch('/plans/:id/status', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive'].includes(status)) {
      res.status(400).json({ error: 'Status inválido. Deve ser "active" ou "inactive".' });
      return;
    }

    const exists = db.prepare('SELECT id, name FROM plans WHERE id = ?').get(id) as { id: string; name: string } | undefined;
    if (!exists) {
      res.status(404).json({ error: 'Plano não encontrado.' });
      return;
    }

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE plans SET status = ?, updated_at = ? WHERE id = ?');
    stmt.run(status, now, id);

    res.json({
      success: true,
      message: `Status do plano "${exists.name}" alterado para ${status === 'active' ? 'Ativo' : 'Inativo'}.`,
      status,
      updated_at: now,
    });
  } catch (error) {
    console.error('Erro ao alterar status do plano:', error);
    res.status(500).json({ error: 'Erro ao alterar status do plano.' });
  }
});

/**
 * DELETE /api/admin/plans/:id
 * Excluir permanentemente um plano do banco de dados após confirmação
 */
adminRouter.delete('/plans/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = db.prepare('SELECT id, name FROM plans WHERE id = ?').get(id) as { id: string; name: string } | undefined;
    if (!plan) {
      res.status(404).json({ error: 'Plano não encontrado ou já excluído.' });
      return;
    }

    const stmt = db.prepare('DELETE FROM plans WHERE id = ?');
    stmt.run(id);

    res.json({
      success: true,
      message: `Plano "${plan.name}" foi excluído com sucesso do banco de dados.`,
    });
  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    res.status(500).json({ error: 'Erro interno ao excluir plano.' });
  }
});
