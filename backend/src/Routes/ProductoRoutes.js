const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/productos - Listar productos aprobados (público)
router.get('/', async (req, res) => {
  try {
    const [productos] = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock, 
              p.estado, c.nombre AS categoria, u.nombre AS productor
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id_categoria
       JOIN usuarios u ON p.id_productor = u.id_usuario
       WHERE p.estado = 'APROBADO'
       ORDER BY p.creado_en DESC`
    );
    res.json(productos);
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/productos/mis-productos - Ver productos del productor autenticado
router.get('/mis-productos', verificarToken, verificarRol('PRODUCTOR'), async (req, res) => {
  try {
    const [productos] = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
              p.estado, c.nombre AS categoria
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id_categoria
       WHERE p.id_productor = ?
       ORDER BY p.creado_en DESC`,
      [req.usuario.id_usuario]
    );
    res.json(productos);
  } catch (error) {
    console.error('Error al listar mis productos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/productos/pendientes - Ver productos pendientes (solo ADMIN)
router.get('/pendientes', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [productos] = await pool.query(
      `SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
              p.estado, c.nombre AS categoria, u.nombre AS productor
       FROM productos p
       JOIN categorias c ON p.id_categoria = c.id_categoria
       JOIN usuarios u ON p.id_productor = u.id_usuario
       WHERE p.estado = 'PENDIENTE'
       ORDER BY p.creado_en DESC`
    );
    res.json(productos);
  } catch (error) {
    console.error('Error al listar productos pendientes:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/productos - Crear producto (solo PRODUCTOR)
router.post('/', verificarToken, verificarRol('PRODUCTOR'), async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, id_categoria } = req.body;

    if (!nombre || !precio || !stock || !id_categoria) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (precio < 0 || stock < 0) {
      return res.status(400).json({ error: 'Precio y stock deben ser positivos' });
    }

    const [resultado] = await pool.query(
      `INSERT INTO productos (id_productor, id_categoria, nombre, descripcion, precio, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.usuario.id_usuario, id_categoria, nombre, descripcion || null, precio, stock]
    );

    res.status(201).json({
      mensaje: 'Producto creado exitosamente, pendiente de aprobación',
      id_producto: resultado.insertId
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/productos/:id/estado - Aprobar o rechazar producto (solo ADMIN)
router.put('/:id/estado', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['APROBADO', 'RECHAZADO'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const [resultado] = await pool.query(
      'UPDATE productos SET estado = ? WHERE id_producto = ?',
      [estado, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: `Producto ${estado.toLowerCase()} exitosamente` });
  } catch (error) {
    console.error('Error al actualizar estado del producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/productos/:id - Eliminar producto (PRODUCTOR dueño o ADMIN)
router.delete('/:id', verificarToken, verificarRol('PRODUCTOR', 'ADMIN'), async (req, res) => {
  try {
    const [productos] = await pool.query(
      'SELECT id_productor FROM productos WHERE id_producto = ?',
      [req.params.id]
    );

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (req.usuario.rol !== 'ADMIN' && productos[0].id_productor !== req.usuario.id_usuario) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto' });
    }

    await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);
    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
