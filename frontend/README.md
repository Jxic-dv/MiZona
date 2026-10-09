# MiZona · Frontend

Aplicación Angular conectada al backend Express de este repositorio.

## Iniciar en desarrollo

Desde la raíz del proyecto, con las dependencias instaladas:

```sh
# Terminal 1: backend (requiere su .env y MySQL)
pnpm --filter backend dev

# Terminal 2: frontend
pnpm --filter frontend start
```

Abre http://localhost:4200. `proxy.conf.json` dirige `/api/**` al backend en
`http://127.0.0.1:3000`. Si cambias el puerto del backend, actualiza ese archivo.

## Pantallas

- `/`: avisos públicos, búsqueda, categorías, zonas, estados, fechas y paginación.
- `/avisos/:id`: detalle público; compatible con los enlaces de los correos.
- `/suscribirme`: suscripción por correo a una o varias zonas.
- `/acceso`: inicio de sesión y solicitud de cuenta de funcionario.
- `/panel/avisos`: gestión de publicaciones según permisos.
- `/panel/avisos/nuevo` y `/panel/avisos/:id/editar`: publicación y edición.
- `/panel/resumen`, `/panel/zonas`, `/panel/categorias`, `/panel/usuarios`:
  administración exclusiva para ADMIN.
- `/panel/perfil`: nombre y contraseña del usuario autenticado.

Los funcionarios nuevos requieren activación por un administrador. El vecino no
necesita cuenta. La confirmación y baja de suscripciones se resuelven en las
páginas HTML del backend enlazadas desde los correos.

El token se conserva en `sessionStorage` durante la sesión de la pestaña. Las
rutas protegidas comprueban el perfil en el backend y el servidor sigue siendo
la autoridad para permisos. Los formularios de fecha usan hora de Guatemala
(UTC−6) y envían ISO en UTC.

## Diseño

Verde bosque, salvia, marfil y acentos ámbar. Tipografías Manrope y DM Sans
incluidas localmente con sus licencias en `public/fonts`; no necesitan conexión
a Google Fonts. Ilustración e iconos SVG propios, navegación por teclado,
mensajes de carga/error y presentación adaptable a móvil.

## Organización del código

```text
src/app/
├── components/       # Navbar, footer, iconos, portada, tarjetas, paginación y zonas
├── pages/            # Una carpeta por pantalla: .ts, .html y .css
├── services/         # Autenticación, API, avisos, catálogos, usuarios y suscripciones
├── models/           # Interfaces de datos y contratos del backend
├── interceptors/     # Token de sesión en peticiones HTTP
├── guards/           # Acceso autenticado y rol de administrador
├── utils/            # Fechas, mensajes de error e iconos por categoría
├── app.routes.ts     # Rutas y carga diferida de las pantallas
└── app.ts            # Composición del navbar, contenido y footer
```

Las páginas coordinan sus formularios y consumen servicios; los endpoints están
centralizados en `services/`. Los componentes reutilizables reciben datos mediante
inputs y comunican cambios mediante outputs o `model()`.

Cada pantalla y componente tiene su plantilla y estilos separados. `styles.css`
conserva las fuentes, la paleta y las reglas compartidas de botones, formularios,
tablas y estados. Las pruebas `.spec.ts` están junto al código que comprueban.

## Comprobaciones

```sh
pnpm --filter frontend test --watch=false
pnpm --filter frontend build
```

Las pruebas verifican navegación pública, sesión, cuenta desactivada,
suscripción y conversión de fechas. También se comprobó el frontend compilado
en Brave con MySQL temporal y SMTP local: filtros, detalle, suscripción,
publicación y edición de avisos, cancelación, catálogos, usuarios, perfil,
permisos y vistas de escritorio/móvil.

## Despliegue

El resultado se genera en `dist/frontend/browser`. El servidor debe devolver
`index.html` para las rutas de Angular y reenviar `/api/**` al backend.
El proxy de Angular solo funciona durante el desarrollo.

Configura `FRONTEND_URL`, `API_PUBLIC_URL` y `CORS_ORIGIN` del backend con las
URLs reales del despliegue para que los enlaces de correo y las peticiones
funcionen correctamente. El frontend muestra datos reales de la API; las
capturas de revisión utilizaron datos ficticios en una base temporal.
