import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Catalogo = () => {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Por ahora mostramos productos de prueba hasta que exista el endpoint
    setProductos([
      { id_producto: 1, nombre: 'Café Especial', descripcion: 'Café de altura del Putumayo', precio: 25000, stock: 50, id_categoria: 1 },
      { id_producto: 2, nombre: 'Miel de Abejas', descripcion: 'Miel pura artesanal', precio: 18000, stock: 30, id_categoria: 2 },
      { id_producto: 3, nombre: 'Panela Orgánica', descripcion: 'Panela sin químicos', precio: 8000, stock: 100, id_categoria: 3 },
    ]);
    setCargando(false);
  }, []);

  const agregarAlCarrito = (producto) => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const existe = carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    setMensaje(`✅ "${producto.nombre}" agregado al carrito`);
    setTimeout(() => setMensaje(''), 2000);
  };

  if (cargando) return <div style={styles.loading}>Cargando productos...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛍️ Catálogo de Productos</h2>
      {mensaje && <div style={styles.mensaje}>{mensaje}</div>}
      <div style={styles.grid}>
        {productos.map(p => (
          <div key={p.id_producto} style={styles.card}>
            <div style={styles.imgPlaceholder}>🌿</div>
            <h3 style={styles.nombre}>{p.nombre}</h3>
            <p style={styles.desc}>{p.descripcion}</p>
            <p style={styles.precio}>${p.precio.toLocaleString()}</p>
            <p style={styles.stock}>Stock: {p.stock} unidades</p>
            {usuario ? (
              <button style={styles.btn} onClick={() => agregarAlCarrito(p)}>
                🛒 Agregar al carrito
              </button>
            ) : (
              <p style={styles.aviso}>Inicia sesión para comprar</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#1a472a', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  imgPlaceholder: { fontSize: '3rem', textAlign: 'center', background: '#f0f4f0', borderRadius: '8px', padding: '1rem' },
  nombre: { color: '#1a472a', margin: 0 },
  desc: { color: '#666', fontSize: '0.9rem', margin: 0 },
  precio: { color: '#f4a226', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 },
  stock: { color: '#999', fontSize: '0.85rem', margin: 0 },
  btn: { background: '#1a472a', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' },
  aviso: { color: '#999', fontSize: '0.85rem', textAlign: 'center' },
  loading: { textAlign: 'center', padding: '3rem', color: '#666' },
  mensaje: { background: '#efe', color: '#1a472a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' },
};

export default Catalogo;
