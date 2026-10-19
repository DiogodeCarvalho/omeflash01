import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import https from 'https';
import http from 'http';
import { db, User, Video } from './db.js';
import {
  AuthRequest,
  generateToken,
  sanitizeUser,
  isSubscriptionActive,
  requireAuth,
  requireAdmin,
} from './auth.js';
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhookEvent,
  processStripeEvent,
  isStripeConfigured,
  stripe,
} from './stripeService.js';

export const apiRouter = express.Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 6 caracteres.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser: User = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'user',
      subscriptionStatus: 'none',
      subscriptionPlan: null,
      subscriptionExpiresAt: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      createdAt: new Date().toISOString(),
    };

    db.addUser(newUser);

    const token = generateToken(newUser);

    res.cookie('omeflash_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: sanitizeUser(newUser),
      token,
      isVip: isSubscriptionActive(newUser),
    });
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return res.status(500).json({ error: 'Erro interno ao criar conta.' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const token = generateToken(user);

    res.cookie('omeflash_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: sanitizeUser(user),
      token,
      isVip: isSubscriptionActive(user),
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao fazer login.' });
  }
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('omeflash_token');
  return res.json({ message: 'Sessão encerrada com sucesso.' });
});

apiRouter.get('/auth/me', (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.json({ user: null, isVip: false });
  }
  return res.json({
    user: sanitizeUser(req.user),
    isVip: isSubscriptionActive(req.user),
  });
});

// ==========================================
// 2. VIDEO CATALOG & PROTECTED STREAMING
// ==========================================

apiRouter.get('/videos', (req: AuthRequest, res: Response) => {
  const allVideos = db.getVideos();
  const userHasVip = req.user ? isSubscriptionActive(req.user) : false;

  // Mask direct video URLs from client responses so they cannot be extracted or stolen;
  // all video playback flows through the protected /api/videos/:id/stream endpoint!
  const sanitizedCatalog = allVideos.map(video => ({
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration,
    category: video.category,
    tags: video.tags,
    isVip: video.isVip,
    views: video.views,
    likes: video.likes,
    featured: video.featured,
    createdAt: video.createdAt,
    canAccess: !video.isVip || userHasVip,
    streamUrl: `/api/videos/${video.id}/stream`,
  }));

  return res.json({
    videos: sanitizedCatalog,
    userHasVip,
  });
});

apiRouter.get('/videos/:id', (req: AuthRequest, res: Response) => {
  const video = db.getVideoById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Vídeo não encontrado.' });
  }

  const userHasVip = req.user ? isSubscriptionActive(req.user) : false;

  return res.json({
    id: video.id,
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration,
    category: video.category,
    tags: video.tags,
    isVip: video.isVip,
    views: video.views,
    likes: video.likes,
    featured: video.featured,
    createdAt: video.createdAt,
    canAccess: !video.isVip || userHasVip,
    streamUrl: `/api/videos/${video.id}/stream`,
  });
});

// PROTECTED VIDEO STREAMING ENDPOINT
// Strictly validates access rights before streaming media chunks!
apiRouter.get('/videos/:id/stream', (req: AuthRequest, res: Response) => {
  const video = db.getVideoById(req.params.id);
  if (!video) {
    return res.status(404).json({ error: 'Vídeo não encontrado.' });
  }

  // Check VIP access requirement
  if (video.isVip) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Você precisa estar conectado para acessar vídeos VIP.',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!isSubscriptionActive(req.user)) {
      return res.status(403).json({
        error: 'Este vídeo é exclusivo para assinantes VIP do OmeFlash.',
        code: 'VIP_SUBSCRIPTION_REQUIRED',
        status: req.user.subscriptionStatus,
      });
    }
  }

  // Increment view counter
  video.views = (video.views || 0) + 1;
  db.updateVideo(video.id, { views: video.views });

  // Stream video chunk through backend with HTTP range support
  const targetUrl = video.videoUrl;
  const clientReqHeaders: any = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
  };
  if (req.headers.range) {
    clientReqHeaders.range = req.headers.range;
  }

  const httpModule = targetUrl.startsWith('https') ? https : http;

  const streamReq = httpModule.get(targetUrl, { headers: clientReqHeaders }, (streamRes) => {
    // Forward response code (e.g. 206 Partial Content or 200 OK)
    const forwardHeaders: Record<string, string | number | string[]> = {
      'Content-Type': streamRes.headers['content-type'] || 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };
    if (streamRes.headers['content-length']) {
      forwardHeaders['Content-Length'] = streamRes.headers['content-length'];
    }
    if (streamRes.headers['content-range']) {
      forwardHeaders['Content-Range'] = streamRes.headers['content-range'];
    }

    res.writeHead(streamRes.statusCode || 200, forwardHeaders);

    streamRes.pipe(res);
  });

  streamReq.on('error', (err) => {
    console.error('Erro no streaming de vídeo:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao transmitir vídeo.' });
    }
  });

  req.on('close', () => {
    streamReq.destroy();
  });
});

