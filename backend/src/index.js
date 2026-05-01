const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const { initializeDatabase } = require('./Config/initDB');
const initSocket = require('./Config/socket');
const authRoutes = require('./Routes/AuthRoutes');
const testRoutes = require('./Routes/TestRoutes');
const productoRoutes = require('./Routes/ProductoRoutes');
const pedidoRoutes = require('./Routes/PedidoRoutes');
const categoriaRoutes = require('./Routes/CategoriaRoutes');
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const pagoRoutes = require('./Routes/PagoRoutes');
const estadisticasRoutes = require('./Routes/EstadisticasRoutes');
const chatRoutes = require('./Routes/ChatRoutes');

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

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('Backend MarketPutumayo funcionando ✅');
});

app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar Socket.io
initSocket(server, corsOptions);

const PORT = process.env.PORT || 4000;

(async () => {
  const dbInitialized = await initializeDatabase();
  if (dbInitialized) {
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`💬 Socket.io listo para chat en tiempo real`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor. Verifica la conexión a MySQL.');
    process.exit(1);
  }
})();
