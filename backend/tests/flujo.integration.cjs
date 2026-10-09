// MySQL local de docker-compose.yml; crea y elimina exclusivamente una BD temporal.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { randomBytes } = require('node:crypto');
const net = require('node:net');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main(verificarFrontend) {
  const database = `mizona_test_${randomBytes(8).toString('hex')}`;
  const mensajes = [];
  const sockets = new Set();
  let rechazarCorreo = false;
  const smtp = net.createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.on('error', () => {});
    socket.write('220 localhost SMTP de prueba\r\n');
    let buffer = '', datos = false, mensaje = [];
    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      let corte;
      while ((corte = buffer.indexOf('\r\n')) >= 0) {
        const linea = buffer.slice(0, corte);
        buffer = buffer.slice(corte + 2);
        if (datos) {
          if (linea === '.') {
            datos = false;
            mensajes.push(mensaje.join('\r\n').replace(/=\r\n/g, ''));
            mensaje = [];
            socket.write('250 Mensaje recibido\r\n');
          } else mensaje.push(linea.replace(/^\.\./, '.'));
        } else if (/^EHLO|^HELO/.test(linea)) socket.write('250 localhost\r\n');
        else if (/^DATA/.test(linea)) {
          if (rechazarCorreo) socket.write('451 Fallo SMTP de prueba\r\n');
          else { datos = true; socket.write('354 Terminar con punto\r\n'); }
        } else if (/^QUIT/.test(linea)) socket.end('221 Adios\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  let db, pool, server, creada = false;
  let peticiones = 0;
  try {
    db = await mysql.createConnection({
      host: '127.0.0.1', port: Number(process.env.TEST_DB_PORT ?? 3308),
      user: process.env.TEST_DB_USER ?? 'root', password: process.env.TEST_DB_PASSWORD ?? 'root',
      multipleStatements: true, timezone: 'Z',
    });
    await db.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    creada = true;
    await db.changeUser({ database });
    const schema = readFileSync(resolve(__dirname, '../../db/01_schema.sql'), 'utf8')
      .replace(/CREATE DATABASE[\s\S]*?;/, '').replace(/USE mizona;/, '');
    await db.query(schema);
    await new Promise((ok, fail) => { smtp.once('error', fail); smtp.listen(0, '127.0.0.1', ok); });
    Object.assign(process.env, {
      NODE_ENV: 'test', DB_HOST: '127.0.0.1', DB_PORT: String(process.env.TEST_DB_PORT ?? 3308),
      DB_USER: process.env.TEST_DB_USER ?? 'root', DB_PASSWORD: process.env.TEST_DB_PASSWORD ?? 'root',
      DB_NAME: database, JWT_SECRET: 'integration-local-test-only',
      SMTP_HOST: '127.0.0.1', SMTP_PORT: String(smtp.address().port), SMTP_USER: '', SMTP_PASS: '',
      SMTP_FROM: 'MiZona <test@example.com>',
    });
    const { app } = require('../src/app.ts');
    pool = require('../src/config/db.ts').pool;
    server = await new Promise((ok) => { const s = app.listen(0, '127.0.0.1', () => ok(s)); });
    const base = `http://127.0.0.1:${server.address().port}`;
    require('../src/config/env.ts').config.apiPublicUrl = base;
    async function api(method, path, status, body, token) {
      const response = await fetch(`${base}/api${path}`, {
        method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(15000),
      });
      const text = await response.text();
      assert.equal(response.status, status, `${method} ${path}: ${text}`);
      peticiones++;
      return text && response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text;
    }
    await db.query("INSERT INTO usuarios(nombre,email,password_hash,rol,activo) VALUES ('Admin','admin@example.com',?,'ADMIN',1)", [await bcrypt.hash('Prueba12345', 10)]);
    await api('GET', '/health', 200);
    const admin = (await api('POST', '/auth/login', 200, { email: 'admin@example.com', password: 'Prueba12345' })).token;
    await api('POST', '/auth/login', 401, { email: 'admin@example.com', password: 'incorrecta' });
    const cred = { email: 'funcionario@example.com', password: 'Prueba12345' };
    await api('POST', '/auth/register', 201, { nombre: 'Funcionario', ...cred });
    await api('POST', '/auth/register', 409, { nombre: 'Funcionario', ...cred });
    await api('POST', '/auth/login', 403, cred);
    const usuario = (await api('GET', '/usuarios?q=funcionario', 200, undefined, admin)).items[0];
    await api('PATCH', `/usuarios/${usuario.id}/activo`, 200, { activo: true }, admin);
    const funcionario = (await api('POST', '/auth/login', 200, cred)).token;
    await api('GET', '/dashboard', 401);
    await api('GET', '/dashboard', 403, undefined, funcionario);
    await api('GET', '/usuarios', 403, undefined, funcionario);
    await api('PUT', '/usuarios/me', 200, { nombre: 'Funcionario actualizado' }, funcionario);
    assert.equal((await api('GET', '/auth/me', 200, undefined, funcionario)).usuario.nombre, 'Funcionario actualizado');
    await api('PUT', '/usuarios/me', 400, { passwordActual: 'incorrecta', passwordNueva: 'Nueva12345' }, funcionario);
    await api('PUT', '/usuarios/me', 200, { passwordActual: cred.password, passwordNueva: 'Nueva12345' }, funcionario);
    await api('POST', '/auth/login', 401, cred);
    await api('POST', '/auth/login', 200, { ...cred, password: 'Nueva12345' });
    const zonas = [];
    for (const nombre of ['Zona QA 1', 'Zona QA 2', 'Zona QA 3']) zonas.push((await api('POST', '/zonas', 201, { nombre }, admin)).id);
    const categoria = (await api('POST', '/categorias', 201, { nombre: 'Agua QA' }, admin)).id;
    await api('POST', '/zonas', 403, { nombre: 'Sin permiso' }, funcionario);
    await api('POST', '/zonas', 409, { nombre: 'Zona QA 1' }, admin);
    await api('PUT', `/zonas/${zonas[0]}`, 200, { nombre: 'Zona QA actualizada' }, admin);
    await api('PUT', `/categorias/${categoria}`, 200, { nombre: 'Agua actualizada' }, admin);
    await api('GET', '/zonas', 200);
    await api('GET', `/categorias/${categoria}`, 200);
    await api('POST', '/suscripciones', 400, { email: 'vecino@example.com', zonaIds: [99999] });
    assert.equal((await db.query('SELECT * FROM suscriptores'))[0].length, 0, 'Rollback de suscripción inválida');
    await api('POST', '/suscripciones', 201, { email: 'vecino@example.com', zonaIds: [zonas[0], zonas[1], zonas[0]] });
    assert.equal(mensajes.length, 1);
    const [suscriptores] = await db.query('SELECT * FROM suscriptores');
    const vecino = suscriptores[0];
    assert.ok(mensajes[0].includes(`/confirmar/${vecino.token_confirmacion}`));
    const datos = { titulo: 'Interrupción de agua', descripcion: 'Aviso <de prueba>', categoriaId: categoria, zonaIds: [zonas[0], zonas[1], zonas[0]], fechaInicio: '2099-01-01T10:00:00-06:00', fechaFinEstimada: null };
    await api('POST', '/avisos', 401, datos);
    await api('POST', '/avisos', 400, { ...datos, zonaIds: [99999] }, funcionario);
    assert.equal((await db.query('SELECT * FROM avisos'))[0].length, 0, 'Rollback de aviso inválido');
    const previo = await api('POST', '/avisos', 201, datos, funcionario);
    assert.equal(previo.destinatarios, 0, 'Sin correos antes de confirmar');
    assert.equal(mensajes.length, 1);
    await api('GET', `/suscripciones/confirmar/${vecino.token_confirmacion}`, 200);
    await api('POST', '/suscripciones', 409, { email: vecino.email, zonaIds: [zonas[0]] });
    const creado = await api('POST', '/avisos', 201, datos, funcionario);
    assert.equal(creado.destinatarios, 1, 'Deduplicación por zonas');
    assert.equal(creado.aviso.zonas.length, 2);
    assert.equal(creado.aviso.estado, 'PROGRAMADO');
    assert.equal(creado.aviso.fechaInicio, '2099-01-01T16:00:00.000Z');
    assert.equal(mensajes.length, 2);
    assert.ok(mensajes[1].includes(`/baja/${vecino.token_baja}`));
    const id = creado.aviso.id;
    await api('GET', `/avisos/${id}`, 200);
    const lista = await api('GET', `/avisos?zonaId=${zonas[0]}&categoriaId=${categoria}&q=Interrup&desde=2099-01-01&hasta=2099-01-01&limit=1`, 200);
    assert.equal(lista.total, 2); assert.equal(lista.items.length, 1); assert.equal(lista.totalPages, 2);
    await api('GET', '/avisos?desde=2026-02-30', 400);
    await api('GET', '/avisos?desde=2026-10-10&hasta=2026-10-09', 400);
    await api('DELETE', `/zonas/${zonas[0]}`, 409, undefined, admin);
    await api('DELETE', `/categorias/${categoria}`, 409, undefined, admin);
    const ajeno = (await api('POST', '/avisos', 201, { ...datos, zonaIds: [zonas[2]] }, admin)).aviso.id;
    await api('PUT', `/avisos/${ajeno}`, 403, datos, funcionario);
    await api('POST', `/avisos/${ajeno}/cancelar`, 403, undefined, funcionario);
    await api('DELETE', `/avisos/${id}`, 403, undefined, funcionario);
    const editado = await api('PUT', `/avisos/${id}`, 200, { ...datos, titulo: 'Servicio actualizado', zonaIds: [zonas[2]] }, funcionario);
    assert.equal(editado.destinatarios, 1, 'Se notifica a las zonas retiradas');
    assert.equal(mensajes.length, 3);
    await api('POST', `/avisos/${previo.aviso.id}/cancelar`, 200, undefined, funcionario);
    assert.equal(mensajes.length, 4);
    await api('PUT', `/avisos/${previo.aviso.id}`, 409, datos, funcionario);
    const finalizable = (await api('POST', '/avisos', 201, datos, funcionario)).aviso.id;
    await api('POST', `/avisos/${finalizable}/finalizar`, 200, undefined, funcionario);
    assert.equal(mensajes.length, 6);
    assert.ok(mensajes[5].includes('FINALIZADO'));
    await api('POST', `/avisos/${finalizable}/cancelar`, 409, undefined, funcionario);
    const resumen = await api('GET', '/dashboard', 200, undefined, admin);
    assert.equal(resumen.notificaciones.enviadas, 5);
    assert.equal(resumen.suscriptores.confirmados, 1);
    assert.equal(resumen.avisosPorEstado.FINALIZADO, 1);
    // Transiciones automáticas con fechas controladas, sin esperar el reloj.
    await db.query("UPDATE avisos SET fecha_inicio = UTC_TIMESTAMP() - INTERVAL 1 HOUR WHERE id_aviso = ?", [ajeno]);
    assert.equal((await api('GET', `/avisos/${ajeno}`, 200)).estado, 'ACTIVO');
    await db.query("UPDATE avisos SET fecha_fin_estimada = UTC_TIMESTAMP() - INTERVAL 1 MINUTE WHERE id_aviso = ?", [ajeno]);
    assert.equal((await api('GET', `/avisos/${ajeno}`, 200)).estado, 'FINALIZADO');
    rechazarCorreo = true;
    const errorOriginal = console.error;
    console.error = () => {};
    try { await api('POST', '/avisos', 201, datos, funcionario); }
    finally { console.error = errorOriginal; rechazarCorreo = false; }
    assert.equal((await api('GET', '/dashboard', 200, undefined, admin)).notificaciones.fallidas, 1);
    await api('GET', `/suscripciones/baja/${vecino.token_baja}`, 200);
    const sinSuscriptor = await api('POST', '/avisos', 201, datos, funcionario);
    assert.equal(sinSuscriptor.destinatarios, 0);
    await api('DELETE', `/avisos/${sinSuscriptor.aviso.id}`, 204, undefined, admin);
    await api('GET', `/avisos/${sinSuscriptor.aviso.id}`, 404);
    await api('PATCH', `/usuarios/${usuario.id}/activo`, 200, { activo: false }, admin);
    await api('POST', '/avisos', 401, datos, funcionario);
    await api('GET', '/usuarios/me', 401, undefined, funcionario);
    // CRUD completo de catálogos sin referencias.
    const temporal = (await api('POST', '/zonas', 201, { nombre: 'Temporal' }, admin)).id;
    await api('DELETE', `/zonas/${temporal}`, 204, undefined, admin);
    const catTemporal = (await api('POST', '/categorias', 201, { nombre: 'Temporal' }, admin)).id;
    await api('DELETE', `/categorias/${catTemporal}`, 204, undefined, admin);
    if (verificarFrontend) await verificarFrontend({ apiUrl: base, db, mensajes });
    console.log(`Flujo completo OK: ${peticiones} solicitudes HTTP verificadas; ${mensajes.length} correos capturados por SMTP local.`);
  } finally {
    if (server) await new Promise((ok) => server.close(ok));
    if (pool) await pool.end();
    for (const socket of sockets) socket.destroy();
    if (smtp.listening) await new Promise((ok) => smtp.close(ok));
    if (db) {
      if (creada) await db.query(`DROP DATABASE \`${database}\``);
      await db.end();
    }
  }
}
module.exports = main;
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });
