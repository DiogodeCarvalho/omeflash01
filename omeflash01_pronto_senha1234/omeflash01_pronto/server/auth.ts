import crypto from 'node:crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

export interface AuthenticatedUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  token?: string;
}

/**
 * Cria hash criptográfico seguro da senha usando scrypt com salt aleatório
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

/**
 * Verifica senha informada contra o hash salvo usando comparação em tempo constante
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const hashAttempt = crypto.scryptSync(password, salt, 64);
    const hashBuffer = Buffer.from(hash, 'hex');
    if (hashBuffer.length !== hashAttempt.length) return false;
    return crypto.timingSafeEqual(hashBuffer, hashAttempt);
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
}

/**
 * Gera um token de sessão criptograficamente seguro
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Cria uma sessão no banco de dados com validade de 24 horas
 */
export function createSession(userId: number): { token: string; expiresAt: string } {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare('INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)');
  stmt.run(token, userId, expiresAt, createdAt);

  return { token, expiresAt };
}

/**
 * Invalida uma sessão específica (logout)
 */
export function invalidateSession(token: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

/**
 * Remove sessões expiradas do banco
 */
export function purgeExpiredSessions(): void {
  const now = new Date().toISOString();
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < ?');
  stmt.run(now);
}

/**
 * Middleware Express para proteger rotas administrativas
 */
export function requireAdminAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acesso não autorizado: token de autenticação ausente.' });
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Acesso não autorizado: token inválido.' });
    return;
  }

  try {
    purgeExpiredSessions();

    const now = new Date().toISOString();
    const query = db.prepare(`
      SELECT 
        u.id, 
        u.uuid, 
        u.name, 
        u.email, 
        u.role 
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > ?
    `);

    const user = query.get(token, now) as AuthenticatedUser | undefined;

    if (!user) {
      res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, faça login novamente.' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado: privilégios de administrador necessários.' });
      return;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: 'Erro interno ao validar autenticação.' });
  }
}