// ==========================================
// 3. SUBSCRIPTION PLANS & STRIPE INTEGRATION
// ==========================================

apiRouter.get('/plans', (_req: Request, res: Response) => {
  const plans = db.getPlans();
  return res.json(plans);
});

apiRouter.get('/stripe/config', (_req: Request, res: Response) => {
  return res.json({
    isConfigured: isStripeConfigured,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    mode: isStripeConfigured ? 'live_or_test_key' : 'sandbox_simulator',
  });
});

apiRouter.post('/stripe/create-checkout-session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'Identificador do plano é obrigatório.' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    const sessionData = await createCheckoutSession({
      planId,
      user: req.user!,
      baseUrl,
    });

    return res.json(sessionData);
  } catch (error: any) {
    console.error('Erro ao gerar checkout Stripe:', error);
    return res.status(500).json({ error: error.message || 'Erro ao iniciar pagamento com Stripe.' });
  }
});

apiRouter.post('/stripe/create-portal-session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;

    const portalUrl = await createBillingPortalSession(req.user!, baseUrl);
    if (!portalUrl) {
      return res.status(400).json({
        error: 'Portal do cliente indisponível para este usuário ou Stripe não configurada.',
      });
    }

    return res.json({ url: portalUrl });
  } catch (error: any) {
    console.error('Erro no portal do cliente:', error);
    return res.status(500).json({ error: 'Erro ao abrir portal da Stripe.' });
  }
});

// SIMULATED STRIPE CHECKOUT COMPLETION (for instant local or test evaluation)
apiRouter.post('/stripe/simulate-checkout-success', requireAuth, (req: AuthRequest, res: Response) => {
  const { planId, sessionId } = req.body;
  const user = req.user!;

  const plan = db.getPlanById(planId);
  const expirationDate = new Date();
  if (planId === 'vip_annual') {
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  } else if (planId === 'vip_quarterly') {
    expirationDate.setMonth(expirationDate.getMonth() + 3);
  } else {
    expirationDate.setMonth(expirationDate.getMonth() + 1);
  }

  const updatedUser = db.updateUser(user.id, {
    subscriptionStatus: 'active',
    subscriptionPlan: planId || 'vip_monthly',
    subscriptionExpiresAt: expirationDate.toISOString(),
    stripeCustomerId: user.stripeCustomerId || `cus_sim_${Date.now()}`,
    stripeSubscriptionId: `sub_sim_${Date.now()}`,
  });

  db.addWebhookLog({
    event: 'checkout.session.completed.simulated',
    status: 'success',
    message: `Assinatura VIP confirmada com sucesso para ${user.email} (Plano: ${plan?.name || planId})`,
    payloadSummary: JSON.stringify({ sessionId, planId, expiresAt: expirationDate.toISOString() }),
  });

  return res.json({
    success: true,
    user: sanitizeUser(updatedUser!),
    isVip: true,
  });
});

// CANCEL SUBSCRIPTION (USER ACTION)
apiRouter.post('/stripe/cancel-subscription', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // If live Stripe subscription exists, call Stripe API to cancel at period end
  if (stripe && user.stripeSubscriptionId && !user.stripeSubscriptionId.startsWith('sub_sim_')) {
    try {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (err: any) {
      console.warn('Erro ao atualizar cancelamento na Stripe:', err.message);
    }
  }

  const updatedUser = db.updateUser(user.id, {
    subscriptionStatus: 'canceled',
  });

  db.addWebhookLog({
    event: 'customer.subscription.canceled_by_user',
    status: 'success',
    message: `Usuário ${user.email} solicitou o cancelamento da sua assinatura VIP.`,
  });

  return res.json({
    success: true,
    message: 'Assinatura cancelada com sucesso.',
    user: sanitizeUser(updatedUser!),
    isVip: false,
  });
});

