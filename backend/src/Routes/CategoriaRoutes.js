const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/categorias - Listar todas las categorías (público)
router.get('/', async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT id_categoria, nombre, descripcion FROM categorias WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(categorias);
  } catch (error) {
    console.error('Error al listar categorías:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/categorias - Crear categoría (solo ADMIN)
router.post('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );

    res.status(201).json({
      mensaje: 'Categoría creada exitosamente',
      id_categoria: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    console.error('Error al crear categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/categorias/:id - Editar categoría (solo ADMIN)
router.put('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    const [resultado] = await pool.query(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
      [nombre, descripcion || null, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/categorias/:id - Desactivar categoría (solo ADMIN)
router.delete('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [resultado] = await pool.query(
      'UPDATE categorias SET activo = FALSE WHERE id_categoria = ?',
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ mensaje: 'Categoría desactivada exitosamente' });
  } catch (error) {
    console.error('Error al desactivar categoría:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
