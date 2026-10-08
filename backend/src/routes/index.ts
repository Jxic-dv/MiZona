import { Router } from 'express';
import { authRouter } from './auth.routes';
import { categoriasRouter } from './categorias.routes';
import { usuariosRouter } from './usuarios.routes';
import { zonasRouter } from './zonas.routes';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/usuarios', usuariosRouter);
apiRouter.use('/zonas', zonasRouter);
apiRouter.use('/categorias', categoriasRouter);
