import { config } from '../config/env';

/** Página simple que se muestra al abrir los enlaces de los correos (confirmar / darse de baja). */
export function paginaHtml(titulo: string, mensaje: string): string {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo} · MiZona</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
           background: #f4f7f7; font-family: Arial, Helvetica, sans-serif; color: #222; }
    main { max-width: 420px; margin: 24px; padding: 32px; background: #fff; border-radius: 8px;
           border: 1px solid #d9e2e2; text-align: center; }
    h1 { margin-top: 0; color: #0b5f5e; font-size: 22px; }
    a { display: inline-block; margin-top: 16px; padding: 10px 18px; border-radius: 6px;
        background: #0e7c7b; color: #fff; text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <h1>${titulo}</h1>
    <p>${mensaje}</p>
    <a href="${config.frontendUrl}">Ir a MiZona</a>
  </main>
</body>
</html>`;
}
