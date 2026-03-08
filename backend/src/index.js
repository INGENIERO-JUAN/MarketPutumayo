const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initializeDatabase } = require('./Config/initDB');
const authRoutes = require('./Routes/AuthRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Backend MarketPutumayo funcionando ✅');
});

const PORT = process.env.PORT || 4000;

// Inicializar base de datos antes de escuchar
(async () => {
  const dbInitialized = await initializeDatabase();
  
  if (dbInitialized) {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`📌 Endpoints de autenticación:`);
      console.log(`   POST /api/auth/registro - Registrar usuario`);
      console.log(`   POST /api/auth/login - Iniciar sesión`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor. Verifica la conexión a MySQL.');
    process.exit(1);
  }
})();