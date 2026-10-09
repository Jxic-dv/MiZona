import { z } from 'zod';
import { emailSchema } from './usuario.schema';

export const suscripcionSchema = z.object({
  email: emailSchema,
  zonaIds: z
    .array(z.number().int().positive())
    .min(1, 'Selecciona al menos una zona')
    .max(25, 'No puedes seleccionar más de 25 zonas'),
});

export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
