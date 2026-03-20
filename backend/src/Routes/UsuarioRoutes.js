const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/usuarios/perfil - Ver perfil propio
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, telefono, municipio, creado_en FROM usuarios WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/usuarios/perfil - Actualizar perfil propio
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nombre, telefono, municipio } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, telefono = ?, municipio = ? WHERE id_usuario = ?',
      [nombre, telefono || null, municipio || null, req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/usuarios - Listar todos los usuarios (solo ADMIN)
router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, telefono, municipio, activo, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    res.json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/usuarios/:id/estado - Activar o desactivar usuario (solo ADMIN)
router.put('/:id/estado', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo activo debe ser true o false' });
    }

    // No puede desactivarse a sí mismo
    if (req.usuario.id_usuario === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    const [resultado] = await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id_usuario = ?',
      [activo, req.params.id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente` });
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
