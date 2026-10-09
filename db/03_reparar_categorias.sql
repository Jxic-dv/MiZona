-- Repara únicamente los nombres dañados por una importación UTF-8 como latin1.
-- Es idempotente: conserva los IDs y no cambia nombres ya correctos o personalizados.
SET NAMES utf8mb4;
USE mizona;

UPDATE categorias
SET nombre = 'Energía eléctrica'
WHERE HEX(nombre) = '456E657267C383C2AD6120656CC383C2A9637472696361';

UPDATE categorias
SET nombre = 'Vialidad y tránsito'
WHERE HEX(nombre) = '5669616C696461642079207472C383C2A16E7369746F';
