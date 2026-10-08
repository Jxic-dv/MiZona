import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authRequired } from '../middlewares/auth.middleware';

export const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.get('/me', authRequired, authController.me);
