import type { Request, Response } from 'express';
import type { TokenPayload } from '../models/usuario.model';
import {
  actualizarPerfilSchema,
  cambiarActivoSchema,
  listarUsuariosQuery,
} from '../schemas/usuario.schema';
import * as usuarioService from '../services/usuario.service';
import { parseId } from '../utils/parse-id';

function usuarioActualId(res: Response): number {
  return Number((res.locals.user as TokenPayload).sub);
}

export async function miPerfil(_req: Request, res: Response): Promise<void> {
  res.json(await usuarioService.obtenerPerfil(usuarioActualId(res)));
}

export async function actualizarMiPerfil(req: Request, res: Response): Promise<void> {
  const datos = actualizarPerfilSchema.parse(req.body);
  res.json(await usuarioService.actualizarPerfil(usuarioActualId(res), datos));
}

export async function listar(req: Request, res: Response): Promise<void> {
  const filtros = listarUsuariosQuery.parse(req.query);
  res.json(await usuarioService.listar(filtros));
}

export async function cambiarActivo(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  const { activo } = cambiarActivoSchema.parse(req.body);
  res.json(await usuarioService.cambiarActivo(usuarioActualId(res), id, activo));
}
