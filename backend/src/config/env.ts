import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (revisa tu archivo .env)`);
  }
  return value;
}

const port = Number(process.env.PORT ?? 3000);
const nodeEnv = process.env.NODE_ENV ?? 'development';

export const config = {
  port,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  trustProxy: process.env.TRUST_PROXY === 'true',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  // URL pública del backend (se usa en los enlaces de los correos) y del frontend
  apiPublicUrl: (process.env.API_PUBLIC_URL ?? `http://localhost:${port}`).replace(/\/$/, ''),
  frontendUrl: (process.env.FRONTEND_URL ?? 'http://localhost:4200').replace(/\/$/, ''),
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3308),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
  },
  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
  // Si SMTP_HOST no está definido se usa una cuenta de prueba de Ethereal (no envía correos reales)
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'MiZona <no-reply@mizona.local>',
  },
};
