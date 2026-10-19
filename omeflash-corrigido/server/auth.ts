import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db.js';

const isProduction = process.env.NODE_ENV === 'production';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;

  if (isProduction) {
    throw new Error('JWT_SECRET é obrigatório em produção (mínimo de 16 caracteres).');
  }

  console.warn(
    '[auth] JWT_SECRET não definido: usando um segredo aleatório temporário (as sessões expiram ao reiniciar o servidor).'
  );
  return crypto.randomBytes(32).toString('hex');
}

const JWT_SECRET = resolveJwtSecret();

// O token na query string só é aceito no endpoint de streaming (tag <video> não envia headers)
const STREAM_PATH = /^\/api\/videos\/[^/]+\/stream\/?$/;

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function isSubscriptionActive(user: User): boolean {
  if (user.role === 'admin') return true;
  if (user.subscriptionStatus !== 'active') return false;
  if (user.subscriptionExpiresAt) {
    const expires = new Date(user.subscriptionExpiresAt).getTime();
    if (expires < Date.now()) {
      return false;
    }
  }
  return true;
}

export function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Check Cookie: omeflash_token
  if (!token && req.cookies && req.cookies.omeflash_token) {
    token = req.cookies.omeflash_token;
  }

  // 3. Check query param, apenas para o streaming de vídeo
  if (!token && STREAM_PATH.test(req.path) && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as { id: string };
    const user = db.getUserById(decoded.id);
    if (user) {
      // Check if subscription expired dynamically
      if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt) {
        if (new Date(user.subscriptionExpiresAt).getTime() < Date.now()) {
          user.subscriptionStatus = 'past_due';
          db.updateUser(user.id, { subscriptionStatus: 'past_due' });
        }
      }
      req.user = user;
    }
  } catch (err) {
    // invalid token, ignore
  }

  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Você precisa estar conectado para acessar este recurso.' });
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores do OmeFlash.' });
  }
  next();
}

export function requireSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Você precisa estar logado para acessar vídeos VIP.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!isSubscriptionActive(req.user)) {
    return res.status(403).json({ 
      error: 'Assinatura VIP ativa necessária para assistir a este vídeo.',
      code: 'VIP_SUBSCRIPTION_REQUIRED',
      subscriptionStatus: req.user.subscriptionStatus,
      plansUrl: '/planos'
    });
  }

  next();
}

// ==========================================
// Rate limit simples (em memória) para login
// ==========================================
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function loginKey(req: Request): string {
  return `${req.ip}|${String(req.body?.email || '').toLowerCase()}`;
}

export function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();

  if (loginAttempts.size > 5000) {
    for (const [k, v] of loginAttempts) {
      if (v.resetAt <= now) loginAttempts.delete(k);
    }
  }

  const key = loginKey(req);
  const entry = loginAttempts.get(key);

  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return next();
  }

  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({
      error: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
    });
  }

  entry.count += 1;
  next();
}

export function resetLoginRateLimit(req: Request) {
  loginAttempts.delete(loginKey(req));
}
