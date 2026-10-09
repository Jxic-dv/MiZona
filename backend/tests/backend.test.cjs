Object.assign(process.env, { NODE_ENV: 'test', DB_USER: 'test', DB_PASSWORD: 'test', DB_NAME: 'test', JWT_SECRET: 'mizona-tests-only-secret' });
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { config } = require('../src/config/env.ts');
const { pool } = require('../src/config/db.ts');
const { authRequired, requireRole } = require('../src/middlewares/auth.middleware.ts');
const { listarAvisosQuery } = require('../src/schemas/aviso.schema.ts');
const originalQuery = pool.query;
const originalTransport = nodemailer.createTransport;
after(async () => {
  pool.query = originalQuery;
  nodemailer.createTransport = originalTransport;
  await pool.end();
});

async function autenticar(row) {
  pool.query = async () => [row ? [row] : []];
  const token = jwt.sign({ sub: '1', nombre: 'Anterior', rol: 'ADMIN' }, config.jwt.secret);
  const res = { locals: {} };
  let error;
  await authRequired({ headers: { authorization: `Bearer ${token}` } }, res, (err) => { error = err; });
  return { res, error };
}

test('rechaza tokens de usuarios desactivados o eliminados', async () => {
  for (const row of [null, { id_usuario: 1, activo: 0 }]) {
    assert.equal((await autenticar(row)).error.status, 401);
  }
});

test('usa el rol y nombre actuales y deniega dashboard al funcionario', async () => {
  const { res, error } = await autenticar({ id_usuario: 1, activo: 1, nombre: 'Actual', rol: 'FUNCIONARIO' });
  assert.equal(error, undefined);
  assert.equal(res.locals.user.nombre, 'Actual');
  assert.equal(res.locals.user.rol, 'FUNCIONARIO');
  let denegado;
  requireRole('ADMIN')({}, res, (err) => { denegado = err; });
  assert.equal(denegado.status, 403);
});

test('un error de base de datos llega al manejador como tal', async () => {
  const fallo = new Error('DB no disponible');
  pool.query = async () => { throw fallo; };
  const token = jwt.sign({ sub: '1' }, config.jwt.secret);
  let error;
  await authRequired({ headers: { authorization: `Bearer ${token}` } }, { locals: {} }, (err) => { error = err; });
  assert.equal(error, fallo);
});

test('rechaza fechas inexistentes y rangos invertidos; acepta años bisiestos', () => {
  for (const desde of ['2026-02-30', '2026-02-29', '2026-13-01']) {
    assert.equal(listarAvisosQuery.safeParse({ desde }).success, false);
  }
  assert.equal(listarAvisosQuery.safeParse({ desde: '2028-02-29' }).success, true);
  assert.equal(listarAvisosQuery.safeParse({ desde: '2026-10-10', hasta: '2026-10-09' }).success, false);
  assert.equal(listarAvisosQuery.safeParse({ desde: '2026-10-09', hasta: '2026-10-09' }).success, true);
});

test('espera el envío y registra éxitos y fallos sin detener los siguientes correos', async () => {
  const eventos = [];
  config.smtp.host = 'smtp.test';
  nodemailer.createTransport = () => ({ sendMail: async (correo) => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    eventos.push(correo.to);
    assert.match(correo.text, /Estado: FINALIZADO/);
    if (correo.to === 'fallo@test.local') throw new Error('SMTP de prueba');
    return {};
  } });
  pool.query = async (_sql, valores) => { eventos.push(valores[3]); return [{}]; };
  const { notificar } = require('../src/services/notificacion.service.ts');
  const aviso = { id: 1, titulo: 'Prueba', estado: 'FINALIZADO', zonas: [{ nombre: 'Zona 1' }], categoria: { nombre: 'Agua' }, fechaInicio: new Date(), fechaFinEstimada: null };
  const destinatarios = ['ok@test.local', 'fallo@test.local', 'ultimo@test.local'].map((email, i) => ({ id: i + 1, email, tokenBaja: 'a'.repeat(64) }));
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.equal(await notificar(aviso, 'ACTUALIZACION', destinatarios), 3);
    assert.deepEqual(eventos, ['ok@test.local', 1, 'fallo@test.local', 0, 'ultimo@test.local', 1]);
  } finally { console.error = originalError; }
});
