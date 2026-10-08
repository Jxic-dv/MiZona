import type { Request, Response } from 'express';
import { catalogoSchema } from '../schemas/catalogo.schema';
import type { CatalogoService } from '../services/catalogo.service';
import { parseId } from '../utils/parse-id';

/** Crea los handlers HTTP de un catálogo a partir de su servicio. */
export function crearCatalogoController(service: CatalogoService) {
  return {
    async listar(_req: Request, res: Response): Promise<void> {
      res.json(await service.listar());
    },

    async obtener(req: Request, res: Response): Promise<void> {
      res.json(await service.obtener(parseId(req.params.id)));
    },

    async crear(req: Request, res: Response): Promise<void> {
      const { nombre } = catalogoSchema.parse(req.body);
      res.status(201).json(await service.crear(nombre));
    },

    async actualizar(req: Request, res: Response): Promise<void> {
      const id = parseId(req.params.id);
      const { nombre } = catalogoSchema.parse(req.body);
      res.json(await service.actualizar(id, nombre));
    },

    async eliminar(req: Request, res: Response): Promise<void> {
      await service.eliminar(parseId(req.params.id));
      res.status(204).send();
    },
  };
}

export type CatalogoController = ReturnType<typeof crearCatalogoController>;
