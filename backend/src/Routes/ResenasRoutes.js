const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/resenas/:id_producto — listar reseñas de un producto (público)
router.get('/:id_producto', async (req, res) => {
  try {
    const [resenas] = await pool.query(
      `SELECT r.id_resena, r.calificacion, r.comentario, r.fecha,
              u.nombre AS comprador
       FROM resenas r
       JOIN usuarios u ON r.id_comprador = u.id_usuario
       WHERE r.id_producto = ?
       ORDER BY r.fecha DESC`,
      [req.params.id_producto]
    );
    res.json(resenas);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/resenas/:id_producto — crear reseña (solo COMPRADOR)
router.post('/:id_producto', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  const { calificacion, comentario } = req.body;
  const id_comprador = req.usuario.id_usuario;
  const id_producto = req.params.id_producto;

  if (!calificacion || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'Calificación debe ser entre 1 y 5' });
  }

  try {
    // Verificar que el comprador haya comprado ese producto
    const [pedidos] = await pool.query(
      `SELECT dp.id_detalle FROM detalle_pedido dp
       JOIN pedidos p ON dp.id_pedido = p.id_pedido
       WHERE p.id_comprador = ? AND dp.id_producto = ? AND p.estado = 'ENTREGADO'
       LIMIT 1`,
      [id_comprador, id_producto]
    );

    if (pedidos.length === 0) {
      return res.status(403).json({ error: 'Solo puedes reseñar productos que hayas comprado y recibido' });
    }

    await pool.query(
      `INSERT INTO resenas (id_producto, id_comprador, calificacion, comentario)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE calificacion = VALUES(calificacion), comentario = VALUES(comentario)`,
      [id_producto, id_comprador, calificacion, comentario || null]
    );

    res.status(201).json({ mensaje: 'Reseña guardada exitosamente' });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
