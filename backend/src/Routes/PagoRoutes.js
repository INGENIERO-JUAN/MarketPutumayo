const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// POST /api/pagos - Registrar pago de un pedido
router.post('/', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  try {
    const { id_pedido, metodo, referencia, monto } = req.body;

    if (!id_pedido || !metodo || !monto) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const metodosValidos = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA'];
    if (!metodosValidos.includes(metodo)) {
      return res.status(400).json({ error: 'Método de pago inválido' });
    }

    // Verificar que el pedido pertenece al comprador
    const [pedidos] = await pool.query(
      'SELECT id_pedido, estado FROM pedidos WHERE id_pedido = ? AND id_comprador = ?',
      [id_pedido, req.usuario.id_usuario]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedidos[0].estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'El pedido ya fue pagado o cancelado' });
    }

    // Registrar el pago
    const [resultado] = await pool.query(
      'INSERT INTO pagos (id_pedido, metodo, referencia, monto) VALUES (?, ?, ?, ?)',
      [id_pedido, metodo, referencia || null, monto]
    );

    // Actualizar estado del pedido a PAGADO
    await pool.query(
      'UPDATE pedidos SET estado = "PAGADO" WHERE id_pedido = ?',
      [id_pedido]
    );

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      id_pago: resultado.insertId
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pagos/:id_pedido - Ver pago de un pedido
router.get('/:id_pedido', verificarToken, async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT p.id_pago, p.metodo, p.estado, p.referencia, p.monto, p.fecha
       FROM pagos p
       JOIN pedidos pe ON p.id_pedido = pe.id_pedido
       WHERE p.id_pedido = ? AND (pe.id_comprador = ? OR ? = 'ADMIN')`,
      [req.params.id_pedido, req.usuario.id_usuario, req.usuario.rol]
    );

    if (pagos.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(pagos[0]);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pagos - Listar todos los pagos (solo ADMIN)
router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT p.id_pago, p.metodo, p.estado, p.monto, p.fecha,
              pe.id_pedido, u.nombre AS comprador
       FROM pagos p
       JOIN pedidos pe ON p.id_pedido = pe.id_pedido
       JOIN usuarios u ON pe.id_comprador = u.id_usuario
       ORDER BY p.fecha DESC`
    );
    res.json(pagos);
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
