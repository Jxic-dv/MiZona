import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config/env';

let transporte: Promise<Transporter> | null = null;

async function crearTransporte(): Promise<Transporter> {
  if (config.smtp.host) {
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass ?? '' } : undefined,
    });
  }

  // Sin SMTP configurado: cuenta de prueba de Ethereal (los correos no llegan a ninguna bandeja real)
  const cuenta = await nodemailer.createTestAccount();
  console.log(`[correo] Sin SMTP configurado, se usa una cuenta de prueba de Ethereal (${cuenta.user}).`);
  return nodemailer.createTransport({
    host: cuenta.smtp.host,
    port: cuenta.smtp.port,
    secure: cuenta.smtp.secure,
    auth: { user: cuenta.user, pass: cuenta.pass },
  });
}

function obtenerTransporte(): Promise<Transporter> {
  if (!transporte) {
    transporte = crearTransporte().catch((err) => {
      transporte = null; // permite reintentar en el próximo envío
      throw err;
    });
  }
  return transporte;
}

export interface CorreoSalida {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function enviar(correo: CorreoSalida): Promise<void> {
  const transport = await obtenerTransporte();
  const info = await transport.sendMail({ from: config.smtp.from, ...correo });

  const vistaPrevia = nodemailer.getTestMessageUrl(info);
  if (vistaPrevia) {
    console.log(`[correo] Vista previa del mensaje para ${correo.to}: ${vistaPrevia}`);
  }
}
