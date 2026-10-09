import { randomBytes } from 'node:crypto';
import * as suscriptorRepository from '../repositories/suscriptor.repository';
import { AppError } from '../utils/app-error';
import { conTransaccion } from '../utils/transaccion';
import * as correoService from './correo.service';
import { plantillaConfirmacion } from './plantillas-correo';

function nuevoToken(): string {
  return randomBytes(32).toString('hex'); // 64 caracteres hexadecimales
}

/**
 * Registra (o actualiza si aún no estaba confirmado) a un suscriptor y le envía un correo de confirmación.
 * Las zonas solo reciben avisos cuando el correo se confirma.
 */
export async function suscribir(email: string, zonaIds: number[]): Promise<string> {
  const zonas = [...new Set(zonaIds)];
  const existente = await suscriptorRepository.buscarPorEmail(email);

  if (existente?.confirmado) {
    throw new AppError(
      409,
      'Este correo ya está suscrito. Para cambiar tus zonas, usa el enlace de baja de cualquier correo de MiZona y vuelve a suscribirte.',
    );
  }

  const tokenConfirmacion = nuevoToken();
  let tokenBaja: string;

  if (existente) {
    tokenBaja = existente.tokenBaja;
    await conTransaccion(async (conn) => {
      await suscriptorRepository.actualizarTokenConfirmacion(conn, existente.id, tokenConfirmacion);
      await suscriptorRepository.reemplazarZonas(conn, existente.id, zonas);
    });
  } else {
    tokenBaja = nuevoToken();
    await conTransaccion(async (conn) => {
      const id = await suscriptorRepository.insertar(conn, email, tokenConfirmacion, tokenBaja);
      await suscriptorRepository.reemplazarZonas(conn, id, zonas);
    });
  }

  try {
    await correoService.enviar({ to: email, ...plantillaConfirmacion(tokenConfirmacion, tokenBaja) });
  } catch (err) {
    console.error('[suscripciones] No se pudo enviar el correo de confirmación:', err);
    throw new AppError(
      502,
      'No pudimos enviar el correo de confirmación. Inténtalo de nuevo en unos minutos.',
    );
  }

  return 'Te enviamos un correo para confirmar tu suscripción. Revisa tu bandeja de entrada.';
}

export function confirmar(token: string): Promise<boolean> {
  return suscriptorRepository.confirmarPorToken(token);
}

export function darDeBaja(token: string): Promise<boolean> {
  return suscriptorRepository.eliminarPorTokenBaja(token);
}
