const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// POST /api/pedidos - Crear pedido desde el carrito
router.post('/', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { items, direccion_entrega, notas } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }

    await connection.beginTransaction();

    let total = 0;
    for (const item of items) {
      const [productos] = await connection.query(
        'SELECT precio, stock FROM productos WHERE id_producto = ? AND estado = "APROBADO"',
        [item.id_producto]
      );

      if (productos.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: `Producto ${item.id_producto} no encontrado` });
      }

      if (productos[0].stock < item.cantidad) {
        await connection.rollback();
        return res.status(400).json({ error: `Stock insuficiente para el producto ${item.id_producto}` });
      }

      total += productos[0].precio * item.cantidad;
    }

    const [pedido] = await connection.query(
      'INSERT INTO pedidos (id_comprador, total, direccion_entrega, notas) VALUES (?, ?, ?, ?)',
      [req.usuario.id_usuario, total, direccion_entrega || null, notas || null]
    );

    for (const item of items) {
      const [productos] = await connection.query(
        'SELECT precio FROM productos WHERE id_producto = ?',
        [item.id_producto]
      );

      await connection.query(
        'INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
        [pedido.insertId, item.id_producto, item.cantidad, productos[0].precio]
      );

      await connection.query(
        'UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
        [item.cantidad, item.id_producto]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      mensaje: 'Pedido creado exitosamente',
      id_pedido: pedido.insertId,
      total
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pedidos/mis-pedidos - Ver pedidos del comprador autenticado
router.get('/mis-pedidos', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      `SELECT p.id_pedido, p.total, p.estado, p.direccion_entrega, p.fecha,
              dp.cantidad, dp.precio_unitario, dp.subtotal,
              pr.nombre AS producto
       FROM pedidos p
       JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
       JOIN productos pr ON dp.id_producto = pr.id_producto
       WHERE p.id_comprador = ?
       ORDER BY p.fecha DESC`,
      [req.usuario.id_usuario]
    );
    res.json(pedidos);
  } catch (error) {
    console.error('Error al listar mis pedidos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pedidos/mis-ventas - Ver pedidos recibidos para el productor
router.get('/mis-ventas', verificarToken, verificarRol('PRODUCTOR'), async (req, res) => {
  try {
    const [ventas] = await pool.query(
      `SELECT 
        p.id_pedido,
        p.estado,
        p.fecha,
        p.direccion_entrega,
        u.nombre AS comprador,
        dp.cantidad,
        dp.precio_unitario,
        pr.nombre AS producto
       FROM pedidos p
       JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
       JOIN productos pr ON dp.id_producto = pr.id_producto
       JOIN usuarios u ON p.id_comprador = u.id_usuario
       WHERE pr.id_productor = ?
       ORDER BY p.fecha DESC`,
      [req.usuario.id_usuario]
    );

    // Agrupar por pedido
    const agrupados = ventas.reduce((acc, item) => {
      if (!acc[item.id_pedido]) {
        acc[item.id_pedido] = {
          id_pedido: item.id_pedido,
          estado: item.estado,
          fecha: item.fecha,
          direccion_entrega: item.direccion_entrega,
          comprador: item.comprador,
          items: []
        };
      }
      acc[item.id_pedido].items.push({
        producto: item.producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      });
      return acc;
    }, {});

    res.json(Object.values(agrupados));
  } catch (error) {
    console.error('Error al listar ventas:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pedidos - Ver todos los pedidos (solo ADMIN)
router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [pedidos] = await pool.query(
      `SELECT p.id_pedido, p.total, p.estado, p.fecha,
              u.nombre AS comprador, u.correo,
              COUNT(dp.id_detalle) AS total_items
       FROM pedidos p
       JOIN usuarios u ON p.id_comprador = u.id_usuario
       JOIN detalle_pedido dp ON p.id_pedido = dp.id_pedido
       GROUP BY p.id_pedido
       ORDER BY p.fecha DESC`
    );
    res.json(pedidos);
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/pedidos/:id/estado - Actualizar estado del pedido (solo ADMIN)
router.put('/:id/estado', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const [resultado] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id_pedido = ?',
      [estado, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ mensaje: `Pedido actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
