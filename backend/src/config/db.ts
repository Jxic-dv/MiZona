import mysql from 'mysql2/promise';
import { config } from './env';

export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  // Todas las fechas se guardan y leen en UTC; el frontend las muestra en hora local
  timezone: 'Z',
});
