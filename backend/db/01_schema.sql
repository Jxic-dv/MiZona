SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS mizona
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mizona;

CREATE TABLE zonas (
  id_zona   INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(50) NOT NULL UNIQUE
);

-- Funcionarios que publican avisos (el vecino NO tiene cuenta)
CREATE TABLE usuarios (
  id_usuario    BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(120) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           ENUM('ADMIN','FUNCIONARIO') NOT NULL DEFAULT 'FUNCIONARIO',
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE avisos (
  id_aviso           BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_categoria       INT NOT NULL,
  titulo             VARCHAR(150) NOT NULL,
  descripcion        TEXT,
  ubicacion_detalle  VARCHAR(250),
  fecha_inicio       DATETIME NOT NULL,
  fecha_fin_estimada DATETIME NULL,
  estado             ENUM('PROGRAMADO','ACTIVO','CANCELADO','FINALIZADO')
                     NOT NULL DEFAULT 'PROGRAMADO',
  creado_por         BIGINT NOT NULL,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                     ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_aviso_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  CONSTRAINT fk_aviso_usuario   FOREIGN KEY (creado_por)   REFERENCES usuarios(id_usuario),
  INDEX idx_avisos_estado_fecha (estado, fecha_inicio),
  INDEX idx_avisos_categoria (id_categoria)
);

CREATE TABLE aviso_zonas (
  id_aviso BIGINT NOT NULL,
  id_zona  INT NOT NULL,
  PRIMARY KEY (id_aviso, id_zona),
  CONSTRAINT fk_az_aviso FOREIGN KEY (id_aviso) REFERENCES avisos(id_aviso) ON DELETE CASCADE,
  CONSTRAINT fk_az_zona  FOREIGN KEY (id_zona)  REFERENCES zonas(id_zona)
);

-- Vecinos suscritos por correo (sin cuenta)
CREATE TABLE suscriptores (
  id_suscriptor      BIGINT AUTO_INCREMENT PRIMARY KEY,
  email              VARCHAR(150) NOT NULL UNIQUE,
  confirmado         BOOLEAN NOT NULL DEFAULT FALSE,
  token_confirmacion CHAR(64) NOT NULL UNIQUE,
  token_baja         CHAR(64) NOT NULL UNIQUE,
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suscripcion_zonas (
  id_suscriptor BIGINT NOT NULL,
  id_zona       INT NOT NULL,
  PRIMARY KEY (id_suscriptor, id_zona),
  CONSTRAINT fk_sz_suscriptor FOREIGN KEY (id_suscriptor) REFERENCES suscriptores(id_suscriptor) ON DELETE CASCADE,
  CONSTRAINT fk_sz_zona       FOREIGN KEY (id_zona)       REFERENCES zonas(id_zona)
);

-- Registro de correos enviados (evita duplicados y da trazabilidad)
CREATE TABLE notificaciones_enviadas (
  id_notificacion BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_aviso        BIGINT NOT NULL,
  id_suscriptor   BIGINT NOT NULL,
  tipo            ENUM('NUEVO','ACTUALIZACION','CANCELACION') NOT NULL,
  exito           BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_envio     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ne_aviso      FOREIGN KEY (id_aviso)      REFERENCES avisos(id_aviso) ON DELETE CASCADE,
  CONSTRAINT fk_ne_suscriptor FOREIGN KEY (id_suscriptor) REFERENCES suscriptores(id_suscriptor) ON DELETE CASCADE,
  INDEX idx_ne_aviso_suscriptor (id_aviso, id_suscriptor)
);


INSERT INTO categorias (nombre) VALUES
  ('Energía eléctrica'), ('Agua potable'), ('Drenajes'),
  ('Vialidad y tránsito'), ('Obras'), ('Otros');

-- Verifica esta lista contra las zonas oficiales de tu municipalidad
INSERT INTO zonas (nombre) VALUES
  ('Zona 1'),
  ('Zona 2'),
  ('Zona 3'),
  ('Zona 4'),
  ('Zona 5'),
  ('Zona 6'),
  ('Zona 7'),
  ('Zona 8'),
  ('Zona 9'),
  ('Zona 10'),
  ('Zona 11'),
  ('Zona 12'),
  ('Zona 13'),
  ('Zona 14'),
  ('Zona 15'),
  ('Zona 16'),
  ('Zona 17'),
  ('Zona 18'),
  ('Zona 19'),
  ('Zona 20'),
  ('Zona 21'),
  ('Zona 22'),
  ('Zona 23'),
  ('Zona 24'),
  ('Zona 25');

-- El usuario ADMIN se crea desde el backend (script de seed) para guardar el hash bcrypt.
INSERT INTO usuarios (
  nombre,
  email,
  password_hash,
  rol,
  activo
)
VALUES (
  'Administrador',
  'admin@test.com',
  '$2y$12$poZHai7hrv6HoLRArZB6jOq9AhbSdU.fQt1cp2J5Us0FawReholvS',
  'ADMIN',
  TRUE
);
