# MiZona

MiZona es una plataforma para consultar avisos por zona y recibir notificaciones por correo. Permite a los funcionarios publicar y gestionar avisos, y a los vecinos suscribirse a las zonas de su interés.

## Funcionalidades

- Consulta pública de avisos con filtros y paginación.
- Suscripciones por zona con confirmación por correo y enlace de baja.
- Notificaciones al crear, actualizar, cancelar o finalizar manualmente un aviso.
- Registro de funcionarios y activación por un administrador.
- Gestión de avisos, zonas, categorías y usuarios según el rol.
- Panel con indicadores de avisos, suscripciones y envíos de correo.

## Tecnologías

| Componente | Tecnologías |
| --- | --- |
| Frontend | Angular 22, TypeScript |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Base de datos | MySQL 8.4, Docker Compose |
| Autenticación | JWT y bcryptjs |
| Correo | Nodemailer y SMTP; Ethereal para pruebas |
| Pruebas | Vitest en frontend y pruebas unitarias e integración en backend |

## Requisitos

- Node.js 22.22.3 o una versión posterior de la rama 22 compatible con las dependencias del lockfile.
- pnpm 10.
- Docker con Docker Compose.
- Acceso a Internet para instalar dependencias y usar Ethereal.

## Instalación y ejecución local

Los comandos siguientes se ejecutan desde la raíz del repositorio.

### 1. Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

### 2. Configurar el backend

Crea `backend/.env` con estos valores de desarrollo. Si ya existe, revisa su contenido antes de cambiarlo.

```dotenv
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3308
DB_USER=mizona
DB_PASSWORD=mizona123
DB_NAME=mizona
JWT_SECRET=reemplaza-este-valor-por-un-secreto-aleatorio-largo
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:4200
API_PUBLIC_URL=http://localhost:3000
FRONTEND_URL=http://localhost:4200
TRUST_PROXY=false

# Sin SMTP_HOST, los correos se prueban con Ethereal.
SMTP_PORT=587
SMTP_FROM=MiZona <no-reply@mizona.local>
```

Las credenciales de MySQL del ejemplo corresponden al Compose local. No publiques el archivo `.env` ni uses estas credenciales para un despliegue público.

### 3. Levantar MySQL

```bash
docker compose up -d db
```

Espera a que MySQL esté listo. En la primera inicialización, Docker ejecuta los archivos de `db/` para crear el esquema y cargar zonas y categorías. Los datos se conservan en el volumen `mizona_data`; los scripts de inicialización no se vuelven a ejecutar sobre un volumen existente.

### 4. Iniciar la aplicación

En una terminal:

```bash
pnpm --filter backend dev
```

En otra terminal:

```bash
pnpm --filter frontend start
```

- Frontend: <http://localhost:4200>
- API: <http://localhost:3000/api>
- Comprobación de API y base de datos: <http://localhost:3000/api/health>

El endpoint de comprobación debe devolver `{"status":"ok","db":"conectada"}`. El frontend utiliza un proxy de desarrollo para enviar las solicitudes `/api` al backend.

## Variables de entorno

| Variable | Obligatoria | Uso o valor predeterminado |
| --- | --- | --- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Sí | Credenciales y nombre de la base de datos. |
| `JWT_SECRET` | Sí | Secreto para firmar los tokens de acceso. |
| `DB_HOST` | No | Servidor MySQL; `localhost`. |
| `DB_PORT` | No | Puerto MySQL; `3308`. |
| `PORT` | No | Puerto del backend; `3000`. |
| `NODE_ENV` | No | Entorno de ejecución; `development`. |
| `JWT_EXPIRES_IN` | No | Duración del token; `8h`. |
| `CORS_ORIGIN` | No | Origen permitido del frontend; `http://localhost:4200`. |
| `API_PUBLIC_URL` | No | URL del backend para los enlaces de confirmación y baja; `http://localhost:3000` con el puerto predeterminado. |
| `FRONTEND_URL` | No | URL del frontend; `http://localhost:4200`. |
| `TRUST_PROXY` | No | `true` si el backend está detrás de un proxy de confianza; `false` por defecto. |
| `SMTP_HOST` | Para correo real | Servidor SMTP. Si se omite, se usa Ethereal. |
| `SMTP_PORT` | No | Puerto SMTP; `587`. El puerto `465` activa conexión segura desde el inicio. |
| `SMTP_USER`, `SMTP_PASS` | Según proveedor | Credenciales SMTP. |
| `SMTP_FROM` | No | Remitente; `MiZona <no-reply@mizona.local>`. Para correo real, usa un remitente autorizado por tu proveedor. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Para crear el administrador | Datos utilizados por `seed:admin`. |
| `ADMIN_NAME` | No | Nombre del administrador; `Administrador`. |