// SIMULATE WEBHOOK TRIGGER (ADMIN & TESTING UTILITY)
apiRouter.post('/stripe/simulate-webhook', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { eventType, userEmail, planId } = req.body;
    const targetUser = db.getUserByEmail(userEmail || 'vip@omeflash.com');

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário de teste não encontrado.' });
    }

    const mockEvent = {
      id: 'evt_sim_' + Date.now(),
      type: eventType,
      data: {
        object: {
          id: 'sub_sim_' + Date.now(),
          customer: targetUser.stripeCustomerId || 'cus_demo_test',
          status: eventType === 'customer.subscription.deleted' ? 'canceled' : 'active',
          metadata: {
            userId: targetUser.id,
            planId: planId || 'vip_monthly',
          },
          current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
        },
      },
    };

    await processStripeEvent(mockEvent);

    return res.json({
      success: true,
      message: `Webhook ${eventType} simulado e processado com sucesso!`,
      updatedUser: sanitizeUser(db.getUserById(targetUser.id)!),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. ADMIN DASHBOARD ROUTES
// ==========================================

apiRouter.get('/admin/metrics', requireAdmin, (_req: Request, res: Response) => {
  const users = db.getUsers();
  const videos = db.getVideos();
  const activeSubs = users.filter(u => u.subscriptionStatus === 'active');

  // Estimate MRR (Monthly Recurring Revenue)
  const mrr = activeSubs.reduce((acc, u) => {
    if (u.subscriptionPlan === 'vip_annual') return acc + 199.90 / 12;
    if (u.subscriptionPlan === 'vip_quarterly') return acc + 69.90 / 3;
    return acc + 29.90;
  }, 0);

  return res.json({
    totalUsers: users.length,
    activeSubscribers: activeSubs.length,
    totalVideos: videos.length,
    vipVideosCount: videos.filter(v => v.isVip).length,
    estimatedMrr: Math.round(mrr * 100) / 100,
    webhookLogsCount: db.getWebhookLogs().length,
  });
});

apiRouter.get('/admin/users', requireAdmin, (_req: Request, res: Response) => {
  const users = db.getUsers().map(u => sanitizeUser(u));
  return res.json(users);
});

apiRouter.patch('/admin/users/:id/subscription', requireAdmin, (req: Request, res: Response) => {
  const { status, plan, expiresAt } = req.body;
  const user = db.getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const updated = db.updateUser(user.id, {
    subscriptionStatus: status || user.subscriptionStatus,
    subscriptionPlan: plan !== undefined ? plan : user.subscriptionPlan,
    subscriptionExpiresAt: expiresAt !== undefined ? expiresAt : user.subscriptionExpiresAt,
  });

  db.addWebhookLog({
    event: 'admin.user_subscription_modified',
    status: 'success',
    message: `Administrador alterou assinatura de ${user.email} para status: ${status}`,
  });

  return res.json(sanitizeUser(updated!));
});

apiRouter.post('/admin/videos', requireAdmin, (req: Request, res: Response) => {
  const { title, description, thumbnailUrl, videoUrl, duration, category, tags, isVip, featured } = req.body;

  if (!title || !thumbnailUrl || !videoUrl) {
    return res.status(400).json({ error: 'Título, miniatura e link do vídeo são obrigatórios.' });
  }

  const newVideo: Video = {
    id: 'vid-' + Date.now(),
    title: title.trim(),
    description: description || '',
    thumbnailUrl: thumbnailUrl.trim(),
    videoUrl: videoUrl.trim(),
    duration: duration || '10:00',
    category: category || 'Geral',
    tags: Array.isArray(tags) ? tags : ['OmeFlash'],
    isVip: isVip === undefined ? true : Boolean(isVip),
    views: 0,
    likes: 0,
    featured: Boolean(featured),
    createdAt: new Date().toISOString(),
  };

  db.addVideo(newVideo);
  return res.status(201).json(newVideo);
});

apiRouter.put('/admin/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateVideo(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Vídeo não encontrado para atualização.' });
  }
  return res.json(updated);
});

apiRouter.delete('/admin/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteVideo(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Vídeo não encontrado para exclusão.' });
  }
  return res.json({ success: true, message: 'Vídeo removido com sucesso.' });
});

apiRouter.get('/admin/webhooks', requireAdmin, (_req: Request, res: Response) => {
  return res.json(db.getWebhookLogs());
});
