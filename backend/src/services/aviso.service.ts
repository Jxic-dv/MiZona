import type { Aviso, EstadoAviso } from '../models/aviso.model';
import type { TokenPayload } from '../models/usuario.model';
import * as avisoRepository from '../repositories/aviso.repository';
import type { DatosAviso } from '../repositories/aviso.repository';
import type { AvisoInput, ListarAvisosQuery } from '../schemas/aviso.schema';
import { AppError } from '../utils/app-error';
import { armarPagina } from '../utils/paginacion';
import { conTransaccion } from '../utils/transaccion';
import * as notificacionService from './notificacion.service';

export interface ResultadoAviso {
  aviso: Aviso;
  destinatarios: number;
}

function estadoInicial(fechaInicio: Date): EstadoAviso {
  return fechaInicio.getTime() > Date.now() ? 'PROGRAMADO' : 'ACTIVO';
}

function camposAviso(datos: AvisoInput): Omit<DatosAviso, 'estado'> {
  return {
    titulo: datos.titulo,
    descripcion: datos.descripcion || null,
    ubicacionDetalle: datos.ubicacionDetalle || null,
    fechaInicio: datos.fechaInicio,
    fechaFinEstimada: datos.fechaFinEstimada ?? null,
    categoriaId: datos.categoriaId,
  };
}

function validarFechaFin(datos: AvisoInput): void {
  if (datos.fechaFinEstimada && datos.fechaFinEstimada.getTime() <= Date.now()) {
    throw new AppError(400, 'La fecha de fin estimada ya pasó');
  }
}

/** Un funcionario solo modifica sus propios avisos; el ADMIN puede modificar cualquiera. */
function verificarPropiedad(usuario: TokenPayload, aviso: Aviso): void {
  if (usuario.rol !== 'ADMIN' && aviso.creadoPor.id !== Number(usuario.sub)) {
    throw new AppError(403, 'Solo puedes modificar los avisos que tú publicaste');
  }
}

function verificarModificable(aviso: Aviso): void {
  if (aviso.estado === 'CANCELADO' || aviso.estado === 'FINALIZADO') {
    throw new AppError(409, 'No se puede modificar un aviso cancelado o finalizado');
  }
}

export async function listar(filtros: ListarAvisosQuery) {
  await avisoRepository.sincronizarEstados();
  const { items, total } = await avisoRepository.listar(filtros);
  return armarPagina(items, total, filtros.page, filtros.limit);
}

export async function obtener(id: number): Promise<Aviso> {
  await avisoRepository.sincronizarEstados();
  const aviso = await avisoRepository.buscarPorId(id);
  if (!aviso) {
    throw new AppError(404, 'El aviso no existe');
  }
  return aviso;
}

export async function crear(usuario: TokenPayload, datos: AvisoInput): Promise<ResultadoAviso> {
  validarFechaFin(datos);
  const zonaIds = [...new Set<number>(datos.zonaIds)];

  const receptores = await notificacionService.obtenerDestinatarios(zonaIds);

  const id = await conTransaccion(async (conn) => {
    const nuevoId = await avisoRepository.insertar(conn, {
      ...camposAviso(datos),
      estado: estadoInicial(datos.fechaInicio),
      creadoPor: Number(usuario.sub),
    });
    await avisoRepository.reemplazarZonas(conn, nuevoId, zonaIds);
    return nuevoId;
  });

  const aviso = await obtener(id);
  const destinatarios = await notificacionService.notificar(aviso, 'NUEVO', receptores);
  return { aviso, destinatarios };
}

export async function actualizar(
  usuario: TokenPayload,
  id: number,
  datos: AvisoInput,
): Promise<ResultadoAviso> {
  const actual = await obtener(id);
  verificarPropiedad(usuario, actual);
  verificarModificable(actual);
  validarFechaFin(datos);
  const zonaIds = [...new Set<number>(datos.zonaIds)];

  const zonasAfectadas = [...new Set([...actual.zonas.map((zona) => zona.id), ...zonaIds])];
  const receptores = await notificacionService.obtenerDestinatarios(zonasAfectadas);

  await conTransaccion(async (conn) => {
    await avisoRepository.actualizar(conn, id, {
      ...camposAviso(datos),
      estado: estadoInicial(datos.fechaInicio),
    });
    await avisoRepository.reemplazarZonas(conn, id, zonaIds);
  });

  const aviso = await obtener(id);
  const destinatarios = await notificacionService.notificar(aviso, 'ACTUALIZACION', receptores);
  return { aviso, destinatarios };
}

export async function cancelar(usuario: TokenPayload, id: number): Promise<ResultadoAviso> {
  const actual = await obtener(id);
  verificarPropiedad(usuario, actual);
  verificarModificable(actual);

  const receptores = await notificacionService.obtenerDestinatarios(actual.zonas.map((zona) => zona.id));
  await avisoRepository.cambiarEstado(id, 'CANCELADO');
  const aviso = await obtener(id);
  const destinatarios = await notificacionService.notificar(
    aviso,
    'CANCELACION',
    receptores,
  );
  return { aviso, destinatarios };
}

export async function finalizar(usuario: TokenPayload, id: number): Promise<Aviso> {
  const actual = await obtener(id);
  verificarPropiedad(usuario, actual);
  verificarModificable(actual);

  const receptores = await notificacionService.obtenerDestinatarios(actual.zonas.map((zona) => zona.id));
  await avisoRepository.cambiarEstado(id, 'FINALIZADO');
  const aviso = await obtener(id);
  await notificacionService.notificar(aviso, 'ACTUALIZACION', receptores);
  return aviso;
}

export async function eliminar(id: number): Promise<void> {
  await obtener(id);
  await avisoRepository.eliminar(id);
}
