import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service';

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
  try {
    req.user = authService.me(token);
    next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED' });
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'owner') {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  });
}