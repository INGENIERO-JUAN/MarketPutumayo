const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../Config/db');

// REGISTRO
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, password, rol, telefono, municipio } = req.body;

    // Validar datos requeridos
    if (!nombre || !correo || !password || !rol) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Validar formato de correo
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
      return res.status(400).json({ error: 'Formato de correo inválido' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Solo PRODUCTOR y COMPRADOR pueden registrarse públicamente
    const rolesValidos = ['PRODUCTOR', 'COMPRADOR'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido. Solo puedes registrarte como PRODUCTOR o COMPRADOR' });
    }

    // Verificar si el correo ya existe
    const [usuarioExistente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, password_hash, rol, telefono, municipio) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, correo, hashedPassword, rol, telefono || null, municipio || null]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      id_usuario: resultado.insertId
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Validar datos
    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña requeridos' });
    }

    // Buscar usuario
    const [usuarios] = await pool.query(
      'SELECT id_usuario, nombre, correo, password_hash, rol, activo FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token (1 día de duración)
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
