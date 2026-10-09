import type { Request, Response } from 'express';
import { suscripcionSchema, tokenSchema } from '../schemas/suscripcion.schema';
import * as suscripcionService from '../services/suscripcion.service';
import { paginaHtml } from '../utils/pagina-html';

export async function suscribir(req: Request, res: Response): Promise<void> {
  const { email, zonaIds } = suscripcionSchema.parse(req.body);
  const mensaje = await suscripcionService.suscribir(email, zonaIds);
  res.status(201).json({ mensaje });
}

// Los enlaces de los correos abren estas páginas directamente en el navegador

export async function confirmar(req: Request, res: Response): Promise<void> {
  const token = tokenSchema.safeParse(req.params.token);
  const exito = token.success && (await suscripcionService.confirmar(token.data));

  if (exito) {
    res
      .type('html')
      .send(paginaHtml('Suscripción confirmada', 'Listo, desde ahora recibirás los avisos de tus zonas por correo.'));
    return;
  }
  res
    .status(404)
    .type('html')
    .send(paginaHtml('Enlace no válido', 'Este enlace no es válido o ya fue utilizado.'));
}

export async function darDeBaja(req: Request, res: Response): Promise<void> {
  const token = tokenSchema.safeParse(req.params.token);
  const exito = token.success && (await suscripcionService.darDeBaja(token.data));

  if (exito) {
    res
      .type('html')
      .send(paginaHtml('Suscripción cancelada', 'Ya no recibirás avisos en este correo. Puedes volver a suscribirte cuando quieras.'));
    return;
  }
  res
    .status(404)
    .type('html')
    .send(paginaHtml('Enlace no válido', 'Este enlace no es válido o la suscripción ya fue cancelada.'));
}
