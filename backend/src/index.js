const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();
const { initializeDatabase } = require('./Config/initDB');
const { iniciarSocket } = require('./Config/socket');
const pool = require('./Config/db');
const authRoutes = require('./Routes/AuthRoutes');
const testRoutes = require('./Routes/TestRoutes');
const productoRoutes = require('./Routes/ProductoRoutes');
const pedidoRoutes = require('./Routes/PedidoRoutes');
const categoriaRoutes = require('./Routes/CategoriaRoutes');
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const pagoRoutes = require('./Routes/PagoRoutes');
const chatRoutes = require('./Routes/ChatRoutes');
const resenasRoutes = require('./Routes/ResenasRoutes');

let estadisticasRoutes;
try {
  estadisticasRoutes = require('./Routes/EstadisticasRoutes');
} catch (e) { estadisticasRoutes = null; }

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Pasar pool a todas las rutas
app.locals.pool = pool;

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resenas', resenasRoutes);
if (estadisticasRoutes) app.use('/api/estadisticas', estadisticasRoutes);

app.get('/', (req, res) => {
  res.send('Backend MarketPutumayo funcionando ✅');
});

app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  const dbOk = await initializeDatabase();

  if (dbOk) {
    // Iniciar Socket.io con el servidor HTTP
    iniciarSocket(server, pool);

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`💬 Socket.io activo en puerto ${PORT}`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor. Verifica la conexión a MySQL.');
    process.exit(1);
  }
})();
