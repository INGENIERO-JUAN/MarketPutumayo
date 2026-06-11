const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { initializeDatabase } = require('./Config/initDB');
const initSocket = require('./Config/socket');
const pool = require('./Config/db');
const authRoutes = require('./Routes/AuthRoutes');
const testRoutes = require('./Routes/TestRoutes');
const productoRoutes = require('./Routes/ProductoRoutes');
const pedidoRoutes = require('./Routes/PedidoRoutes');
const categoriaRoutes = require('./Routes/CategoriaRoutes');
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const pagoRoutes = require('./Routes/PagoRoutes');
const estadisticasRoutes = require('./Routes/EstadisticasRoutes');
const chatRoutes = require('./Routes/ChatRoutes');
const resenasRoutes = require('./Routes/ResenasRoutes');
const notificacionRoutes = require('./Routes/NotificacionRoutes');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1')
    ) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.locals.pool = pool;

app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/notificaciones', notificacionRoutes);

app.get('/', (req, res) => {
  res.send('Backend MarketPutumayo funcionando');
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

initSocket(server, corsOptions);

const PORT = process.env.PORT || 4000;

(async () => {
  const dbInitialized = await initializeDatabase();

  if (dbInitialized) {
    server.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Socket.io listo para chat en tiempo real`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`El puerto ${PORT} ya esta en uso. Deten el proceso actual o cambia PORT en .env.`);
        process.exit(1);
      }

      throw error;
    });
  } else {
    console.error('No se pudo iniciar el servidor. Verifica la conexion a MySQL.');
    process.exit(1);
  }
})();
