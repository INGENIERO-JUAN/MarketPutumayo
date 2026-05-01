const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('../Config/db');

const initSocket = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions
  });

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Token requerido'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.usuario = decoded;
      next();
    } catch (err) {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`💬 Usuario conectado al chat: ${socket.usuario.nombre}`);

    // Unirse a sala de conversación
    socket.on('unirse_conversacion', async (id_conversacion) => {
      try {
        // Verificar que el usuario pertenece a esa conversación
        const [conv] = await pool.query(
          'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
          [id_conversacion, socket.usuario.id_usuario, socket.usuario.id_usuario]
        );

        if (conv.length === 0) {
          socket.emit('error_chat', 'No tienes acceso a esta conversación');
          return;
        }

        socket.join(`conv_${id_conversacion}`);
        socket.emit('unido_conversacion', id_conversacion);
        console.log(`👥 ${socket.usuario.nombre} se unió a conv_${id_conversacion}`);
      } catch (error) {
        console.error('Error al unirse:', error);
      }
    });

    // Enviar mensaje
    socket.on('enviar_mensaje', async ({ id_conversacion, mensaje }) => {
      try {
        if (!mensaje || !mensaje.trim()) return;

        // Verificar acceso
        const [conv] = await pool.query(
          'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
          [id_conversacion, socket.usuario.id_usuario, socket.usuario.id_usuario]
        );

        if (conv.length === 0) return;

        // Guardar en BD
        const [resultado] = await pool.query(
          'INSERT INTO mensajes_chat (id_conversacion, id_remitente, mensaje) VALUES (?, ?, ?)',
          [id_conversacion, socket.usuario.id_usuario, mensaje.trim()]
        );

        const nuevoMensaje = {
          id_mensaje: resultado.insertId,
          id_conversacion,
          mensaje: mensaje.trim(),
          enviado_en: new Date(),
          leido: false,
          id_usuario: socket.usuario.id_usuario,
          nombre: socket.usuario.nombre,
          rol: socket.usuario.rol
        };

        // Emitir a todos en la sala
        io.to(`conv_${id_conversacion}`).emit('nuevo_mensaje', nuevoMensaje);
        console.log(`📨 Mensaje de ${socket.usuario.nombre} en conv_${id_conversacion}`);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
      }
    });

    // Indicador de escritura
    socket.on('escribiendo', ({ id_conversacion }) => {
      socket.to(`conv_${id_conversacion}`).emit('usuario_escribiendo', {
        nombre: socket.usuario.nombre,
        id_usuario: socket.usuario.id_usuario
      });
    });

    socket.on('dejo_de_escribir', ({ id_conversacion }) => {
      socket.to(`conv_${id_conversacion}`).emit('usuario_dejo_escribir', {
        id_usuario: socket.usuario.id_usuario
      });
    });

    socket.on('disconnect', () => {
      console.log(`👋 Usuario desconectado: ${socket.usuario.nombre}`);
    });
  });

  return io;
};

module.exports = initSocket;
