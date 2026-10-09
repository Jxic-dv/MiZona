export interface Suscriptor {
  id: number;
  email: string;
  confirmado: boolean;
  tokenConfirmacion: string;
  tokenBaja: string;
}

/** Datos mínimos para enviar un aviso a un suscriptor. */
export interface Destinatario {
  id: number;
  email: string;
  tokenBaja: string;
}
