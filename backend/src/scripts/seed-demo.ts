/**
 * Datos de demostración (todos ficticios): funcionarios, avisos, suscriptores y notificaciones.
 * Requiere haber corrido antes los scripts SQL de db/ y `pnpm seed:admin`.
 * Uso: pnpm exec tsx src/scripts/seed-demo.ts
 */
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import type { EstadoAviso } from '../models/aviso.model';
import * as avisoRepository from '../repositories/aviso.repository';
import * as notificacionRepository from '../repositories/notificacion.repository';
import * as suscriptorRepository from '../repositories/suscriptor.repository';
import * as usuarioRepository from '../repositories/usuario.repository';
import { conTransaccion } from '../utils/transaccion';

const PASSWORD_DEMO = 'Demo12345';
const HORA = 60 * 60 * 1000;

function enHoras(horas: number): Date {
  return new Date(Date.now() + horas * HORA);
}

function token(): string {
  return randomBytes(32).toString('hex');
}

async function idPorNombre(tabla: 'zonas' | 'categorias', columnaId: string, nombre: string): Promise<number> {
  const [rows] = await pool.query<Array<RowDataPacket & { id: number }>>(
    'SELECT ?? AS id FROM ?? WHERE nombre = ?',
    [columnaId, tabla, nombre],
  );
  if (!rows[0]) {
    throw new Error(`No existe "${nombre}" en ${tabla}. ¿Corriste los scripts SQL de db/?`);
  }
  return rows[0].id;
}

const zonaId = (numero: number) => idPorNombre('zonas', 'id_zona', `Zona ${numero}`);
const categoriaId = (nombre: string) => idPorNombre('categorias', 'id_categoria', nombre);

