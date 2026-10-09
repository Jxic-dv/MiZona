import * as avisoRepository from '../repositories/aviso.repository';
import * as estadisticaRepository from '../repositories/estadistica.repository';

export async function obtenerResumen() {
  await avisoRepository.sincronizarEstados();

  const [porEstado, porCategoria, porZona, suscriptores, notificaciones, ultimosDias] =
    await Promise.all([
      estadisticaRepository.avisosPorEstado(),
      estadisticaRepository.avisosPorCategoria(),
      estadisticaRepository.avisosPorZona(),
      estadisticaRepository.suscriptores(),
      estadisticaRepository.notificaciones(),
      estadisticaRepository.avisosUltimosDias(14),
    ]);

  const avisosPorEstado = { PROGRAMADO: 0, ACTIVO: 0, CANCELADO: 0, FINALIZADO: 0 };
  for (const fila of porEstado) {
    if (fila.estado in avisosPorEstado) {
      avisosPorEstado[fila.estado as keyof typeof avisosPorEstado] = fila.total;
    }
  }

  return {
    avisosPorEstado,
    avisosPorCategoria: porCategoria,
    avisosPorZona: porZona,
    suscriptores,
    notificaciones,
    avisosUltimos14Dias: ultimosDias,
  };
}
