import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db';
import type { Aviso, EstadoAviso, ZonaResumen } from '../models/aviso.model';

interface AvisoRow extends RowDataPacket {
  id_aviso: number;
  titulo: string;
  descripcion: string | null;
  ubicacion_detalle: string | null;
  fecha_inicio: Date;
  fecha_fin_estimada: Date | null;
  estado: EstadoAviso;
  id_categoria: number;
  categoria_nombre: string;
  creado_por: number;
  autor_nombre: string;
  created_at: Date;
  updated_at: Date;
}

interface ZonaAvisoRow extends RowDataPacket {
  id_aviso: number;
  id_zona: number;
  nombre: string;
}

const SELECT_AVISO = `
  SELECT a.id_aviso, a.titulo, a.descripcion, a.ubicacion_detalle, a.fecha_inicio,
         a.fecha_fin_estimada, a.estado, a.id_categoria, c.nombre AS categoria_nombre,
         a.creado_por, u.nombre AS autor_nombre, a.created_at, a.updated_at
  FROM avisos a
  JOIN categorias c ON c.id_categoria = a.id_categoria
  JOIN usuarios u ON u.id_usuario = a.creado_por`;

function mapear(row: AvisoRow, zonas: ZonaResumen[]): Aviso {
  return {
    id: row.id_aviso,
    titulo: row.titulo,
    descripcion: row.descripcion,
    ubicacionDetalle: row.ubicacion_detalle,
    fechaInicio: row.fecha_inicio,
    fechaFinEstimada: row.fecha_fin_estimada,
    estado: row.estado,
    categoria: { id: row.id_categoria, nombre: row.categoria_nombre },
    zonas,
    creadoPor: { id: row.creado_por, nombre: row.autor_nombre },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function cargarZonas(avisoIds: number[]): Promise<Map<number, ZonaResumen[]>> {
  const mapa = new Map<number, ZonaResumen[]>();
  if (avisoIds.length === 0) {
    return mapa;
  }

  const [rows] = await pool.query<ZonaAvisoRow[]>(
    `SELECT az.id_aviso, z.id_zona, z.nombre
     FROM aviso_zonas az
     JOIN zonas z ON z.id_zona = az.id_zona
     WHERE az.id_aviso IN (?)
     ORDER BY z.id_zona`,
    [avisoIds],
  );
  for (const row of rows) {
    const lista = mapa.get(row.id_aviso) ?? [];
    lista.push({ id: row.id_zona, nombre: row.nombre });
    mapa.set(row.id_aviso, lista);
  }
  return mapa;
}


export interface DatosAviso {
  titulo: string;
  descripcion: string | null;
  ubicacionDetalle: string | null;
  fechaInicio: Date;
  fechaFinEstimada: Date | null;
  estado: EstadoAviso;
  categoriaId: number;
}

export async function insertar(
  conn: PoolConnection,
  datos: DatosAviso & { creadoPor: number },
): Promise<number> {
  const [result] = await conn.query<ResultSetHeader>(
    `INSERT INTO avisos (id_categoria, titulo, descripcion, ubicacion_detalle, fecha_inicio,
                         fecha_fin_estimada, estado, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.categoriaId,
      datos.titulo,
      datos.descripcion,
      datos.ubicacionDetalle,
      datos.fechaInicio,
      datos.fechaFinEstimada,
      datos.estado,
      datos.creadoPor,
    ],
  );
  return result.insertId;
}

export async function actualizar(conn: PoolConnection, id: number, datos: DatosAviso): Promise<void> {
  await conn.query(
    `UPDATE avisos
     SET id_categoria = ?, titulo = ?, descripcion = ?, ubicacion_detalle = ?,
         fecha_inicio = ?, fecha_fin_estimada = ?, estado = ?
     WHERE id_aviso = ?`,
    [
      datos.categoriaId,
      datos.titulo,
      datos.descripcion,
      datos.ubicacionDetalle,
      datos.fechaInicio,
      datos.fechaFinEstimada,
      datos.estado,
      id,
    ],
  );
}

export async function reemplazarZonas(
  conn: PoolConnection,
  avisoId: number,
  zonaIds: number[],
): Promise<void> {
  await conn.query('DELETE FROM aviso_zonas WHERE id_aviso = ?', [avisoId]);
  const pares = zonaIds.map((zonaId) => [avisoId, zonaId]);
  await conn.query('INSERT INTO aviso_zonas (id_aviso, id_zona) VALUES ?', [pares]);
}

export async function cambiarEstado(id: number, estado: EstadoAviso): Promise<void> {
  await pool.query('UPDATE avisos SET estado = ? WHERE id_aviso = ?', [estado, id]);
}

export async function eliminar(id: number): Promise<void> {
  await pool.query('DELETE FROM avisos WHERE id_aviso = ?', [id]);
}

/** Pasa los avisos a ACTIVO o FINALIZADO según sus fechas (todo en UTC). */
export async function sincronizarEstados(): Promise<void> {
  await pool.query(
    `UPDATE avisos SET estado = 'ACTIVO'
     WHERE estado = 'PROGRAMADO' AND fecha_inicio <= UTC_TIMESTAMP()`,
  );
  await pool.query(
    `UPDATE avisos SET estado = 'FINALIZADO'
     WHERE estado = 'ACTIVO' AND fecha_fin_estimada IS NOT NULL
       AND fecha_fin_estimada < UTC_TIMESTAMP()`,
  );
}


export async function buscarPorId(id: number): Promise<Aviso | null> {
  const [rows] = await pool.query<AvisoRow[]>(`${SELECT_AVISO} WHERE a.id_aviso = ?`, [id]);
  const row = rows[0];
  if (!row) {
    return null;
  }
  const zonas = await cargarZonas([id]);
  return mapear(row, zonas.get(id) ?? []);
}

export interface FiltrosAvisos {
  zonaId?: number;
  categoriaId?: number;
  estado: EstadoAviso | 'VIGENTES' | 'TODOS';
  q?: string;
  desde?: Date;
  hasta?: Date;
  orden: 'asc' | 'desc';
  page: number;
  limit: number;
}

export async function listar(filtros: FiltrosAvisos): Promise<{ items: Aviso[]; total: number }> {
  // Las condiciones son texto fijo con marcadores ?; nunca se concatena entrada del usuario.
  const condiciones: string[] = [];
  const params: Array<string | number | Date> = [];

  if (filtros.zonaId !== undefined) {
    condiciones.push(
      'EXISTS (SELECT 1 FROM aviso_zonas az WHERE az.id_aviso = a.id_aviso AND az.id_zona = ?)',
    );
    params.push(filtros.zonaId);
  }
  if (filtros.categoriaId !== undefined) {
    condiciones.push('a.id_categoria = ?');
    params.push(filtros.categoriaId);
  }
  if (filtros.estado === 'VIGENTES') {
    condiciones.push("a.estado IN ('PROGRAMADO', 'ACTIVO')");
  } else if (filtros.estado !== 'TODOS') {
    condiciones.push('a.estado = ?');
    params.push(filtros.estado);
  }
  if (filtros.q) {
    condiciones.push('(a.titulo LIKE ? OR a.descripcion LIKE ? OR a.ubicacion_detalle LIKE ?)');
    params.push(`%${filtros.q}%`, `%${filtros.q}%`, `%${filtros.q}%`);
  }
  if (filtros.desde) {
    condiciones.push('a.fecha_inicio >= ?');
    params.push(filtros.desde);
  }
  if (filtros.hasta) {
    condiciones.push('a.fecha_inicio <= ?');
    params.push(filtros.hasta);
  }
  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
  const direccion = filtros.orden === 'asc' ? 'ASC' : 'DESC'; // valor validado, no viene crudo del usuario

  const [conteo] = await pool.query<Array<RowDataPacket & { total: number }>>(
    `SELECT COUNT(*) AS total FROM avisos a ${where}`,
    params,
  );
  const [rows] = await pool.query<AvisoRow[]>(
    `${SELECT_AVISO} ${where}
     ORDER BY a.fecha_inicio ${direccion}, a.id_aviso ${direccion}
     LIMIT ? OFFSET ?`,
    [...params, filtros.limit, (filtros.page - 1) * filtros.limit],
  );

  const zonas = await cargarZonas(rows.map((row) => row.id_aviso));
  return {
    items: rows.map((row) => mapear(row, zonas.get(row.id_aviso) ?? [])),
    total: conteo[0]?.total ?? 0,
  };
}
