import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../schemas/usuario.schema';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const datos = registerSchema.parse(req.body);
  await authService.registrar(datos);
  res.status(201).json({
    mensaje: 'Cuenta creada. Un administrador debe activarla antes de que puedas iniciar sesión.',
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  res.json(await authService.login(email, password));
}

export function me(_req: Request, res: Response): void {
  res.json({ usuario: res.locals.user });
}
