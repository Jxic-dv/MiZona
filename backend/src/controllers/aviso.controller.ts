import type { Request, Response } from 'express';
import type { TokenPayload } from '../models/usuario.model';
import { avisoSchema, listarAvisosQuery } from '../schemas/aviso.schema';
import * as avisoService from '../services/aviso.service';
import { parseId } from '../utils/parse-id';

function usuarioActual(res: Response): TokenPayload {
  return res.locals.user as TokenPayload;
}

export async function listar(req: Request, res: Response): Promise<void> {
  const filtros = listarAvisosQuery.parse(req.query);
  res.json(await avisoService.listar(filtros));
}

export async function obtener(req: Request, res: Response): Promise<void> {
  res.json(await avisoService.obtener(parseId(req.params.id)));
}

export async function crear(req: Request, res: Response): Promise<void> {
  const datos = avisoSchema.parse(req.body);
  res.status(201).json(await avisoService.crear(usuarioActual(res), datos));
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id);
  const datos = avisoSchema.parse(req.body);
  res.json(await avisoService.actualizar(usuarioActual(res), id, datos));
}

export async function cancelar(req: Request, res: Response): Promise<void> {
  res.json(await avisoService.cancelar(usuarioActual(res), parseId(req.params.id)));
}

export async function finalizar(req: Request, res: Response): Promise<void> {
  res.json(await avisoService.finalizar(usuarioActual(res), parseId(req.params.id)));
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  await avisoService.eliminar(parseId(req.params.id));
  res.status(204).send();
}
