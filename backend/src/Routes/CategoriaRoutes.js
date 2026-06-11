const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/categorias - Listar todas las categorias publicas activas
router.get('/', async (req, res) => {
  try {
    const [categorias] = await pool.query(
      'SELECT id_categoria, nombre FROM categorias WHERE activo = TRUE ORDER BY nombre'
    );
    res.json(categorias);
  } catch (error) {
    console.error('Error al listar categorias:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/categorias - Crear categoria (solo ADMIN)
router.post('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [resultado] = await pool.query(
      'INSERT INTO categorias (nombre) VALUES (?)',
      [nombre.trim()]
    );

    res.status(201).json({
      mensaje: 'Categoria creada exitosamente',
      id_categoria: resultado.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe una categoria con ese nombre' });
    }

    console.error('Error al crear categoria:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/categorias/:id - Editar categoria (solo ADMIN)
router.put('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const [resultado] = await pool.query(
      'UPDATE categorias SET nombre = ? WHERE id_categoria = ?',
      [nombre.trim(), req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    res.json({ mensaje: 'Categoria actualizada exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe una categoria con ese nombre' });
    }

    console.error('Error al actualizar categoria:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// DELETE /api/categorias/:id - Eliminar categoria (solo ADMIN)
router.delete('/:id', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [resultado] = await pool.query(
      'DELETE FROM categorias WHERE id_categoria = ?',
      [req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria no encontrada' });
    }

    res.json({ mensaje: 'Categoria eliminada exitosamente' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'No se puede eliminar una categoria con productos asociados' });
    }

    console.error('Error al eliminar categoria:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
