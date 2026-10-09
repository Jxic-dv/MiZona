import { Estado } from './aviso.model';
export interface Resumen {
  avisosPorEstado: Record<Estado, number>;
  avisosPorCategoria: { categoria: string; total: number }[];
  avisosPorZona: { zona: string; total: number }[];
  suscriptores: { confirmados: number; pendientes: number };
  notificaciones: { enviadas: number; fallidas: number };
  avisosUltimos14Dias: { fecha: string; total: number }[];
}
