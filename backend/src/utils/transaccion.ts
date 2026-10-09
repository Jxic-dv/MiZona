import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db';

/** Ejecuta varias operaciones como una sola transacción: todo se guarda o nada. */
export async function conTransaccion<T>(trabajo: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await trabajo(conn);
    await conn.commit();
    return resultado;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
