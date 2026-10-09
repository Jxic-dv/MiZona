import type { Aviso, TipoNotificacion } from '../models/aviso.model';
import type { Destinatario } from '../models/suscriptor.model';
import * as notificacionRepository from '../repositories/notificacion.repository';
import * as suscriptorRepository from '../repositories/suscriptor.repository';
import * as correoService from './correo.service';
import { plantillaAviso } from './plantillas-correo';

/**
 * Busca a los suscriptores confirmados de las zonas indicadas (sin repetir) y les envía el aviso.
 * Devuelve cuántos destinatarios hay; el envío ocurre en segundo plano para no hacer esperar al funcionario.
 */
export async function notificar(
  aviso: Aviso,
  tipo: TipoNotificacion,
  zonaIds: number[],
): Promise<number> {
  const destinatarios = await suscriptorRepository.confirmadosPorZonas(zonaIds);

  if (destinatarios.length > 0) {
    void enviarATodos(aviso, tipo, destinatarios).catch((err) => {
      console.error('[notificaciones] Error inesperado:', err);
    });
  }
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
