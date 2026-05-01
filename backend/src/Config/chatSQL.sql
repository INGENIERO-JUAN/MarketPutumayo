-- Tabla de conversaciones entre comprador y productor
CREATE TABLE IF NOT EXISTS conversaciones (
  id_conversacion INT AUTO_INCREMENT PRIMARY KEY,
  id_comprador    INT NOT NULL,
  id_productor    INT NOT NULL,
  id_producto     INT,
  creado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_comprador) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_productor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (id_producto)  REFERENCES productos(id_producto) ON DELETE SET NULL,
  INDEX idx_conv_comprador (id_comprador),
  INDEX idx_conv_productor (id_productor)
);

-- Tabla de mensajes del chat
CREATE TABLE IF NOT EXISTS mensajes_chat (
  id_mensaje       INT AUTO_INCREMENT PRIMARY KEY,
  id_conversacion  INT NOT NULL,
  id_remitente     INT NOT NULL,
  mensaje          TEXT NOT NULL,
  leido            BOOLEAN NOT NULL DEFAULT FALSE,
  enviado_en       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_conversacion) REFERENCES conversaciones(id_conversacion) ON DELETE CASCADE,
  FOREIGN KEY (id_remitente)    REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  INDEX idx_msg_conversacion (id_conversacion),
  INDEX idx_msg_leido (leido)
);
