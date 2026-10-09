import { z } from 'zod';
import { AppError } from './app-error';

const idSchema = z.coerce.number().int().positive();

export function parseId(value: unknown): number {
  const result = idSchema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, 'El identificador no es válido');
  }
  return result.data;
}
