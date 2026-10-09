Pruebas del backend
===================

Desde la raíz del proyecto:

```sh
pnpm --filter backend test
pnpm --filter backend test:integration
```

La primera prueba usa dependencias simuladas. La prueba de integración necesita
el MySQL local de `docker compose up -d db`, en el puerto 3308. Utiliza las
credenciales locales del Compose (`root` / `root`); se pueden sustituir mediante
`TEST_DB_PORT`, `TEST_DB_USER` y `TEST_DB_PASSWORD`. El usuario de prueba necesita
permisos para crear y eliminar bases de datos.

La integración crea una base temporal con nombre aleatorio `mizona_test_*`, carga
el esquema y la elimina al terminar, incluso si una comprobación falla. No usa la
base `mizona`. Arranca la API y un receptor SMTP en puertos locales temporales;
ningún correo sale hacia Internet.

Comprueba registro y activación de funcionarios, acceso y perfil, permisos,
catálogos, validaciones y rollback, confirmación y baja de suscripciones, avisos,
filtros y paginación, deduplicación de destinatarios, actualización, cancelación,
finalización manual, estados por fecha, indicadores y fallos SMTP.

La captura SMTP verifica el envío desde la aplicación. La entrega a una bandeja
externa depende del proveedor SMTP que se configure para el despliegue.
