import { Router } from 'express';
import * as avisoController from '../controllers/aviso.controller';
import { authRequired, requireRole } from '../middlewares/auth.middleware';

export const avisosRouter = Router();

// Consulta pública (con filtros y paginación)
avisosRouter.get('/', avisoController.listar);
avisosRouter.get('/:id', avisoController.obtener);

// Gestión: FUNCIONARIO (solo sus avisos) o ADMIN (todos)
const gestion = [authRequired, requireRole('FUNCIONARIO', 'ADMIN')];
avisosRouter.post('/', ...gestion, avisoController.crear);
avisosRouter.put('/:id', ...gestion, avisoController.actualizar);
avisosRouter.post('/:id/cancelar', ...gestion, avisoController.cancelar);
avisosRouter.post('/:id/finalizar', ...gestion, avisoController.finalizar);

// Eliminación definitiva: solo ADMIN
avisosRouter.delete('/:id', authRequired, requireRole('ADMIN'), avisoController.eliminar);
