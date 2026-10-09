import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pool } from './config/db';
import { config } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import { apiRouter } from './routes/index';

export const app = express();

// Detrás de un proxy (Render, Railway...) hay que activarlo para identificar la IP real
if (config.trustProxy) {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '100kb' }));
if (!config.isTest) {
  app.use(requestLogger);
}

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'conectada' });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);
