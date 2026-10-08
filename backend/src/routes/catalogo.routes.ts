import { Router } from 'express';
import type { CatalogoController } from '../controllers/catalogo.controller';
import { authRequired, requireRole } from '../middlewares/auth.middleware';

/** Lectura pública; crear, editar y eliminar solo para ADMIN. */
export function crearCatalogoRouter(controller: CatalogoController): Router {
  const router = Router();

  router.get('/', controller.listar);
  router.get('/:id', controller.obtener);
  router.post('/', authRequired, requireRole('ADMIN'), controller.crear);
  router.put('/:id', authRequired, requireRole('ADMIN'), controller.actualizar);
  router.delete('/:id', authRequired, requireRole('ADMIN'), controller.eliminar);

  return router;
}
