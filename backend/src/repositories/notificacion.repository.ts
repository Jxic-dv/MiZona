import { pool } from '../config/db';
import type { TipoNotificacion } from '../models/aviso.model';

export async function registrar(datos: {
  avisoId: number;
  suscriptorId: number;
  tipo: TipoNotificacion;
  exito: boolean;
}): Promise<void> {
  await pool.query(
    'INSERT INTO notificaciones_enviadas (id_aviso, id_suscriptor, tipo, exito) VALUES (?, ?, ?, ?)',
    [datos.avisoId, datos.suscriptorId, datos.tipo, datos.exito ? 1 : 0],
  );
}
