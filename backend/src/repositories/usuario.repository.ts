import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import type { Rol, UsuarioConPassword } from '../models/usuario.model';

interface UsuarioRow extends RowDataPacket {
  id_usuario: number;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Rol;
  activo: number;
  created_at: Date;
}

const COLUMNAS = 'id_usuario, nombre, email, password_hash, rol, activo, created_at';

function mapear(row: UsuarioRow): UsuarioConPassword {
  return {
    id: row.id_usuario,
    nombre: row.nombre,
    email: row.email,
    passwordHash: row.password_hash,
    rol: row.rol,
    activo: Boolean(row.activo),
    createdAt: row.created_at,
  };
}

export async function buscarPorId(id: number): Promise<UsuarioConPassword | null> {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT ${COLUMNAS} FROM usuarios WHERE id_usuario = ?`,
    [id],
  );
  return rows[0] ? mapear(rows[0]) : null;
}

export async function buscarPorEmail(email: string): Promise<UsuarioConPassword | null> {
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT ${COLUMNAS} FROM usuarios WHERE email = ?`,
    [email],
  );
  return rows[0] ? mapear(rows[0]) : null;
}

export async function crear(datos: {
  nombre: string;
  email: string;
  passwordHash: string;
  rol: Rol;
  activo: boolean;
}): Promise<number> {
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?)',
    [datos.nombre, datos.email, datos.passwordHash, datos.rol, datos.activo ? 1 : 0],
  );
  return result.insertId;
}

export async function actualizarNombre(id: number, nombre: string): Promise<void> {
  await pool.query('UPDATE usuarios SET nombre = ? WHERE id_usuario = ?', [nombre, id]);
}

export async function actualizarPassword(id: number, passwordHash: string): Promise<void> {
  await pool.query('UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?', [passwordHash, id]);
}

export async function cambiarActivo(id: number, activo: boolean): Promise<void> {
  await pool.query('UPDATE usuarios SET activo = ? WHERE id_usuario = ?', [activo ? 1 : 0, id]);
}

export interface FiltrosUsuarios {
  page: number;
  limit: number;
  q?: string;
  activo?: boolean;
}

export async function listar(
  filtros: FiltrosUsuarios,
): Promise<{ items: UsuarioConPassword[]; total: number }> {
  // Las condiciones son texto fijo con marcadores ?, nunca se concatena entrada del usuario.
  const condiciones: string[] = [];
  const params: Array<string | number> = [];

  if (filtros.q) {
    condiciones.push('(nombre LIKE ? OR email LIKE ?)');
    params.push(`%${filtros.q}%`, `%${filtros.q}%`);
  }
  if (filtros.activo !== undefined) {
    condiciones.push('activo = ?');
    params.push(filtros.activo ? 1 : 0);
  }
  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [conteo] = await pool.query<Array<RowDataPacket & { total: number }>>(
    `SELECT COUNT(*) AS total FROM usuarios ${where}`,
    params,
  );
  const [rows] = await pool.query<UsuarioRow[]>(
    `SELECT ${COLUMNAS} FROM usuarios ${where} ORDER BY created_at DESC, id_usuario DESC LIMIT ? OFFSET ?`,
    [...params, filtros.limit, (filtros.page - 1) * filtros.limit],
  );

  return { items: rows.map(mapear), total: conteo[0]?.total ?? 0 };
}
