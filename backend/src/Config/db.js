const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err);
  } else {
    console.log('✅ Conectado a MySQL');
  }
});

// Hacer compatible con promesas
db.promise = () => {
  const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  return {
    query: (sql, values) => {
      return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results) => {
          if (error) return reject(error);
          resolve([results]);
        });
      });
    },
    end: () => {
      return new Promise((resolve) => {
        connection.end(() => resolve());
      });
    }
  };
};

module.exports = db;