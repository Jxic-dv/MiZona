import { Catalogo } from './catalogo.model';
export type Estado = 'PROGRAMADO' | 'ACTIVO' | 'CANCELADO' | 'FINALIZADO';
export interface Aviso {
  id: number;
  titulo: string;
  descripcion: string | null;
  ubicacionDetalle: string | null;
  fechaInicio: string;
  fechaFinEstimada: string | null;
  estado: Estado;
  categoria: Catalogo;
  zonas: Catalogo[];
  creadoPor: Catalogo;
  createdAt: string;
  updatedAt: string;
}
export const estados: Record<Estado, string> = {
  PROGRAMADO: 'Programado',
  ACTIVO: 'Activo',
  CANCELADO: 'Cancelado',
  FINALIZADO: 'Finalizado',
};

export interface DatosAviso {
  titulo: string;
  descripcion?: string;
  ubicacionDetalle?: string;
  categoriaId: number;
  zonaIds: number[];
  fechaInicio: string;
  fechaFinEstimada: string | null;
}
export interface ResultadoAviso {
  aviso: Aviso;
  destinatarios: number;
}
