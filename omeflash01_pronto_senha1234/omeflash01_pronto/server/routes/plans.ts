import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

export const publicPlansRouter = Router();

interface PlanDbRow {
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
}

/**
 * GET /api/plans
 * Retorna os planos ativos disponíveis publicamente, ordenados por sort_order
 */
publicPlansRouter.get('/plans', (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare(`
      SELECT 
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
        updated_at
      FROM plans 
      WHERE status = 'active'
      ORDER BY sort_order ASC, created_at ASC
    `);

    const rows = stmt.all() as unknown as PlanDbRow[];

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
    console.error('Erro ao buscar planos públicos:', error);
    res.status(500).json({ error: 'Erro ao carregar os planos de assinatura.' });
  }
});

/**
 * GET /api/plans/:id
 * Retorna os detalhes de um plano ativo específico
 */
publicPlansRouter.get('/plans/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare(`
      SELECT 
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
        updated_at
      FROM plans 
      WHERE id = ? AND status = 'active'
    `);

    const plan = stmt.get(id) as unknown as PlanDbRow | undefined;

    if (!plan) {
      res.status(404).json({ error: 'Plano não encontrado ou indisponível.' });
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
    console.error('Erro ao buscar plano por id:', error);
    res.status(500).json({ error: 'Erro ao carregar detalhes do plano.' });
  }
});
