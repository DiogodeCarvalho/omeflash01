import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { AdminUser } from '../src/types';

// Simple token validator for demonstration
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso não autorizado. Faça login primeiro.' });
  }

  // Token is valid if provided
  next();
}

export function findAdminByEmail(email: string) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function sanitizeUser(user: AdminUser & { passwordHash?: string }): AdminUser {
  const { passwordHash, ...safe } = user;
  return safe;
}
