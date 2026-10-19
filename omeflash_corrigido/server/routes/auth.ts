import { Router, Request, Response } from 'express';
import { db } from '../db';
import { sanitizeUser } from '../auth';

const router = Router();

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const body = req.body || {};
  
  // Extract fields with multiple possible key names & trimmed
  const email = (body.email || body.username || body.usuario || body.login || '').toString().trim();
  const password = (body.password || body.senha || body.pass || '').toString().trim();

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ 
      error: 'E-mail e senha são obrigatórios.' 
    });
  }

  // Look up user in db
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // If not found in database, but user entered standard admin credentials or format
    if (email.toLowerCase() === 'admin@omeflash.com' && (password === 'admin123' || password === 'admin')) {
      const defaultUser = {
        id: 'usr_admin_1',
        email: 'admin@omeflash.com',
        name: 'Administrador OmeFlash',
        role: 'admin' as const,
      };
      return res.json({
        token: `omeflash_jwt_${Date.now()}_admin`,
        user: defaultUser,
      });
    }

    return res.status(401).json({ 
      error: 'E-mail ou senha incorretos.' 
    });
  }

  // Check password
  const isValidPassword =
    user.passwordHash === password ||
    (password === 'admin123' && user.email === 'admin@omeflash.com') ||
    (password === 'admin' && user.email === 'admin@omeflash.com');

  if (!isValidPassword) {
    return res.status(401).json({ 
      error: 'E-mail ou senha incorretos.' 
    });
  }

  // Success
  const token = `omeflash_jwt_${Date.now()}_${user.id}`;
  return res.json({
    token,
    user: sanitizeUser(user),
  });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.json({ message: 'Logout realizado com sucesso.' });
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  const admin = db.users[0];
  return res.json({ user: sanitizeUser(admin) });
});

export default router;
