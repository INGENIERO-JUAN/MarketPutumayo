const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../..', '.env') });
const mysql = require('mysql2/promise');

const categorias = [
  'Café y Derivados',
  'Miel y Apicultura',
  'Panela y Azúcar',
  'Frutas Exóticas',
  'Plantas Medicinales',
  'Artesanías',
  'Lácteos',
  'Cacao y Chocolate',
];

const sembrarCategorias = async () => {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('🌱 Sembrando categorías...');
    for (const nombre of categorias) {
      await connection.query(
        'INSERT IGNORE INTO categorias (nombre) VALUES (?)',
        [nombre]
      );
    }
    console.log('✅ Categorías sembradas exitosamente');
  } catch (error) {
    console.error('❌ Error sembrando categorías:', error.message);
  } finally {
    if (connection) await connection.end();
    process.exit(0);
  }
};

sembrarCategorias();
