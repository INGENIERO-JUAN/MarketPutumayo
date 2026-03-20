const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeDatabase } = require('./Config/initDB');
const authRoutes = require('./Routes/AuthRoutes');
const testRoutes = require('./Routes/TestRoutes');
const productoRoutes = require('./Routes/ProductoRoutes');
const pedidoRoutes = require('./Routes/PedidoRoutes');
const categoriaRoutes = require('./Routes/CategoriaRoutes');
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const pagoRoutes = require('./Routes/PagoRoutes');

const app = express();

// CORS - acepta cualquier puerto localhost en desarrollo
const corsOptions = {
  origin: (origin, callback) => {
    // Permite peticiones sin origin (Postman, etc) o cualquier localhost
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

app.get('/', (req, res) => {
  res.send('Backend MarketPutumayo funcionando ✅');
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

(async () => {
  const dbInitialized = await initializeDatabase();

  if (dbInitialized) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor. Verifica la conexión a MySQL.');
    process.exit(1);
  }
})();