## Primer acceso

Añade a `backend/.env` los datos del administrador:

```dotenv
ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=cambia-esta-clave-antes-de-usarla
```

Ejecuta:

```bash
pnpm --filter backend seed:admin
```

El script crea un administrador activo con la contraseña cifrada. Si el correo ya existe, no modifica esa cuenta.

Inicia sesión con esa cuenta, revisa las zonas y categorías y publica el primer aviso. Los funcionarios que se registren necesitan que un administrador active su cuenta.

## Probar los correos

### Con Ethereal

Si no defines `SMTP_HOST`, el backend crea una cuenta de prueba de Ethereal. Los mensajes se pueden visualizar, pero no llegan a una bandeja real.

1. Con la aplicación encendida, abre **Recibir avisos** (`/suscribirme`).
2. Introduce un correo y selecciona una zona.
3. Busca en la terminal del backend el mensaje `[correo] Vista previa del mensaje para ...` y abre su enlace.
4. Pulsa el enlace de confirmación del correo.
5. Publica un aviso para la misma zona desde una cuenta autorizada y comprueba la nueva vista previa.
6. Usa el enlace de baja para comprobar la cancelación de la suscripción.

Solo los suscriptores confirmados reciben avisos. Las URLs de los enlaces deben ser accesibles desde el navegador que uses para la prueba.

### Con un proveedor SMTP real

Configura `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `SMTP_FROM` con los datos de tu proveedor y reinicia el backend. Repite el flujo con un correo propio y revisa la bandeja de entrada y spam.

El número de destinatarios mostrado al guardar un aviso representa los destinatarios seleccionados. Para comprobar el resultado del envío, revisa los indicadores de notificaciones enviadas y fallidas y los errores de la terminal. La aceptación por SMTP no garantiza la entrega en la bandeja de entrada.

## Pruebas y compilación

```bash
# Pruebas unitarias del backend
pnpm --filter backend test

# Integración: requiere el MySQL local encendido
docker compose up -d db
pnpm --filter backend test:integration

# Pruebas del frontend sin modo de observación
pnpm --filter frontend test --watch=false

# Compilar ambos componentes
pnpm --filter backend build
pnpm --filter frontend build
```

La integración crea y elimina una base temporal `mizona_test_*`; no utiliza la base `mizona`. Inicia una API y un receptor SMTP locales, sin enviar correos a Internet. Comprueba permisos, suscripciones, avisos, notificaciones y fallos SMTP.

Utiliza las credenciales locales `root` / `root` del Compose. Puedes sustituirlas con `TEST_DB_PORT`, `TEST_DB_USER` y `TEST_DB_PASSWORD`; el usuario necesita permisos para crear y eliminar bases de datos. Consulta [la documentación de pruebas](backend/tests/README.md) para más detalles.

## Estructura del proyecto

```text
backend/            API, servicios, repositorios y pruebas
frontend/           Aplicación Angular
db/                 Esquema y datos iniciales de MySQL
docker/             Configuración de MySQL
docker-compose.yml  Base de datos para desarrollo local
```

## Consideraciones

- Las zonas iniciales son de ejemplo y deben verificarse contra las zonas oficiales de la municipalidad.
- Para un despliegue público, configura las URLs públicas, el origen permitido y el proveedor SMTP.
- La prueba de integración valida el envío a un SMTP local; la entrega externa se comprueba con el proveedor real.

## Licencia

El repositorio incluye una [licencia MIT](LICENSE).
