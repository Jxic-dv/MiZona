import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db';
import type { Destinatario, Suscriptor } from '../models/suscriptor.model';

interface SuscriptorRow extends RowDataPacket {
  id_suscriptor: number;
  email: string;
  confirmado: number;
  token_confirmacion: string;
  token_baja: string;
}

export async function buscarPorEmail(email: string): Promise<Suscriptor | null> {
  const [rows] = await pool.query<SuscriptorRow[]>(
    `SELECT id_suscriptor, email, confirmado, token_confirmacion, token_baja
     FROM suscriptores WHERE email = ?`,
    [email],
  );
  const row = rows[0];
  return row
    ? {
        id: row.id_suscriptor,
        email: row.email,
        confirmado: Boolean(row.confirmado),
        tokenConfirmacion: row.token_confirmacion,
        tokenBaja: row.token_baja,
      }
    : null;
}

export async function insertar(
  conn: PoolConnection,
  email: string,
  tokenConfirmacion: string,
  tokenBaja: string,
  confirmado = false,
): Promise<number> {
  const [result] = await conn.query<ResultSetHeader>(
    `INSERT INTO suscriptores (email, confirmado, token_confirmacion, token_baja)
     VALUES (?, ?, ?, ?)`,
    [email, confirmado ? 1 : 0, tokenConfirmacion, tokenBaja],
  );
  return result.insertId;
}

export async function actualizarTokenConfirmacion(
  conn: PoolConnection,
  id: number,
  tokenConfirmacion: string,
): Promise<void> {
  await conn.query('UPDATE suscriptores SET token_confirmacion = ? WHERE id_suscriptor = ?', [
    tokenConfirmacion,
    id,
  ]);
}

export async function reemplazarZonas(
  conn: PoolConnection,
  suscriptorId: number,
  zonaIds: number[],
): Promise<void> {
  await conn.query('DELETE FROM suscripcion_zonas WHERE id_suscriptor = ?', [suscriptorId]);
  const pares = zonaIds.map((zonaId) => [suscriptorId, zonaId]);
  await conn.query('INSERT INTO suscripcion_zonas (id_suscriptor, id_zona) VALUES ?', [pares]);
}

/** Devuelve true si existía un suscriptor con ese token (la operación es idempotente). */
export async function confirmarPorToken(token: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE suscriptores SET confirmado = 1 WHERE token_confirmacion = ?',
    [token],
  );
  return result.affectedRows > 0;
}

export async function eliminarPorTokenBaja(token: string): Promise<boolean> {
  const [result] = await pool.query<ResultSetHeader>('DELETE FROM suscriptores WHERE token_baja = ?', [
    token,
  ]);
  return result.affectedRows > 0;
}

/** Suscriptores confirmados de al menos una de las zonas, sin repetir. */
export async function confirmadosPorZonas(zonaIds: number[]): Promise<Destinatario[]> {
  if (zonaIds.length === 0) {
    return [];
  }
  const [rows] = await pool.query<SuscriptorRow[]>(
    `SELECT DISTINCT s.id_suscriptor, s.email, s.token_baja
     FROM suscriptores s
     JOIN suscripcion_zonas sz ON sz.id_suscriptor = s.id_suscriptor
     WHERE s.confirmado = 1 AND sz.id_zona IN (?)`,
    [zonaIds],
  );
  return rows.map((row) => ({ id: row.id_suscriptor, email: row.email, tokenBaja: row.token_baja }));
}
