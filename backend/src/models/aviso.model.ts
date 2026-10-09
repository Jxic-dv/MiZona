export type EstadoAviso = 'PROGRAMADO' | 'ACTIVO' | 'CANCELADO' | 'FINALIZADO';
export type TipoNotificacion = 'NUEVO' | 'ACTUALIZACION' | 'CANCELACION';

export interface ZonaResumen {
  id: number;
  nombre: string;
}

export interface Aviso {
  id: number;
  titulo: string;
  descripcion: string | null;
  ubicacionDetalle: string | null;
  fechaInicio: Date;
  fechaFinEstimada: Date | null;
  estado: EstadoAviso;
  categoria: { id: number; nombre: string };
  zonas: ZonaResumen[];
  creadoPor: { id: number; nombre: string };
  createdAt: Date;
  updatedAt: Date;
}
