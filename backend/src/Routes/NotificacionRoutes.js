const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken } = require('../Middleware/authMiddleware');

router.use(verificarToken);

// GET /api/notificaciones - Listar notificaciones del usuario autenticado
router.get('/', async (req, res) => {
  try {
    const [notificaciones] = await pool.query(
      `SELECT id_notificacion, tipo, mensaje, leido, fecha
       FROM notificaciones
       WHERE id_usuario = ?
       ORDER BY fecha DESC
       LIMIT 50`,
      [req.usuario.id_usuario]
    );

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al listar notificaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/notificaciones/no-leidas - Contar notificaciones no leidas
router.get('/no-leidas', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM notificaciones
       WHERE id_usuario = ? AND leido = FALSE`,
      [req.usuario.id_usuario]
    );

    res.json({ total: Number(rows[0].total) });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PATCH /api/notificaciones/:id/leida - Marcar una notificacion como leida
router.patch('/:id/leida', async (req, res) => {
  try {
    const [resultado] = await pool.query(
      `UPDATE notificaciones
       SET leido = TRUE
       WHERE id_notificacion = ? AND id_usuario = ?`,
      [req.params.id, req.usuario.id_usuario]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Notificacion no encontrada' });
    }

    res.json({ mensaje: 'Notificacion marcada como leida' });
  } catch (error) {
    console.error('Error al marcar notificacion:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PATCH /api/notificaciones/leidas/todas - Marcar todas como leidas
router.patch('/leidas/todas', async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leido = TRUE WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Notificaciones marcadas como leidas' });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
