import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error';
import { esErrorMysql } from '../utils/mysql-error';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

/** Manejo centralizado de errores: nunca se expone la traza al cliente. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Datos inválidos',
      detalles: err.issues.map((issue) => ({
        campo: issue.path.map(String).join('.'),
        mensaje: issue.message,
      })),
    });
    return;
  }

  const tipo = (err as { type?: string } | null)?.type;
  if (tipo === 'entity.parse.failed') {
    res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido' });
    return;
  }
  if (tipo === 'entity.too.large') {
    res.status(413).json({ error: 'La solicitud es demasiado grande' });
    return;
  }

  if (esErrorMysql(err, 'ER_DUP_ENTRY')) {
    res.status(409).json({ error: 'El registro ya existe' });
    return;
  }
  if (esErrorMysql(err, 'ER_NO_REFERENCED_ROW_2')) {
    res.status(400).json({ error: 'La categoría o alguna de las zonas indicadas no existe' });
    return;
  }
  if (esErrorMysql(err, 'ER_ROW_IS_REFERENCED_2')) {
    res.status(409).json({ error: 'No se puede eliminar porque el registro está en uso' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
