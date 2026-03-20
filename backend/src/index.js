const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeDatabase } = require('./Config/initDB');
const authRoutes = require('./Routes/AuthRoutes');
const testRoutes = require('./Routes/TestRoutes');

const app = express();

// CORS restringido (agrega los dominios de tu frontend aquí)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
  res.send('Backend MarketPutumayo funcionando ✅');
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;

// Inicializar base de datos antes de escuchar
(async () => {
  const dbInitialized = await initializeDatabase();

  if (dbInitialized) {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📌 Endpoints disponibles:`);
      console.log(`   POST /api/auth/registro - Registrar usuario`);
      console.log(`   POST /api/auth/login    - Iniciar sesión`);
      console.log(`   GET  /api/test/ping     - Test de conexión`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor. Verifica la conexión a MySQL.');
    process.exit(1);
  }
})();
