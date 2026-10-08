import { z } from 'zod';

const nombre = z
  .string()
  .trim()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(120, 'El nombre no puede superar 120 caracteres');

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('El correo no tiene un formato válido')
  .max(150, 'El correo no puede superar 150 caracteres');

const passwordNueva = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar 72 caracteres');

export const registerSchema = z.object({
  nombre,
  email,
  password: passwordNueva,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const actualizarPerfilSchema = z
  .object({
    nombre: nombre.optional(),
    passwordActual: z.string().optional(),
    passwordNueva: passwordNueva.optional(),
  })
  .refine((datos) => datos.nombre !== undefined || datos.passwordNueva !== undefined, {
    message: 'Envía al menos un campo para actualizar',
  });

export const cambiarActivoSchema = z.object({
  activo: z.boolean(),
});

export const listarUsuariosQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().max(100).optional(),
  activo: z
    .enum(['true', 'false'])
    .optional()
    .transform((valor) => (valor === undefined ? undefined : valor === 'true')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ActualizarPerfilInput = z.infer<typeof actualizarPerfilSchema>;
export type ListarUsuariosQuery = z.infer<typeof listarUsuariosQuery>;
