import { Router, Request, Response } from 'express';
import { db, saveDb } from '../db';
import { authenticateToken } from '../auth';
import { Plan } from '../../src/types';

const router = Router();

// GET /api/plans - List all plans
router.get('/', (_req: Request, res: Response) => {
  return res.json(db.plans);
});

// GET /api/plans/:id - Get single plan
router.get('/:id', (req: Request, res: Response) => {
  const plan = db.plans.find((p) => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Plano não encontrado' });
  }
  return res.json(plan);
});

// POST /api/plans - Create plan (Protected)
router.post('/', authenticateToken, (req: Request, res: Response) => {
  const { name, price, period, description, features, isPopular, badge } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Nome e preço do plano são obrigatórios.' });
  }

  const newPlan: Plan = {
    id: `plan_${Date.now()}`,
    name: name.trim(),
    price: Number(price) || 0,
    period: period || 'mês',
    description: (description || '').trim(),
    features: Array.isArray(features) ? features : [],
    isPopular: Boolean(isPopular),
    badge: badge || undefined,
  };

  db.plans.push(newPlan);
  saveDb();
  return res.status(201).json(newPlan);
});

// PUT /api/plans/:id - Update plan (Protected)
router.put('/:id', authenticateToken, (req: Request, res: Response) => {
  const index = db.plans.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Plano não encontrado' });
  }

  const existing = db.plans[index];
  const updated: Plan = {
    ...existing,
    ...req.body,
    id: existing.id,
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
  };

  db.plans[index] = updated;
  saveDb();
  return res.json(updated);
});

// DELETE /api/plans/:id - Delete plan (Protected)
router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
  const index = db.plans.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Plano não encontrado' });
  }

  db.plans.splice(index, 1);
  saveDb();
  return res.json({ message: 'Plano removido com sucesso.' });
});

export default router;
