import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller';
import { authRequired, requireRole } from '../middlewares/auth.middleware';

export const usuariosRouter = Router();

usuariosRouter.use(authRequired);

// Perfil propio (cualquier rol)
usuariosRouter.get('/me', usuarioController.miPerfil);
usuariosRouter.put('/me', usuarioController.actualizarMiPerfil);

// Administración de usuarios (solo ADMIN)
usuariosRouter.get('/', requireRole('ADMIN'), usuarioController.listar);
usuariosRouter.patch('/:id/activo', requireRole('ADMIN'), usuarioController.cambiarActivo);
