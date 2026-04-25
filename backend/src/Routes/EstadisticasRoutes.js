const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/estadisticas/resumen - Resumen general (solo ADMIN)
router.get('/resumen', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    // Total de usuarios por rol
    const [usuarios] = await pool.query(`
      SELECT rol, COUNT(*) AS total FROM usuarios GROUP BY rol
    `);

    // Total de productos por estado
    const [productos] = await pool.query(`
      SELECT estado, COUNT(*) AS total FROM productos GROUP BY estado
    `);

    // Total de pedidos por estado y suma de ingresos
    const [pedidos] = await pool.query(`
      SELECT estado, COUNT(*) AS total, COALESCE(SUM(total), 0) AS ingresos
      FROM pedidos GROUP BY estado
    `);

    // Ingresos totales (pedidos PAGADO + ENVIADO + ENTREGADO)
    const [ingresos] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total_ingresos
      FROM pedidos
      WHERE estado IN ('PAGADO', 'ENVIADO', 'ENTREGADO')
    `);

    // Total de categorías
    const [categorias] = await pool.query(`
      SELECT COUNT(*) AS total FROM categorias
    `);

    res.json({
      usuarios,
      productos,
      pedidos,
      total_ingresos: ingresos[0].total_ingresos,
      total_categorias: categorias[0].total
    });
  } catch (error) {
    console.error('Error en estadísticas resumen:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/estadisticas/productos-top - Top 5 productos más pedidos (solo ADMIN)
router.get('/productos-top', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [top] = await pool.query(`
      SELECT 
        pr.nombre,
        pr.precio,
        SUM(dp.cantidad) AS total_vendido,
        SUM(dp.subtotal) AS ingresos_generados,
        u.nombre AS productor
      FROM detalle_pedido dp
      JOIN productos pr ON dp.id_producto = pr.id_producto
      JOIN usuarios u ON pr.id_productor = u.id_usuario
      GROUP BY pr.id_producto
      ORDER BY total_vendido DESC
      LIMIT 5
    `);
    res.json(top);
  } catch (error) {
    console.error('Error en top productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/estadisticas/pedidos-recientes - Últimos 10 pedidos (solo ADMIN)
router.get('/pedidos-recientes', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [recientes] = await pool.query(`
      SELECT 
        p.id_pedido,
        p.total,
        p.estado,
        p.fecha,
        u.nombre AS comprador,
        u.municipio
      FROM pedidos p
      JOIN usuarios u ON p.id_comprador = u.id_usuario
      ORDER BY p.fecha DESC
      LIMIT 10
    `);
    res.json(recientes);
  } catch (error) {
    console.error('Error en pedidos recientes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/estadisticas/productores - Ranking de productores (solo ADMIN)
router.get('/productores', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [ranking] = await pool.query(`
      SELECT 
        u.nombre AS productor,
        u.municipio,
        COUNT(DISTINCT p.id_producto) AS total_productos,
        COUNT(DISTINCT dp.id_detalle) AS total_ventas,
        COALESCE(SUM(dp.subtotal), 0) AS ingresos_totales
      FROM usuarios u
      LEFT JOIN productos p ON u.id_usuario = p.id_productor
      LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
      WHERE u.rol = 'PRODUCTOR'
      GROUP BY u.id_usuario
      ORDER BY ingresos_totales DESC
    `);
    res.json(ranking);
  } catch (error) {
    console.error('Error en ranking productores:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/estadisticas/ventas-por-categoria - Ventas agrupadas por categoría (solo ADMIN)
router.get('/ventas-por-categoria', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        c.nombre AS categoria,
        COUNT(DISTINCT p.id_producto) AS productos_activos,
        COALESCE(SUM(dp.cantidad), 0) AS unidades_vendidas,
        COALESCE(SUM(dp.subtotal), 0) AS ingresos
      FROM categorias c
      LEFT JOIN productos p ON c.id_categoria = p.id_categoria AND p.estado = 'APROBADO'
      LEFT JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
      GROUP BY c.id_categoria
      ORDER BY ingresos DESC
    `);
    res.json(ventas);
  } catch (error) {
    console.error('Error en ventas por categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
