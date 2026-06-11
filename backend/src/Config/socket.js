const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const initSocket = (server, corsOptions) => {
  const io = new Server(server, {
    cors: corsOptions,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token requerido'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.usuario = decoded;
      next();
    } catch {
      next(new Error('Token invalido'));
    }
  });

  io.on('connection', (socket) => {
    const { id_usuario, nombre, rol } = socket.usuario;
    console.log(`Socket conectado: ${nombre} (${id_usuario})`);

    socket.on('unirse_conversacion', async (id_conversacion) => {
      try {
        const [conv] = await pool.query(
          'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
          [id_conversacion, id_usuario, id_usuario]
        );

        if (conv.length === 0) {
          socket.emit('error_chat', 'No tienes acceso a esta conversacion');
          return;
        }

        socket.join(`conv_${id_conversacion}`);
        socket.emit('unido_conversacion', id_conversacion);

        await pool.query(
          'UPDATE mensajes_chat SET leido = TRUE WHERE id_conversacion = ? AND id_remitente != ?',
          [id_conversacion, id_usuario]
        );
      } catch (error) {
        console.error('Error al unirse a conversacion:', error);
      }
    });

    socket.on('enviar_mensaje', async ({ id_conversacion, mensaje }) => {
      try {
        if (!mensaje?.trim()) return;

        const [conv] = await pool.query(
          'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
          [id_conversacion, id_usuario, id_usuario]
        );

        if (conv.length === 0) return;

        const [resultado] = await pool.query(
          'INSERT INTO mensajes_chat (id_conversacion, id_remitente, mensaje) VALUES (?, ?, ?)',
          [id_conversacion, id_usuario, mensaje.trim()]
        );

        const nuevoMensaje = {
          id_mensaje: resultado.insertId,
          id_conversacion,
          id_usuario,
          nombre,
          rol,
          mensaje: mensaje.trim(),
          leido: false,
          enviado_en: new Date().toISOString(),
        };

        io.to(`conv_${id_conversacion}`).emit('nuevo_mensaje', nuevoMensaje);
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        socket.emit('error_chat', 'No se pudo enviar el mensaje');
      }
    });

    socket.on('escribiendo', ({ id_conversacion }) => {
      socket.to(`conv_${id_conversacion}`).emit('usuario_escribiendo', {
        nombre,
        id_usuario,
      });
    });

    socket.on('dejo_de_escribir', ({ id_conversacion }) => {
      socket.to(`conv_${id_conversacion}`).emit('usuario_dejo_escribir', {
        id_usuario,
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${nombre} (${id_usuario})`);
    });
  });

  return io;
};

module.exports = initSocket;
