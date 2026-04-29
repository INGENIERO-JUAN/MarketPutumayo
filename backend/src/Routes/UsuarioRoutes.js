const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');

// GET /api/usuarios/perfil - Ver perfil propio
router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id_usuario, nombre, correo, rol, telefono, municipio, latitud, longitud, creado_en FROM usuarios WHERE id_usuario = ?',
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
    const { nombre, telefono, municipio, latitud, longitud } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, telefono = ?, municipio = ?, latitud = ?, longitud = ? WHERE id_usuario = ?',
      [nombre, telefono || null, municipio || null, latitud || null, longitud || null, req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/usuarios/cambiar-password - Cambiar contraseña propia
router.put('/cambiar-password', verificarToken, async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (passwordNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Obtener contraseña actual del usuario
    const [usuarios] = await pool.query(
      'SELECT password_hash FROM usuarios WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuarios[0].password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);

    await pool.query(
      'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?',
      [hashedPassword, req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
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

// GET /api/usuarios/productores - Listar productores con ubicación (público)
router.get('/productores', async (req, res) => {
  try {
    const [productores] = await pool.query(
      `SELECT id_usuario, nombre, telefono, municipio, latitud, longitud 
       FROM usuarios 
       WHERE rol = 'PRODUCTOR' AND activo = TRUE AND latitud IS NOT NULL AND longitud IS NOT NULL
       ORDER BY nombre ASC`
    );
    res.json(productores);
  } catch (error) {
    console.error('Error al listar productores:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// PUT /api/usuarios/ubicacion - Actualizar ubicación del productor autenticado
router.put('/ubicacion', verificarToken, verificarRol('PRODUCTOR'), async (req, res) => {
  try {
    const { latitud, longitud } = req.body;

    if (latitud === undefined || longitud === undefined) {
      return res.status(400).json({ error: 'Latitud y longitud son requeridos' });
    }

    // Validar rangos válidos para coordenadas
    if (latitud < -90 || latitud > 90) {
      return res.status(400).json({ error: 'Latitud debe estar entre -90 y 90' });
    }
    if (longitud < -180 || longitud > 180) {
      return res.status(400).json({ error: 'Longitud debe estar entre -180 y 180' });
    }

    await pool.query(
      'UPDATE usuarios SET latitud = ?, longitud = ? WHERE id_usuario = ?',
      [latitud, longitud, req.usuario.id_usuario]
    );

    res.json({ mensaje: 'Ubicación actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
