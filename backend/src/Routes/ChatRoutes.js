const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

router.use(verificarToken);

// POST /api/chat/conversaciones - Iniciar o recuperar una conversacion
router.post('/conversaciones', verificarRol('COMPRADOR'), async (req, res) => {
  const { id_productor, id_producto } = req.body;
  const id_comprador = req.usuario.id_usuario;

  if (!id_productor) {
    return res.status(400).json({ error: 'id_productor es requerido' });
  }

  try {
    let query = `
      SELECT id_conversacion FROM conversaciones
      WHERE id_comprador = ? AND id_productor = ?
    `;
    const params = [id_comprador, id_productor];

    if (id_producto) {
      query += ' AND id_producto = ?';
      params.push(id_producto);
    }

    query += ' LIMIT 1';

    const [existentes] = await pool.query(query, params);

    if (existentes.length > 0) {
      return res.json({
        id_conversacion: existentes[0].id_conversacion,
        nueva: false,
        existente: true,
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO conversaciones (id_comprador, id_productor, id_producto) VALUES (?, ?, ?)',
      [id_comprador, id_productor, id_producto || null]
    );

    res.status(201).json({
      id_conversacion: resultado.insertId,
      nueva: true,
      existente: false,
    });
  } catch (error) {
    console.error('Error al crear conversacion:', error);
    res.status(500).json({ error: 'Error al crear conversacion' });
  }
});

// GET /api/chat/conversaciones - Listar conversaciones del usuario autenticado
router.get('/conversaciones', async (req, res) => {
  const id_usuario = req.usuario.id_usuario;

  try {
    const [conversaciones] = await pool.query(
      `SELECT
        c.id_conversacion,
        c.id_comprador,
        c.id_productor,
        c.creado_en,
        uc.nombre AS nombre_comprador,
        up.nombre AS nombre_productor,
        pr.nombre AS nombre_producto,
        (
          SELECT m.mensaje
          FROM mensajes_chat m
          WHERE m.id_conversacion = c.id_conversacion
          ORDER BY m.enviado_en DESC LIMIT 1
        ) AS ultimo_mensaje,
        (
          SELECT m.enviado_en
          FROM mensajes_chat m
          WHERE m.id_conversacion = c.id_conversacion
          ORDER BY m.enviado_en DESC LIMIT 1
        ) AS ultima_fecha,
        (
          SELECT COUNT(*)
          FROM mensajes_chat m
          WHERE m.id_conversacion = c.id_conversacion
            AND m.leido = FALSE
            AND m.id_remitente != ?
        ) AS no_leidos
      FROM conversaciones c
      JOIN usuarios uc ON uc.id_usuario = c.id_comprador
      JOIN usuarios up ON up.id_usuario = c.id_productor
      LEFT JOIN productos pr ON pr.id_producto = c.id_producto
      WHERE c.id_comprador = ? OR c.id_productor = ?
      ORDER BY ultima_fecha DESC`,
      [id_usuario, id_usuario, id_usuario]
    );

    res.json(conversaciones);
  } catch (error) {
    console.error('Error al listar conversaciones:', error);
    res.status(500).json({ error: 'Error al listar conversaciones' });
  }
});

// GET /api/chat/conversaciones/:id/mensajes - Obtener mensajes de una conversacion
router.get('/conversaciones/:id/mensajes', async (req, res) => {
  const id_conversacion = parseInt(req.params.id, 10);
  const id_usuario = req.usuario.id_usuario;

  try {
    const [conv] = await pool.query(
      'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
      [id_conversacion, id_usuario, id_usuario]
    );

    if (conv.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta conversacion' });
    }

    await pool.query(
      'UPDATE mensajes_chat SET leido = TRUE WHERE id_conversacion = ? AND id_remitente != ?',
      [id_conversacion, id_usuario]
    );

    const [mensajes] = await pool.query(
      `SELECT
        m.id_mensaje,
        m.id_conversacion,
        m.id_remitente AS id_usuario,
        u.nombre,
        u.rol,
        m.mensaje,
        m.leido,
        m.enviado_en
      FROM mensajes_chat m
      JOIN usuarios u ON u.id_usuario = m.id_remitente
      WHERE m.id_conversacion = ?
      ORDER BY m.enviado_en ASC`,
      [id_conversacion]
    );

    res.json({ conversacion: conv[0], mensajes });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

module.exports = router;
