import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { aPublico, type TokenPayload, type Usuario } from '../models/usuario.model';
import * as usuarioRepository from '../repositories/usuario.repository';
import type { RegisterInput } from '../schemas/usuario.schema';
import { AppError } from '../utils/app-error';

/** Registro público: crea un funcionario inactivo hasta que un ADMIN lo active. */
export async function registrar(datos: RegisterInput): Promise<void> {
  const existente = await usuarioRepository.buscarPorEmail(datos.email);
  if (existente) {
    throw new AppError(409, 'Ya existe una cuenta con ese correo');
  }

  const passwordHash = await bcrypt.hash(datos.password, 10);
  await usuarioRepository.crear({
    nombre: datos.nombre,
    email: datos.email,
    passwordHash,
    rol: 'FUNCIONARIO',
    activo: false,
  });
}

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; usuario: Usuario }> {
  const usuario = await usuarioRepository.buscarPorEmail(email);
  const passwordCorrecta = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;

  // Mismo mensaje si el correo no existe o la contraseña es incorrecta
  if (!usuario || !passwordCorrecta) {
    throw new AppError(401, 'Credenciales inválidas');
  }
  if (!usuario.activo) {
    throw new AppError(403, 'Tu cuenta aún no ha sido activada por un administrador');
  }

  const payload: TokenPayload = {
    sub: String(usuario.id),
    nombre: usuario.nombre,
    rol: usuario.rol,
  };
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  });

  return { token, usuario: aPublico(usuario) };
}
