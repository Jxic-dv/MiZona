import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import type { Catalogo } from '../models/catalogo.model';

interface CatalogoRow extends RowDataPacket {
  id: number;
  nombre: string;
}

/**
 * Acceso a datos para catálogos simples (id + nombre): zonas y categorías.
 * Los nombres de tabla y columna son constantes del código (no vienen del usuario)
 * y se escapan con ?? como identificadores.
 */
export class CatalogoRepository {
  private readonly tabla: string;
  private readonly columnaId: string;

  constructor(tabla: string, columnaId: string) {
    this.tabla = tabla;
    this.columnaId = columnaId;
  }

  async listar(): Promise<Catalogo[]> {
    const [rows] = await pool.query<CatalogoRow[]>(
      'SELECT ?? AS id, nombre FROM ?? ORDER BY ??',
      [this.columnaId, this.tabla, this.columnaId],
    );
    return rows.map((row) => ({ id: row.id, nombre: row.nombre }));
  }

  async obtener(id: number): Promise<Catalogo | null> {
    const [rows] = await pool.query<CatalogoRow[]>(
      'SELECT ?? AS id, nombre FROM ?? WHERE ?? = ?',
      [this.columnaId, this.tabla, this.columnaId, id],
    );
    return rows[0] ? { id: rows[0].id, nombre: rows[0].nombre } : null;
  }

  async crear(nombre: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO ?? (nombre) VALUES (?)',
      [this.tabla, nombre],
    );
    return result.insertId;
  }

  async actualizar(id: number, nombre: string): Promise<void> {
    await pool.query('UPDATE ?? SET nombre = ? WHERE ?? = ?', [
      this.tabla,
      nombre,
      this.columnaId,
      id,
    ]);
  }

  async eliminar(id: number): Promise<void> {
    await pool.query('DELETE FROM ?? WHERE ?? = ?', [this.tabla, this.columnaId, id]);
  }
}
