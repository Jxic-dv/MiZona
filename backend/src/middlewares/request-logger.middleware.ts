import type { NextFunction, Request, Response } from 'express';

/** Registro básico de cada petición: método, ruta, código de estado y duración. */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const inicio = Date.now();
  res.on('finish', () => {
    // Se ocultan los tokens de los enlaces de correo para que no queden en los registros
    const ruta = req.originalUrl.replace(/[a-f0-9]{64}/g, '***');
    console.log(
      `${new Date().toISOString()} ${req.method} ${ruta} ${res.statusCode} ${Date.now() - inicio}ms`,
    );
  });
  next();
}
