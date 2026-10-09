import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import type { Rol, TokenPayload } from '../models/usuario.model';
import * as usuarioRepository from '../repositories/usuario.repository';
import { AppError } from '../utils/app-error';

/** Exige un JWT válido en la cabecera Authorization: Bearer <token>. */
export async function authRequired(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new AppError(401, 'Token requerido'));
    return;
  }

  let payload: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(header.slice(7), config.jwt.secret);
    if (typeof decoded === 'string' || !decoded.sub || !/^[1-9]\d*$/.test(decoded.sub)
      || !Number.isSafeInteger(Number(decoded.sub))) {
      throw new Error('Identificador inválido');
    }
    payload = decoded;
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
    return;
  }

  try {
    const usuario = await usuarioRepository.buscarPorId(Number(payload.sub));
    if (!usuario || !usuario.activo) {
      next(new AppError(401, 'Tu cuenta no está activa'));
      return;
    }
    res.locals.user = {
      sub: String(usuario.id), nombre: usuario.nombre, rol: usuario.rol,
    } satisfies TokenPayload;
    next();
  } catch (err) {
    next(err);
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
