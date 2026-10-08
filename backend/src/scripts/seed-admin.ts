import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import * as usuarioRepository from '../repositories/usuario.repository';

async function main(): Promise<void> {
  const nombre = process.env.ADMIN_NAME ?? 'Administrador';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD en tu archivo .env');
  }

  const existente = await usuarioRepository.buscarPorEmail(email);
  if (existente) {
    console.log(`Ya existe un usuario con el correo ${email}. No se hizo nada.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await usuarioRepository.crear({ nombre, email, passwordHash, rol: 'ADMIN', activo: true });
  console.log(`Administrador creado: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
