import type { Catalogo } from '../models/catalogo.model';
import type { CatalogoRepository } from '../repositories/catalogo.repository';
import { AppError } from '../utils/app-error';
import { esErrorMysql } from '../utils/mysql-error';

/** Lógica de negocio compartida por los catálogos simples (zonas y categorías). */
export class CatalogoService {
  private readonly repo: CatalogoRepository;
  private readonly entidad: string; // en minúscula y femenino: "zona", "categoría"

  constructor(repo: CatalogoRepository, entidad: string) {
    this.repo = repo;
    this.entidad = entidad;
  }

  listar(): Promise<Catalogo[]> {
    return this.repo.listar();
  }

  async obtener(id: number): Promise<Catalogo> {
    const item = await this.repo.obtener(id);
    if (!item) {
      throw new AppError(404, `La ${this.entidad} no existe`);
    }
    return item;
  }

  async crear(nombre: string): Promise<Catalogo> {
    try {
      const id = await this.repo.crear(nombre);
      return { id, nombre };
    } catch (err) {
      if (esErrorMysql(err, 'ER_DUP_ENTRY')) {
        throw new AppError(409, `Ya existe una ${this.entidad} con ese nombre`);
      }
      throw err;
    }
  }

  async actualizar(id: number, nombre: string): Promise<Catalogo> {
    await this.obtener(id);
    try {
      await this.repo.actualizar(id, nombre);
      return { id, nombre };
    } catch (err) {
      if (esErrorMysql(err, 'ER_DUP_ENTRY')) {
        throw new AppError(409, `Ya existe una ${this.entidad} con ese nombre`);
      }
      throw err;
    }
  }

  async eliminar(id: number): Promise<void> {
    await this.obtener(id);
    try {
      await this.repo.eliminar(id);
    } catch (err) {
      if (esErrorMysql(err, 'ER_ROW_IS_REFERENCED_2')) {
        throw new AppError(409, `No se puede eliminar: la ${this.entidad} está en uso`);
      }
      throw err;
    }
  }
}
