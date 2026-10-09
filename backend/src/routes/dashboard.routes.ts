import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authRequired, requireRole } from '../middlewares/auth.middleware';

export const dashboardRouter = Router();

dashboardRouter.get('/', authRequired, requireRole('ADMIN'), dashboardController.resumen);
