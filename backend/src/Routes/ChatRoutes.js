const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/chat/conversaciones - Listar conversaciones del usuario
router.get('/conversaciones', verificarToken, async (req, res) => {
  try {
    const [conversaciones] = await pool.query(
      `SELECT c.id_conversacion, c.creado_en,
              u1.id_usuario AS id_comprador, u1.nombre AS nombre_comprador,
              u2.id_usuario AS id_productor, u2.nombre AS nombre_productor,
              p.nombre AS nombre_producto,
              (SELECT mensaje FROM mensajes_chat WHERE id_conversacion = c.id_conversacion ORDER BY enviado_en DESC LIMIT 1) AS ultimo_mensaje,
              (SELECT enviado_en FROM mensajes_chat WHERE id_conversacion = c.id_conversacion ORDER BY enviado_en DESC LIMIT 1) AS ultima_fecha,
              (SELECT COUNT(*) FROM mensajes_chat WHERE id_conversacion = c.id_conversacion AND leido = FALSE AND id_remitente != ?) AS no_leidos
       FROM conversaciones c
       JOIN usuarios u1 ON c.id_comprador = u1.id_usuario
       JOIN usuarios u2 ON c.id_productor = u2.id_usuario
       LEFT JOIN productos p ON c.id_producto = p.id_producto
       WHERE c.id_comprador = ? OR c.id_productor = ?
       ORDER BY ultima_fecha DESC`,
      [req.usuario.id_usuario, req.usuario.id_usuario, req.usuario.id_usuario]
    );
    res.json(conversaciones);
  } catch (error) {
    console.error('Error al listar conversaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/chat/conversaciones - Iniciar conversación
router.post('/conversaciones', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  try {
    const { id_productor, id_producto } = req.body;

    if (!id_productor) {
      return res.status(400).json({ error: 'El id del productor es requerido' });
    }

    // Verificar si ya existe una conversación
    const [existente] = await pool.query(
      `SELECT id_conversacion FROM conversaciones 
       WHERE id_comprador = ? AND id_productor = ? AND (id_producto = ? OR id_producto IS NULL)`,
      [req.usuario.id_usuario, id_productor, id_producto || null]
    );

    if (existente.length > 0) {
      return res.json({ id_conversacion: existente[0].id_conversacion, existente: true });
    }

    const [resultado] = await pool.query(
      'INSERT INTO conversaciones (id_comprador, id_productor, id_producto) VALUES (?, ?, ?)',
      [req.usuario.id_usuario, id_productor, id_producto || null]
    );

    res.status(201).json({ id_conversacion: resultado.insertId, existente: false });
  } catch (error) {
    console.error('Error al crear conversación:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/chat/conversaciones/:id/mensajes - Obtener mensajes de una conversación
router.get('/conversaciones/:id/mensajes', verificarToken, async (req, res) => {
  try {
    // Verificar que el usuario pertenece a la conversación
    const [conv] = await pool.query(
      'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
      [req.params.id, req.usuario.id_usuario, req.usuario.id_usuario]
    );

    if (conv.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
    }

    // Marcar mensajes como leídos
    await pool.query(
      'UPDATE mensajes_chat SET leido = TRUE WHERE id_conversacion = ? AND id_remitente != ?',
      [req.params.id, req.usuario.id_usuario]
    );

    const [mensajes] = await pool.query(
      `SELECT m.id_mensaje, m.mensaje, m.enviado_en, m.leido,
              u.id_usuario, u.nombre, u.rol
       FROM mensajes_chat m
       JOIN usuarios u ON m.id_remitente = u.id_usuario
       WHERE m.id_conversacion = ?
       ORDER BY m.enviado_en ASC`,
      [req.params.id]
    );

    res.json({ conversacion: conv[0], mensajes });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
