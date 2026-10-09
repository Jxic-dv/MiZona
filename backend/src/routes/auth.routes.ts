import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authRequired } from '../middlewares/auth.middleware';
import { limiteAutenticacion } from '../middlewares/rate-limit.middleware';

export const authRouter = Router();

authRouter.post('/register', limiteAutenticacion, authController.register);
authRouter.post('/login', limiteAutenticacion, authController.login);
authRouter.get('/me', authRequired, authController.me);