async function main(): Promise<void> {
  const [admins] = await pool.query<Array<RowDataPacket & { id_usuario: number }>>(
    "SELECT id_usuario FROM usuarios WHERE rol = 'ADMIN' ORDER BY id_usuario LIMIT 1",
  );
  if (!admins[0]) {
    throw new Error('No hay un administrador. Ejecuta primero: pnpm seed:admin');
  }
  const adminId = admins[0].id_usuario;

  const [conteo] = await pool.query<Array<RowDataPacket & { total: number }>>(
    'SELECT COUNT(*) AS total FROM avisos',
  );
  if ((conteo[0]?.total ?? 0) > 0) {
    console.log('Ya existen avisos; no se agregaron datos de demostración.');
    return;
  }

  // ---- Funcionarios ----
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);
  const funcionarioId = await usuarioRepository.crear({
    nombre: 'Funcionario Demo',
    email: 'funcionario@test.com',
    passwordHash,
    rol: 'FUNCIONARIO',
    activo: true,
  });
  await usuarioRepository.crear({
    nombre: 'Funcionario Pendiente',
    email: 'pendiente@test.com',
    passwordHash,
    rol: 'FUNCIONARIO',
    activo: false,
  });

  // ---- Avisos ----
  const avisos: Array<{
    titulo: string;
    descripcion: string;
    lugar: string;
    categoria: string;
    zonas: number[];
    inicio: Date;
    fin: Date;
    estado: EstadoAviso;
    autor: number;
  }> = [
    {
      titulo: 'Corte de energía por mantenimiento de red',
      descripcion: 'Se realizará mantenimiento preventivo en la red de media tensión.',
      lugar: 'Entre 6a y 10a avenida',
      categoria: 'Energía eléctrica',
      zonas: [1, 4],
      inicio: enHoras(20),
      fin: enHoras(26),
      estado: 'PROGRAMADO',
      autor: funcionarioId,
    },
    {
      titulo: 'Reparación de tubería principal de agua',
      descripcion: 'Se reparará una fuga en la tubería principal. El servicio estará interrumpido.',
      lugar: '5a avenida y 12 calle',
      categoria: 'Agua potable',
      zonas: [1],
      inicio: enHoras(-2),
      fin: enHoras(5),
      estado: 'ACTIVO',
      autor: adminId,
    },
    {
      titulo: 'Cierre vial por cambio de semáforos',
      descripcion: 'Se cerrará un carril mientras se instalan los nuevos semáforos.',
      lugar: 'Intersección de la 7a avenida y 18 calle',
      categoria: 'Vialidad y tránsito',
      zonas: [10],
      inicio: enHoras(-1),
      fin: enHoras(3),
      estado: 'ACTIVO',
      autor: funcionarioId,
    },
    {
      titulo: 'Limpieza de drenajes pluviales',
      descripcion: 'Limpieza preventiva ante la temporada de lluvias.',
      lugar: 'Calles principales de ambas zonas',
      categoria: 'Drenajes',
      zonas: [7, 11],
      inicio: enHoras(72),
      fin: enHoras(80),
      estado: 'PROGRAMADO',
      autor: funcionarioId,
    },
    {
      titulo: 'Repavimentación de calle',
      descripcion: 'Trabajos de repavimentación concluidos.',
      lugar: '3a calle entre 4a y 6a avenida',
      categoria: 'Obras',
      zonas: [9],
      inicio: enHoras(-72),
      fin: enHoras(-48),
      estado: 'FINALIZADO',
      autor: adminId,
    },
    {
      titulo: 'Corte de agua reprogramado',
      descripcion: 'El corte fue cancelado y se anunciará una nueva fecha.',
      lugar: 'Sector central de la zona',
      categoria: 'Agua potable',
      zonas: [5],
      inicio: enHoras(-30),
      fin: enHoras(-24),
      estado: 'CANCELADO',
      autor: funcionarioId,
    },
    {
      titulo: 'Poda de árboles en parque',
      descripcion: 'Poda de mantenimiento en el parque central.',
      lugar: 'Parque central',
      categoria: 'Otros',
      zonas: [2],
      inicio: enHoras(-120),
      fin: enHoras(-110),
      estado: 'FINALIZADO',
      autor: adminId,
    },
  ];

  const creados: Array<{ id: number; zonas: number[]; estado: EstadoAviso }> = [];
  for (const aviso of avisos) {
    const categoria = await categoriaId(aviso.categoria);
    const zonas = await Promise.all(aviso.zonas.map(zonaId));
    const id = await conTransaccion(async (conn) => {
      const nuevoId = await avisoRepository.insertar(conn, {
        titulo: aviso.titulo,
        descripcion: aviso.descripcion,
        ubicacionDetalle: aviso.lugar,
        fechaInicio: aviso.inicio,
        fechaFinEstimada: aviso.fin,
        estado: aviso.estado,
        categoriaId: categoria,
        creadoPor: aviso.autor,
      });
      await avisoRepository.reemplazarZonas(conn, nuevoId, zonas);
      return nuevoId;
    });
    creados.push({ id, zonas, estado: aviso.estado });
  }

  // ---- Suscriptores (correos ficticios @example.com) ----
  const suscriptores = [
    { email: 'vecino1@example.com', zonas: [1, 4], confirmado: true },
    { email: 'vecino2@example.com', zonas: [1], confirmado: true },
    { email: 'vecino3@example.com', zonas: [9, 10], confirmado: true },
    { email: 'vecino4@example.com', zonas: [5, 7, 11], confirmado: true },
    { email: 'vecino5@example.com', zonas: [2], confirmado: true },
    { email: 'vecino6@example.com', zonas: [1], confirmado: false },
  ];

  const registrados: Array<{ id: number; zonas: number[]; confirmado: boolean }> = [];
  for (const sub of suscriptores) {
    const zonas = await Promise.all(sub.zonas.map(zonaId));
    const id = await conTransaccion(async (conn) => {
      const nuevoId = await suscriptorRepository.insertar(conn, sub.email, token(), token(), sub.confirmado);
      await suscriptorRepository.reemplazarZonas(conn, nuevoId, zonas);
      return nuevoId;
    });
    registrados.push({ id, zonas, confirmado: sub.confirmado });
  }

  // ---- Notificaciones ya enviadas (solo registros; no se envía ningún correo) ----
  let totalNotificaciones = 0;
  for (const aviso of creados) {
    if (aviso.estado === 'PROGRAMADO' && aviso.id === creados[3]?.id) {
      continue; // este aviso programado queda sin notificar para la demostración
    }
    const destinatarios = registrados.filter(
      (sub) => sub.confirmado && sub.zonas.some((zona) => aviso.zonas.includes(zona)),
    );
    for (const sub of destinatarios) {
      await notificacionRepository.registrar({ avisoId: aviso.id, suscriptorId: sub.id, tipo: 'NUEVO', exito: true });
      totalNotificaciones++;
      if (aviso.estado === 'CANCELADO') {
        await notificacionRepository.registrar({ avisoId: aviso.id, suscriptorId: sub.id, tipo: 'CANCELACION', exito: true });
        totalNotificaciones++;
      }
    }
  }

  console.log('Datos de demostración creados:');
  console.log(`  - Funcionarios: funcionario@test.com (activo) y pendiente@test.com (inactivo), contraseña ${PASSWORD_DEMO}`);
  console.log(`  - ${creados.length} avisos, ${registrados.length} suscriptores y ${totalNotificaciones} notificaciones registradas`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
