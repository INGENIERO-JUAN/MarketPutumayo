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

// CORS - fallback a puerto 5173 (Vite dev server)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
      console.log(`📌 Endpoints disponibles:`);
      console.log(`   POST /api/auth/registro            - Registrar usuario`);
      console.log(`   POST /api/auth/login               - Iniciar sesión`);
      console.log(`   GET  /api/test/ping                - Test de conexión`);
      console.log(`   GET  /api/productos                - Listar productos`);
      console.log(`   POST /api/productos                - Crear producto`);
      console.log(`   PUT  /api/productos/:id/estado     - Aprobar/rechazar producto`);
      console.log(`   PUT  /api/productos/:id            - Editar producto`);
      console.log(`   DELETE /api/productos/:id          - Eliminar producto`);
      console.log(`   POST /api/pedidos                  - Crear pedido`);
      console.log(`   GET  /api/pedidos/mis-pedidos      - Mis pedidos`);
      console.log(`   GET  /api/pedidos                  - Todos los pedidos (ADMIN)`);
      console.log(`   GET  /api/categorias               - Listar categorías`);
      console.log(`   POST /api/categorias               - Crear categoría (ADMIN)`);
      console.log(`   GET  /api/usuarios                 - Listar usuarios (ADMIN)`);
      console.log(`   GET  /api/usuarios/perfil          - Ver perfil propio`);
      console.log(`   PUT  /api/usuarios/perfil          - Actualizar perfil`);
      console.log(`   POST /api/pagos                    - Registrar pago`);
      console.log(`   GET  /api/pagos/:id_pedido         - Ver pago de pedido`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor. Verifica la conexión a MySQL.');
    process.exit(1);
  }
})();
