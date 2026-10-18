import { Router, Request, Response } from 'express';
import { db } from '../db.ts';
import { verifyPassword, createSession, invalidateSession, requireAdminAuth, AuthRequest } from '../auth.ts';

export const authRouter = Router();

interface UserRow {
  id: number;
  uuid: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: string;
}

/**
 * POST /api/auth/login
 * Realiza autenticação com credenciais reais de administrador
 */
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== 'string') {
      res.status(400).json({ error: 'A senha é obrigatória.' });
      return;
    }

    // Login apenas com senha: usa o administrador cadastrado
    const user = db.prepare("SELECT * FROM users WHERE role = 'admin' ORDER BY id LIMIT 1").get() as UserRow | undefined;

    if (!user) {
      res.status(401).json({ error: 'Senha inválida.' });
      return;
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      res.status(401).json({ error: 'Senha inválida.' });
      return;
    }

    const session = createSession(user.id);

    res.json({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      user: {
        id: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro na rota de login:', error);
    res.status(500).json({ error: 'Erro no servidor durante a tentativa de login.' });
  }
});

/**
 * POST /api/auth/logout
 * Invalida o token de sessão no banco de dados
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      invalidateSession(token);
    }
    res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  } catch (error) {
    console.error('Erro na rota de logout:', error);
    res.status(500).json({ error: 'Erro ao processar encerramento de sessão.' });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário atualmente autenticado
 */
authRouter.get('/me', requireAdminAuth, (req: AuthRequest, res: Response) => {
  res.json({
    user: req.user,
  });
});

/**
 * GET /api/auth/status
 * Informa se o sistema possui administrador configurado
 */
authRouter.get('/status', (_req: Request, res: Response) => {
  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    const result = stmt.get() as { count: number };
    res.json({
      initialized: result.count > 0,
      adminCount: result.count,
    });
  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error);
    res.status(500).json({ error: 'Erro ao verificar inicialização.' });
  }
});
