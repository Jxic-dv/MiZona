import { rateLimit } from 'express-rate-limit';
import { config } from '../config/env';

/** En desarrollo y pruebas el límite es muy alto para no estorbar; en producción es estricto. */
function crearLimitador(ventanaMinutos: number, limiteProduccion: number, mensaje: string) {
  return rateLimit({
    windowMs: ventanaMinutos * 60 * 1000,
    limit: config.isProduction ? limiteProduccion : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.isTest,
    message: { error: mensaje },
  });
}

export const limiteAutenticacion = crearLimitador(
  15,
  20,
  'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
);

export const limiteSuscripcion = crearLimitador(
  60,
  5,
  'Demasiadas solicitudes de suscripción. Inténtalo más tarde.',
);
