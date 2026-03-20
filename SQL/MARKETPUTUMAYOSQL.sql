CREATE DATABASE IF NOT EXISTS market_putumayo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE market_putumayo;

-- ============================================================
-- USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)  NOT NULL,
  correo        VARCHAR(100)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  rol           ENUM('ADMIN','PRODUCTOR','COMPRADOR') NOT NULL,
  telefono      VARCHAR(20),
  municipio     VARCHAR(100),
  activo        BOOLEAN       NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_correo (correo),
  INDEX idx_usuarios_rol    (rol)
);

-- ============================================================
-- CATEGORÍAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria  INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL UNIQUE,
  descripcion   TEXT,
  activo        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ============================================================
-- PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id_producto   INT AUTO_INCREMENT PRIMARY KEY,
  id_productor  INT            NOT NULL,
  id_categoria  INT            NOT NULL,
  nombre        VARCHAR(150)   NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(10,2)  NOT NULL CHECK (precio >= 0),
  stock         INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
  imagen_url    VARCHAR(255),
  estado        ENUM('PENDIENTE','APROBADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  creado_en     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_productor) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE RESTRICT,
  INDEX idx_productos_estado    (estado),
  INDEX idx_productos_categoria (id_categoria),
  INDEX idx_productos_productor (id_productor)
);

-- ============================================================
-- CARRITO
-- ============================================================
CREATE TABLE IF NOT EXISTS carritos (
  id_carrito    INT AUTO_INCREMENT PRIMARY KEY,
  id_comprador  INT       NOT NULL,
  creado_en     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_comprador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_carritos_comprador (id_comprador)
);

CREATE TABLE IF NOT EXISTS carrito_detalle (
  id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
  id_carrito      INT           NOT NULL,
  id_producto     INT           NOT NULL,
  cantidad        INT           NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  FOREIGN KEY (id_carrito)  REFERENCES carritos(id_carrito)  ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
  UNIQUE KEY uq_carrito_producto (id_carrito, id_producto)
);

-- ============================================================
-- PEDIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id_pedido     INT AUTO_INCREMENT PRIMARY KEY,
  id_comprador  INT           NOT NULL,
  total         DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  estado        ENUM('PENDIENTE','PAGADO','ENVIADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  direccion_entrega VARCHAR(255),
  notas         TEXT,
  fecha         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_comprador) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
  INDEX idx_pedidos_comprador (id_comprador),
  INDEX idx_pedidos_estado    (estado)
);

-- ============================================================
-- DETALLE DE PEDIDO
-- ============================================================
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido       INT           NOT NULL,
  id_producto     INT           NOT NULL,
  cantidad        INT           NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal        DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  FOREIGN KEY (id_pedido)   REFERENCES pedidos(id_pedido)   ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE RESTRICT
);

-- ============================================================
-- PAGOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  id_pago       INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido     INT         NOT NULL,
  metodo        ENUM('EFECTIVO','TRANSFERENCIA','TARJETA','NEQUI','DAVIPLATA') NOT NULL,
  estado        ENUM('PENDIENTE','APROBADO','RECHAZADO') NOT NULL DEFAULT 'PENDIENTE',
  referencia    VARCHAR(100),
  monto         DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
  fecha         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  INDEX idx_pagos_pedido (id_pedido),
  INDEX idx_pagos_estado (estado)
);

-- ============================================================
-- NOTIFICACIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT       NOT NULL,
  tipo            ENUM('PEDIDO','PAGO','PRODUCTO','SISTEMA') NOT NULL DEFAULT 'SISTEMA',
  mensaje         TEXT      NOT NULL,
  leido           BOOLEAN   NOT NULL DEFAULT FALSE,
  fecha           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_notificaciones_usuario (id_usuario),
  INDEX idx_notificaciones_leido   (leido)
);

-- ============================================================
-- RESEÑAS DE PRODUCTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS resenas (
  id_resena     INT AUTO_INCREMENT PRIMARY KEY,
  id_producto   INT  NOT NULL,
  id_comprador  INT  NOT NULL,
  calificacion  TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario    TEXT,
  fecha         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_producto)  REFERENCES productos(id_producto) ON DELETE CASCADE,
  FOREIGN KEY (id_comprador) REFERENCES usuarios(id_usuario)   ON DELETE CASCADE,
  UNIQUE KEY uq_resena_usuario_producto (id_producto, id_comprador)
);
