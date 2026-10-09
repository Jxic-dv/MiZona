import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';

type Fila<T> = Array<RowDataPacket & T>;

export async function avisosPorEstado(): Promise<Array<{ estado: string; total: number }>> {
  const [rows] = await pool.query<Fila<{ estado: string; total: number }>>(
    'SELECT estado, COUNT(*) AS total FROM avisos GROUP BY estado',
  );
  return rows.map((row) => ({ estado: row.estado, total: row.total }));
}

export async function avisosPorCategoria(): Promise<Array<{ categoria: string; total: number }>> {
  const [rows] = await pool.query<Fila<{ categoria: string; total: number }>>(
    `SELECT c.nombre AS categoria, COUNT(a.id_aviso) AS total
     FROM categorias c
     LEFT JOIN avisos a ON a.id_categoria = c.id_categoria
     GROUP BY c.id_categoria, c.nombre
     ORDER BY c.id_categoria`,
  );
  return rows.map((row) => ({ categoria: row.categoria, total: row.total }));
}

export async function avisosPorZona(): Promise<Array<{ zona: string; total: number }>> {
  const [rows] = await pool.query<Fila<{ zona: string; total: number }>>(
    `SELECT z.nombre AS zona, COUNT(az.id_aviso) AS total
     FROM zonas z
     JOIN aviso_zonas az ON az.id_zona = z.id_zona
     GROUP BY z.id_zona, z.nombre
     ORDER BY total DESC, z.id_zona
     LIMIT 10`,
  );
  return rows.map((row) => ({ zona: row.zona, total: row.total }));
}

export async function suscriptores(): Promise<{ confirmados: number; pendientes: number }> {
  const [rows] = await pool.query<Fila<{ confirmados: number; pendientes: number }>>(
    `SELECT COUNT(CASE WHEN confirmado = 1 THEN 1 END) AS confirmados,
            COUNT(CASE WHEN confirmado = 0 THEN 1 END) AS pendientes
     FROM suscriptores`,
  );
  return { confirmados: rows[0]?.confirmados ?? 0, pendientes: rows[0]?.pendientes ?? 0 };
}

export async function notificaciones(): Promise<{ enviadas: number; fallidas: number }> {
  const [rows] = await pool.query<Fila<{ enviadas: number; fallidas: number }>>(
    `SELECT COUNT(CASE WHEN exito = 1 THEN 1 END) AS enviadas,
            COUNT(CASE WHEN exito = 0 THEN 1 END) AS fallidas
     FROM notificaciones_enviadas`,
  );
  return { enviadas: rows[0]?.enviadas ?? 0, fallidas: rows[0]?.fallidas ?? 0 };
}

export async function avisosUltimosDias(
  dias: number,
): Promise<Array<{ fecha: string; total: number }>> {
  const [rows] = await pool.query<Fila<{ fecha: string; total: number }>>(
    `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS fecha, COUNT(*) AS total
     FROM avisos
     WHERE created_at >= UTC_TIMESTAMP() - INTERVAL ? DAY
     GROUP BY fecha
     ORDER BY fecha`,
    [dias],
  );
  return rows.map((row) => ({ fecha: row.fecha, total: row.total }));
}
