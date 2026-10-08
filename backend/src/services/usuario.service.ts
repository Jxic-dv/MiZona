import bcrypt from 'bcryptjs';
import { aPublico, type Usuario } from '../models/usuario.model';
import * as usuarioRepository from '../repositories/usuario.repository';
import type { ActualizarPerfilInput, ListarUsuariosQuery } from '../schemas/usuario.schema';
import { AppError } from '../utils/app-error';

export async function obtenerPerfil(id: number): Promise<Usuario> {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError(404, 'El usuario no existe');
  }
  return aPublico(usuario);
}

export async function actualizarPerfil(id: number, datos: ActualizarPerfilInput): Promise<Usuario> {
  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError(404, 'El usuario no existe');
  }

  // Primero se valida la contraseña actual para no dejar el perfil a medias si falla
  if (datos.passwordNueva !== undefined) {
    const coincide = datos.passwordActual
      ? await bcrypt.compare(datos.passwordActual, usuario.passwordHash)
      : false;
    if (!coincide) {
      throw new AppError(400, 'La contraseña actual es incorrecta');
    }
    await usuarioRepository.actualizarPassword(id, await bcrypt.hash(datos.passwordNueva, 10));
  }

  if (datos.nombre !== undefined) {
    await usuarioRepository.actualizarNombre(id, datos.nombre);
  }

  return obtenerPerfil(id);
}

export async function listar(filtros: ListarUsuariosQuery) {
  const { items, total } = await usuarioRepository.listar(filtros);
  return {
    items: items.map(aPublico),
    total,
    page: filtros.page,
    limit: filtros.limit,
    totalPages: Math.ceil(total / filtros.limit),
  };
}

export async function cambiarActivo(adminId: number, id: number, activo: boolean): Promise<Usuario> {
  if (adminId === id && !activo) {
    throw new AppError(400, 'No puedes desactivar tu propia cuenta');
  }

  const usuario = await usuarioRepository.buscarPorId(id);
  if (!usuario) {
    throw new AppError(404, 'El usuario no existe');
  }

  await usuarioRepository.cambiarActivo(id, activo);
  return { ...aPublico(usuario), activo };
}
