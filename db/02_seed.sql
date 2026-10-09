-- MiZona: datos iniciales
-- El archivo está en UTF-8; fija también la codificación del cliente que lo importa.
SET NAMES utf8mb4;
USE mizona;

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
