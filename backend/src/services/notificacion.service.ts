import type { Aviso, TipoNotificacion } from '../models/aviso.model';
import type { Destinatario } from '../models/suscriptor.model';
import * as notificacionRepository from '../repositories/notificacion.repository';
import * as suscriptorRepository from '../repositories/suscriptor.repository';
import * as correoService from './correo.service';
import { plantillaAviso } from './plantillas-correo';

/** Busca destinatarios antes de guardar el cambio para no publicarlo si falla la consulta. */
export const obtenerDestinatarios = suscriptorRepository.confirmadosPorZonas;

/** Espera los envíos y su registro antes de responder; devuelve destinatarios, no entregas. */
export async function notificar(
  aviso: Aviso,
  tipo: TipoNotificacion,
  destinatarios: Destinatario[],
): Promise<number> {
  await enviarATodos(aviso, tipo, destinatarios);
  return destinatarios.length;
}

async function enviarATodos(
  aviso: Aviso,
  tipo: TipoNotificacion,
  destinatarios: Destinatario[],
): Promise<void> {
  for (const destinatario of destinatarios) {
    let exito = true;
    try {
      await correoService.enviar({
        to: destinatario.email,
        ...plantillaAviso(aviso, tipo, destinatario.tokenBaja),
      });
    } catch (err) {
      exito = false;
      console.error(`[notificaciones] No se pudo enviar a ${destinatario.email}:`, err);
    }

    try {
      await notificacionRepository.registrar({
        avisoId: aviso.id,
        suscriptorId: destinatario.id,
        tipo,
        exito,
      });
    } catch (err) {
      console.error('[notificaciones] No se pudo registrar la notificación:', err);
    }
  }
}
