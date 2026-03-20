import { useEffect, useState } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Catalogo = () => {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const { data } = await API.get('/productos');
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

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

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (cargando) return <div style={styles.loading}>Cargando productos...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛍️ Catálogo de Productos</h2>

      <input
        style={styles.buscador}
        type="text"
        placeholder="🔍 Buscar productos..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {mensaje && <div style={styles.mensaje}>{mensaje}</div>}

      {productosFiltrados.length === 0 ? (
        <div style={styles.vacio}>No se encontraron productos</div>
      ) : (
        <div style={styles.grid}>
          {productosFiltrados.map(p => (
            <div key={p.id_producto} style={styles.card}>
              <div style={styles.imgPlaceholder}>🌿</div>
              <span style={styles.categoria}>{p.categoria}</span>
              <h3 style={styles.nombre}>{p.nombre}</h3>
              <p style={styles.desc}>{p.descripcion}</p>
              <p style={styles.precio}>${Number(p.precio).toLocaleString()}</p>
              <p style={styles.stock}>Stock: {p.stock} unidades</p>
              <p style={styles.productor}>Productor: {p.productor}</p>
              {usuario ? (
                p.stock > 0 ? (
                  <button style={styles.btn} onClick={() => agregarAlCarrito(p)}>
                    🛒 Agregar al carrito
                  </button>
                ) : (
                  <p style={styles.agotado}>❌ Agotado</p>
                )
              ) : (
                <p style={styles.aviso}>Inicia sesión para comprar</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  title: { color: '#1a472a', marginBottom: '1rem' },
  buscador: { width: '100%', padding: '0.75rem', marginBottom: '1.5rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  imgPlaceholder: { fontSize: '3rem', textAlign: 'center', background: '#f0f4f0', borderRadius: '8px', padding: '1rem' },
  categoria: { background: '#e8f5e9', color: '#1a472a', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', alignSelf: 'flex-start' },
  nombre: { color: '#1a472a', margin: 0 },
  desc: { color: '#666', fontSize: '0.9rem', margin: 0 },
  precio: { color: '#f4a226', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 },
  stock: { color: '#999', fontSize: '0.85rem', margin: 0 },
  productor: { color: '#888', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' },
  btn: { background: '#1a472a', color: 'white', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', marginTop: '0.5rem' },
  aviso: { color: '#999', fontSize: '0.85rem', textAlign: 'center' },
  agotado: { color: '#e53e3e', fontSize: '0.85rem', textAlign: 'center' },
  loading: { textAlign: 'center', padding: '3rem', color: '#666' },
  vacio: { textAlign: 'center', padding: '3rem', color: '#999' },
  mensaje: { background: '#efe', color: '#1a472a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' },
};

export default Catalogo;
