import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, User } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'omeflash-super-secret-jwt-key-2026';

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

  // 3. Check query param for media streaming requests (e.g. video tags)
  if (!token && req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
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
