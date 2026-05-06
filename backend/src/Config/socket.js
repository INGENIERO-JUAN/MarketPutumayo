const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const iniciarSocket = (server, pool) => {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost')) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por CORS'));
        }
      },
      methods: ['GET', 'POST'],
    },
  });

  // Middleware de autenticación para Socket.io
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
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
    const { id_usuario, nombre } = socket.usuario;
    console.log(`💬 Socket conectado: ${nombre} (${id_usuario})`);

    // Unirse a la sala de una conversación
    socket.on('unirse_conversacion', async (id_conversacion) => {
      try {
        // Verificar que el usuario pertenece a esa conversación
        const [conv] = await pool.query(
          'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
          [id_conversacion, id_usuario, id_usuario]
        );

        if (conv.length === 0) {
          socket.emit('error', { mensaje: 'No tienes acceso a esta conversación' });
          return;
        }

        socket.join(`conv_${id_conversacion}`);

        // Marcar mensajes como leídos al unirse
        await pool.query(
          'UPDATE mensajes_chat SET leido = TRUE WHERE id_conversacion = ? AND id_remitente != ?',
          [id_conversacion, id_usuario]
        );

      } catch (err) {
        console.error('❌ Error al unirse a conversación:', err);
      }
    });

    // Enviar mensaje
    socket.on('enviar_mensaje', async ({ id_conversacion, mensaje }) => {
      if (!mensaje?.trim()) return;

      try {
        // Verificar acceso
        const [conv] = await pool.query(
          'SELECT * FROM conversaciones WHERE id_conversacion = ? AND (id_comprador = ? OR id_productor = ?)',
          [id_conversacion, id_usuario, id_usuario]
        );

        if (conv.length === 0) return;

        // Insertar mensaje
        const [resultado] = await pool.query(
          'INSERT INTO mensajes_chat (id_conversacion, id_remitente, mensaje) VALUES (?, ?, ?)',
          [id_conversacion, id_usuario, mensaje.trim()]
        );

        const nuevoMensaje = {
          id_mensaje: resultado.insertId,
          id_conversacion,
          id_usuario,
          nombre,
          mensaje: mensaje.trim(),
          leido: false,
          enviado_en: new Date().toISOString(),
        };

        // Emitir a todos en la sala (incluyendo quien envió)
        io.to(`conv_${id_conversacion}`).emit('nuevo_mensaje', nuevoMensaje);

      } catch (err) {
        console.error('❌ Error al guardar mensaje:', err);
        socket.emit('error', { mensaje: 'No se pudo enviar el mensaje' });
      }
    });

    // Indicador "escribiendo..."
    socket.on('escribiendo', ({ id_conversacion }) => {
      socket.to(`conv_${id_conversacion}`).emit('usuario_escribiendo', { nombre, id_usuario });
    });

    socket.on('dejo_de_escribir', ({ id_conversacion }) => {
      socket.to(`conv_${id_conversacion}`).emit('usuario_dejo_escribir', { id_usuario });
    });

    socket.on('disconnect', () => {
      console.log(`💬 Socket desconectado: ${nombre} (${id_usuario})`);
    });
  });

  return io;
};

module.exports = { iniciarSocket };
