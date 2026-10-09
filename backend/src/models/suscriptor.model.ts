export interface Suscriptor {
  id: number;
  email: string;
  confirmado: boolean;
  tokenConfirmacion: string;
  tokenBaja: string;
}

export interface Destinatario {
  id: number;
  email: string;
  tokenBaja: string;
}
