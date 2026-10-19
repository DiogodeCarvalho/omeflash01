import { Router, Request, Response } from 'express';
import { db, saveDb } from '../db';
import { SubscriberUser, Subscription, PaymentInvoice } from '../../src/types';

const router = Router();

// Helper to sanitize subscriber data (strip passwordHash)
function sanitizeSubscriber(user: SubscriberUser & { passwordHash?: string }): SubscriberUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

// POST /api/subscribers/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const cleanName = (name || cleanEmail.split('@')[0]).toString().trim();
  const cleanPassword = password.toString().trim();

  // Check if email already registered
  const existing = db.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({ error: 'Este e-mail já está cadastrado. Faça login.' });
  }

  const newSubscriber: SubscriberUser & { passwordHash: string } = {
    id: `usr_sub_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    createdAt: new Date().toISOString().split('T')[0],
    passwordHash: cleanPassword,
    subscription: null,
    invoices: [],
  };

  db.subscribers.push(newSubscriber);
  saveDb();

  const token = `omeflash_sub_jwt_${Date.now()}_${newSubscriber.id}`;

  return res.status(201).json({
    user: sanitizeSubscriber(newSubscriber),
    token,
    subscription: null,
  });
});

// POST /api/subscribers/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const cleanPassword = password.toString().trim();

  const user = db.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);

  if (!user || user.passwordHash !== cleanPassword) {
    // If it's the demo client credentials
    if (cleanEmail === 'cliente@omeflash.com' && (cleanPassword === 'senha123' || cleanPassword === '123456')) {
      const demoUser = db.subscribers[0];
      return res.json({
        user: sanitizeSubscriber(demoUser),
        token: `omeflash_sub_jwt_${Date.now()}_${demoUser.id}`,
        subscription: demoUser.subscription,
      });
    }
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  const token = `omeflash_sub_jwt_${Date.now()}_${user.id}`;
  return res.json({
    user: sanitizeSubscriber(user),
    token,
    subscription: user.subscription,
  });
});

// GET /api/subscribers/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  // Find subscriber by token substring or take demo if match
  const parts = token.split('_');
  const userId = parts[parts.length - 1];

  const user = db.subscribers.find((s) => s.id === userId) || db.subscribers[0];
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado' });
  }

  return res.json({
    user: sanitizeSubscriber(user),
    subscription: user.subscription,
  });
});

// POST /api/subscribers/checkout (Process payment & start recurring subscription)
router.post('/checkout', (req: Request, res: Response) => {
  const {
    userId,
    userEmail,
    userName,
    userPassword,
    planId,
    paymentMethod,
    cardNumber,
    cardHolder,
  } = req.body || {};

  // Find plan
  const plan = db.plans.find((p) => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plano não encontrado' });
  }

  // Find or create subscriber
  let user: (SubscriberUser & { passwordHash: string }) | undefined;

  if (userId) {
    user = db.subscribers.find((s) => s.id === userId);
  }

  if (!user && userEmail) {
    const cleanEmail = userEmail.toString().trim().toLowerCase();
    user = db.subscribers.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Create new account automatically
      user = {
        id: `usr_sub_${Date.now()}`,
        name: (userName || cleanEmail.split('@')[0]).toString().trim(),
        email: cleanEmail,
        createdAt: new Date().toISOString().split('T')[0],
        passwordHash: userPassword ? userPassword.toString().trim() : 'senha123',
        subscription: null,
        invoices: [],
      };
      db.subscribers.push(user);
    }
  }

  if (!user) {
    return res.status(400).json({ error: 'Identificação do usuário necessária.' });
  }

  // Calculate renewal date based on plan period
  const startDate = new Date();
  const nextDate = new Date();
  if (plan.period.includes('ano')) {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else if (plan.period.includes('trimestre')) {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else {
    // Default month
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  // Last 4 digits of card if credit card
  const last4 = cardNumber
    ? cardNumber.replace(/\D/g, '').slice(-4) || '4242'
    : '4242';

  // Create Subscription record
  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId: user.id,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    period: plan.period,
    status: 'active',
    paymentMethod: paymentMethod === 'pix' ? 'pix' : 'credit_card',
    cardLast4: paymentMethod === 'pix' ? undefined : last4,
    cardBrand: paymentMethod === 'pix' ? undefined : 'Mastercard',
    startDate: startDate.toISOString().split('T')[0],
    nextBillingDate: nextDate.toISOString().split('T')[0],
    autoRenew: true,
  };

  // Create Payment Invoice
  const invoice: PaymentInvoice = {
    id: `inv_${Date.now()}`,
    subscriptionId: subscription.id,
    amount: plan.price,
    date: startDate.toISOString().split('T')[0],
    status: 'paid',
    paymentMethod: subscription.paymentMethod,
    planName: plan.name,
    period: plan.period,
  };

  // Update user with active subscription and invoice
  user.subscription = subscription;
  user.invoices = [invoice, ...(user.invoices || [])];

  saveDb();

  const token = `omeflash_sub_jwt_${Date.now()}_${user.id}`;

  return res.json({
    success: true,
    message: 'Assinatura confirmada com sucesso! Acesso a 100% dos vídeos liberado.',
    user: sanitizeSubscriber(user),
    subscription,
    invoice,
    token,
  });
});

// POST /api/subscribers/cancel-subscription
router.post('/cancel-subscription', (req: Request, res: Response) => {
  const { userId } = req.body || {};

  const user = db.subscribers.find((s) => s.id === userId) || db.subscribers[0];
  if (!user || !user.subscription) {
    return res.status(404).json({ error: 'Assinatura ativa não encontrada.' });
  }

  user.subscription.status = 'canceled';
  user.subscription.autoRenew = false;
  user.subscription.canceledAt = new Date().toISOString().split('T')[0];

  saveDb();

  return res.json({
    success: true,
    message: 'Assinatura cancelada com sucesso. Você não terá novas cobranças recorrentes.',
    subscription: user.subscription,
  });
});

// POST /api/subscribers/reactivate-subscription
router.post('/reactivate-subscription', (req: Request, res: Response) => {
  const { userId } = req.body || {};

  const user = db.subscribers.find((s) => s.id === userId) || db.subscribers[0];
  if (!user || !user.subscription) {
    return res.status(404).json({ error: 'Assinatura não encontrada.' });
  }

  user.subscription.status = 'active';
  user.subscription.autoRenew = true;
  delete user.subscription.canceledAt;

  saveDb();

  return res.json({
    success: true,
    message: 'Assinatura reativada com sucesso! Cobranças e renovações automáticas restabelecidas.',
    subscription: user.subscription,
  });
});

// GET /api/subscribers/admin/all (For admin dashboard oversight)
router.get('/admin/all', (_req: Request, res: Response) => {
  const list = db.subscribers.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    createdAt: s.createdAt,
    subscription: s.subscription,
    invoicesCount: s.invoices?.length || 0,
  }));
  return res.json(list);
});

export default router;
