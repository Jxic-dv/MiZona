import { Router } from 'express';
import * as suscripcionController from '../controllers/suscripcion.controller';
import { limiteSuscripcion } from '../middlewares/rate-limit.middleware';

export const suscripcionesRouter = Router();

suscripcionesRouter.post('/', limiteSuscripcion, suscripcionController.suscribir);
suscripcionesRouter.get('/confirmar/:token', suscripcionController.confirmar);
suscripcionesRouter.get('/baja/:token', suscripcionController.darDeBaja);
