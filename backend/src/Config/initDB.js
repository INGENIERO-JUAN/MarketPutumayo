const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../..', '.env') });

// Conexión inicial sin especificar database
const createPoolConnection = () => {
  return mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

const initializeDatabase = async () => {
  let connection;
  try {
    const pool = createPoolConnection();
    connection = await pool.getConnection();

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../../..', 'SQL', 'MARKETPUTUMAYOSQL.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Separar las queries por punto y coma
    const queries = sqlScript
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    console.log('📊 Inicializando base de datos...');

    // Ejecutar cada query con query() en lugar de execute()
    for (const query of queries) {
      try {
        await connection.query(query);
      } catch (err) {
        // Ignorar errores si la tabla ya existe
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }

    console.log('✅ Base de datos inicializada correctamente');
    connection.release();
    await pool.end();
    return true;

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error.message);
    if (connection) connection.release();
    return false;
  }
};

module.exports = { initializeDatabase };
