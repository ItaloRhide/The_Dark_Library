import { Request, Response } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import logger from '../../utils/logger';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(6).max(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const errorToStatus: Record<string, number> = {
  EMAIL_ALREADY_REGISTERED: 409,
  INVALID_OR_EXPIRED_CODE: 400,
  INVALID_CREDENTIALS: 401,
  EMAIL_NOT_VERIFIED: 403,
  UNAUTHORIZED: 401,
};

function handleAuthError(res: Response, error: any) {
  const status = errorToStatus[error.message] ?? 500;
  logger.error('Auth error:', error.message);
  res.status(status).json({ error: error.message });
}

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password } = registerSchema.parse(req.body);
      const result = await authService.register({ email, password });
      res.status(201).json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'INVALID_INPUT', details: error.errors });
      }
      handleAuthError(res, error);
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const { email, code } = verifySchema.parse(req.body);
      const result = await authService.verify(email, code);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'INVALID_INPUT', details: error.errors });
      }
      handleAuthError(res, error);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'INVALID_INPUT', details: error.errors });
      }
      handleAuthError(res, error);
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      const user = authService.me(token);
      res.json({ user });
    } catch (error: any) {
      handleAuthError(res, error);
    }
  }
}