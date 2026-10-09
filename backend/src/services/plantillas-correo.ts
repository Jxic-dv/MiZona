import { config } from '../config/env';
import type { Aviso, TipoNotificacion } from '../models/aviso.model';

export interface Correo {
  subject: string;
  html: string;
  text: string;
}

const formatoFecha = new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'America/Guatemala',
});

function esc(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function urlConfirmacion(token: string): string {
  return `${config.apiPublicUrl}/api/suscripciones/confirmar/${token}`;
}

export function urlBaja(token: string): string {
  return `${config.apiPublicUrl}/api/suscripciones/baja/${token}`;
}

function marco(contenido: string, pie: string): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f4f7f7;font-family:Arial,Helvetica,sans-serif;color:#222222;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #d9e2e2;">
    <div style="background:#0b5f5e;color:#ffffff;padding:16px 24px;font-size:20px;font-weight:bold;">MiZona</div>
    <div style="padding:24px;line-height:1.5;">${contenido}</div>
    <div style="padding:16px 24px;background:#f4f7f7;font-size:12px;color:#444444;">${pie}</div>
  </div>
</body>
</html>`;
}

export function plantillaConfirmacion(tokenConfirmacion: string, tokenBaja: string): Correo {
  const enlace = urlConfirmacion(tokenConfirmacion);
  const baja = urlBaja(tokenBaja);

  return {
    subject: 'Confirma tu suscripción a MiZona',
    text:
      'Recibimos una solicitud para suscribir este correo a los avisos de MiZona.\n\n' +
      `Para confirmar, abre este enlace: ${enlace}\n\n` +
      `Si no fuiste tú, ignora este mensaje o cancela aquí: ${baja}`,
    html: marco(
      `<h2 style="margin-top:0;color:#0b5f5e;">Confirma tu suscripción</h2>
       <p>Recibimos una solicitud para suscribir este correo a los avisos de MiZona.</p>
       <p><a href="${esc(enlace)}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#0b5f5e;color:#ffffff;text-decoration:none;">Confirmar suscripción</a></p>`,
      `Si no fuiste tú, ignora este mensaje o <a href="${esc(baja)}">cancela la solicitud</a>.`,
    ),
  };
}

const ENCABEZADOS: Record<TipoNotificacion, { asunto: string; titulo: string }> = {
  NUEVO: { asunto: 'Nuevo aviso en tu zona', titulo: 'Nuevo aviso en tu zona' },
  ACTUALIZACION: { asunto: 'Aviso actualizado', titulo: 'Un aviso fue actualizado' },
  CANCELACION: { asunto: 'Aviso cancelado', titulo: 'Un aviso fue cancelado' },
};

export function plantillaAviso(aviso: Aviso, tipo: TipoNotificacion, tokenBaja: string): Correo {
  const encabezado = ENCABEZADOS[tipo];
  const zonas = aviso.zonas.map((zona) => zona.nombre).join(', ');
  const inicio = formatoFecha.format(aviso.fechaInicio);
  const fin = aviso.fechaFinEstimada ? formatoFecha.format(aviso.fechaFinEstimada) : 'Por definir';
  const enlaceAviso = `${config.frontendUrl}/avisos/${aviso.id}`;
  const baja = urlBaja(tokenBaja);

  const filas: Array<[string, string]> = [
    ['Categoría', aviso.categoria.nombre],
    ['Zonas', zonas],
    ['Estado', aviso.estado],
    ['Inicio', inicio],
    ['Fin estimado', fin],
  ];
  if (aviso.ubicacionDetalle) {
    filas.splice(2, 0, ['Lugar', aviso.ubicacionDetalle]);
  }

  const textoFilas = filas.map(([clave, valor]) => `${clave}: ${valor}`).join('\n');
  const htmlFilas = filas
    .map(
      ([clave, valor]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#444444;vertical-align:top;"><strong>${esc(clave)}</strong></td><td style="padding:4px 0;">${esc(valor)}</td></tr>`,
    )
    .join('');

  return {
    subject: `${encabezado.asunto}: ${aviso.titulo}`,
    text:
      `${encabezado.titulo}\n\n${aviso.titulo}\n${textoFilas}\n` +
      (aviso.descripcion ? `\n${aviso.descripcion}\n` : '') +
      `\nMás detalles: ${enlaceAviso}\n\nPara dejar de recibir avisos: ${baja}`,
    html: marco(
      `<h2 style="margin-top:0;color:#0b5f5e;">${esc(encabezado.titulo)}</h2>
       <h3 style="margin-bottom:8px;">${esc(aviso.titulo)}</h3>
       <table style="border-collapse:collapse;">${htmlFilas}</table>
       ${aviso.descripcion ? `<p>${esc(aviso.descripcion)}</p>` : ''}
       <p><a href="${esc(enlaceAviso)}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#0b5f5e;color:#ffffff;text-decoration:none;">Ver el aviso</a></p>`,
      `Recibes este correo porque te suscribiste a los avisos de tu zona. <a href="${esc(baja)}">Dejar de recibir avisos</a>.`,
    ),
  };
}
