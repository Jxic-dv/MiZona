import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { Rol, TokenPayload } from '../models/usuario.model';
import { AppError } from '../utils/app-error';

/** Exige un JWT válido en la cabecera Authorization: Bearer <token>. */
export function authRequired(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'Token requerido'));
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwt.secret) as unknown as TokenPayload;
    res.locals.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}

/** Úsalo después de authRequired: requireRole('ADMIN') */
export function requireRole(...roles: Rol[]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.user as TokenPayload | undefined;
    if (!user || !roles.includes(user.rol)) {
      next(new AppError(403, 'No tienes permiso para esta acción'));
      return;
    }
    next();
  };
}
