import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export type Rol = 'ADMIN' | 'FUNCIONARIO';

export interface TokenPayload {
  sub: string; // id del usuario (JWT exige que sub sea string)
  nombre: string;
  rol: Rol;
}

export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret) as unknown as TokenPayload;
    res.locals.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/** Úsalo después de authRequired: requireRole('ADMIN') */
export function requireRole(...roles: Rol[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user as TokenPayload | undefined;
    if (!user || !roles.includes(user.rol)) {
      res.status(403).json({ error: 'No tienes permiso para esta acción' });
      return;
    }
    next();
  };
}