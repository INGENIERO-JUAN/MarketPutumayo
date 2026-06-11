const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const categoriasIniciales = [
  ['Café y Derivados', 'Café, bebidas y productos derivados del café regional'],
  ['Miel y Apicultura', 'Miel, propoleo y productos de apicultura'],
  ['Panela y Azúcar', 'Panela, endulzantes y derivados de caña'],
  ['Frutas Exóticas', 'Frutas frescas y transformadas del Putumayo'],
  ['Plantas Medicinales', 'Plantas, infusiones y productos naturales'],
  ['Artesanías', 'Artesanías y productos hechos a mano'],
  ['Lácteos', 'Leche, queso, yogur y otros lácteos'],
  ['Cacao y Chocolate', 'Cacao, chocolate y derivados'],
];

const columnaExiste = async (connection, tabla, columna) => {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS total
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tabla, columna]
  );

  return Number(rows[0].total) > 0;
};

const agregarColumnaSiFalta = async (connection, tabla, columna, definicion) => {
  if (!(await columnaExiste(connection, tabla, columna))) {
    await connection.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
  }
};

const migrarSchemaExistente = async (connection) => {
  await agregarColumnaSiFalta(connection, 'usuarios', 'latitud', 'DECIMAL(10,8) NULL');
  await agregarColumnaSiFalta(connection, 'usuarios', 'longitud', 'DECIMAL(11,8) NULL');
  await agregarColumnaSiFalta(connection, 'usuarios', 'actualizado_en', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await agregarColumnaSiFalta(connection, 'categorias', 'descripcion', 'TEXT NULL');
  await agregarColumnaSiFalta(connection, 'categorias', 'activo', 'BOOLEAN NOT NULL DEFAULT TRUE');

  await agregarColumnaSiFalta(connection, 'productos', 'actualizado_en', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await agregarColumnaSiFalta(connection, 'carritos', 'actualizado_en', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

  await agregarColumnaSiFalta(connection, 'pedidos', 'direccion_entrega', 'VARCHAR(255) NULL');
  await agregarColumnaSiFalta(connection, 'pedidos', 'notas', 'TEXT NULL');
  await agregarColumnaSiFalta(connection, 'pedidos', 'actualizado_en', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await connection.query(
    `ALTER TABLE pedidos
     MODIFY COLUMN estado ENUM('PENDIENTE','PAGADO','ENVIADO','ENTREGADO','CANCELADO')
     NOT NULL DEFAULT 'PENDIENTE'`
  );

  await agregarColumnaSiFalta(connection, 'detalle_pedido', 'subtotal', 'DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED');

  await agregarColumnaSiFalta(connection, 'pagos', 'monto', 'DECIMAL(10,2) NOT NULL DEFAULT 0');
  await agregarColumnaSiFalta(connection, 'pagos', 'proveedor', "VARCHAR(30) NOT NULL DEFAULT 'MANUAL'");
  await agregarColumnaSiFalta(connection, 'pagos', 'transaccion_id', 'VARCHAR(120) NULL');
  await agregarColumnaSiFalta(connection, 'pagos', 'checkout_url', 'VARCHAR(500) NULL');
  await agregarColumnaSiFalta(connection, 'pagos', 'actualizado_en', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
  await connection.query(
    `ALTER TABLE pagos
     MODIFY COLUMN metodo ENUM('EFECTIVO','TRANSFERENCIA','TARJETA','NEQUI','DAVIPLATA')
     NOT NULL`
  );

  await agregarColumnaSiFalta(connection, 'notificaciones', 'tipo', "ENUM('PEDIDO','PAGO','PRODUCTO','SISTEMA') NOT NULL DEFAULT 'SISTEMA'");
};

const crearDatosIniciales = async (connection) => {
  for (const [nombre, descripcion] of categoriasIniciales) {
    await connection.query(
      `INSERT INTO categorias (nombre, descripcion)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), activo = TRUE`,
      [nombre, descripcion]
    );
  }

  const adminCorreo = process.env.ADMIN_EMAIL || 'admin@marketputumayo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin12345';
  const adminNombre = process.env.ADMIN_NAME || 'Administrador';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await connection.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol, activo)
     VALUES (?, ?, ?, 'ADMIN', TRUE)
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), password_hash = VALUES(password_hash), rol = 'ADMIN', activo = TRUE`,
    [adminNombre, adminCorreo, passwordHash]
  );
};

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
    const sqlPath = path.join(__dirname, '../../../SQL', 'MARKETPUTUMAYOSQL.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Separar las queries por punto y coma
    const queries = sqlScript
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    console.log('📊 Inicializando base de datos...');

    for (const query of queries) {
      try {
        await connection.query(query);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }

    await migrarSchemaExistente(connection);
    await crearDatosIniciales(connection);

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
