const pool = require('../Config/db');

const categorias = [
  { nombre: 'Café y Derivados', descripcion: 'Café especial, tostado, molido y en grano del Putumayo' },
  { nombre: 'Miel y Apicultura', descripcion: 'Miel pura, propóleo y productos de colmena' },
  { nombre: 'Panela y Azúcar', descripcion: 'Panela orgánica, miel de caña y derivados' },
  { nombre: 'Frutas Exóticas', descripcion: 'Frutas tropicales y exóticas de la región amazónica' },
  { nombre: 'Plantas Medicinales', descripcion: 'Hierbas, plantas medicinales y aromáticas' },
  { nombre: 'Artesanías', descripcion: 'Artesanías tradicionales y productos culturales del Putumayo' },
  { nombre: 'Lácteos', descripcion: 'Quesos, cuajadas y productos lácteos artesanales' },
  { nombre: 'Cacao y Chocolate', descripcion: 'Cacao fino de aroma y chocolates artesanales' },
];

const sembrarCategorias = async () => {
  try {
    console.log('🌱 Sembrando categorías...');
    for (const cat of categorias) {
      await pool.query(
        'INSERT IGNORE INTO categorias (nombre, descripcion) VALUES (?, ?)',
        [cat.nombre, cat.descripcion]
      );
    }
    console.log('✅ Categorías sembradas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sembrando categorías:', error.message);
    process.exit(1);
  }
};

sembrarCategorias();
