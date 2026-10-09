export type Rol = 'ADMIN' | 'FUNCIONARIO';

/** Usuario tal como se expone hacia afuera (sin contraseña). */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt: Date;
}

/** Usuario completo, solo para uso interno del backend. */
export interface UsuarioConPassword extends Usuario {
  passwordHash: string;
}

export interface TokenPayload {
  sub: string; // id del usuario (el estándar JWT exige que sub sea string)
  nombre: string;
  rol: Rol;
}

export function aPublico(usuario: UsuarioConPassword): Usuario {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    activo: usuario.activo,
    createdAt: usuario.createdAt,
  };
}
