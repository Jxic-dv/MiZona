import { z } from 'zod';

const fechaIso = z
  .string()
  .datetime({
    offset: true,
    message: 'La fecha debe estar en formato ISO 8601, por ejemplo 2026-10-10T08:00:00-06:00',
  })
  .transform((valor) => new Date(valor));

/** Día AAAA-MM-DD interpretado en hora de Guatemala (UTC-6, sin horario de verano). */
function diaGuatemala(finDelDia: boolean) {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
    .transform((dia) => new Date(`${dia}T${finDelDia ? '23:59:59.999' : '00:00:00.000'}-06:00`))
    .refine((fecha) => !Number.isNaN(fecha.getTime()), 'La fecha no es válida');
}

const idPositivo = z.number().int().positive();

export const avisoSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(5, 'El título debe tener al menos 5 caracteres')
      .max(150, 'El título no puede superar 150 caracteres'),
    descripcion: z.string().trim().max(2000, 'La descripción no puede superar 2000 caracteres').optional(),
    ubicacionDetalle: z.string().trim().max(250, 'La ubicación no puede superar 250 caracteres').optional(),
    categoriaId: idPositivo,
    zonaIds: z
      .array(idPositivo)
      .min(1, 'Selecciona al menos una zona')
      .max(25, 'No puedes seleccionar más de 25 zonas'),
    fechaInicio: fechaIso,
    fechaFinEstimada: fechaIso.nullish(),
  })
  .refine((datos) => !datos.fechaFinEstimada || datos.fechaFinEstimada > datos.fechaInicio, {
    message: 'La fecha de fin debe ser posterior a la de inicio',
    path: ['fechaFinEstimada'],
  });

export const listarAvisosQuery = z.object({
  zonaId: z.coerce.number().int().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  estado: z
    .enum(['PROGRAMADO', 'ACTIVO', 'CANCELADO', 'FINALIZADO', 'VIGENTES', 'TODOS'])
    .default('VIGENTES'),
  q: z.string().trim().max(100).optional(),
  desde: diaGuatemala(false).optional(),
  hasta: diaGuatemala(true).optional(),
  orden: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type AvisoInput = z.infer<typeof avisoSchema>;
export type ListarAvisosQuery = z.infer<typeof listarAvisosQuery>;
