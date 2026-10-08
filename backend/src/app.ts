import cors from 'cors';
import express from 'express';
import { pool } from './config/db';
import { config } from './config/env';
import { errorHandler, notFound } from './middlewares/error.middleware';
import { apiRouter } from './routes/index';

export const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '100kb' }));

// Comprueba que la API y la base de datos responden
app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok', db: 'conectada' });
});

app.use('/api', apiRouter);

app.use(notFound);
app.use(errorHandler);
