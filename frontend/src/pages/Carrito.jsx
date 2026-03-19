import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Carrito = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    if (!usuario) { navigate('/login'); return; }
    const data = JSON.parse(localStorage.getItem('carrito') || '[]');
    setCarrito(data);
  }, []);

  const actualizar = (id, cantidad) => {
    const nuevo = carrito.map(p => p.id_producto === id ? { ...p, cantidad: Math.max(1, cantidad) } : p);
    setCarrito(nuevo);
    localStorage.setItem('carrito', JSON.stringify(nuevo));
  };

  const eliminar = (id) => {
    const nuevo = carrito.filter(p => p.id_producto !== id);
    setCarrito(nuevo);
    localStorage.setItem('carrito', JSON.stringify(nuevo));
  };

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛒 Mi Carrito</h2>
      {carrito.length === 0 ? (
        <div style={styles.vacio}>
          <p>Tu carrito está vacío</p>
          <button style={styles.btn} onClick={() => navigate('/catalogo')}>Ver Catálogo</button>
        </div>
      ) : (
        <>
          {carrito.map(p => (
            <div key={p.id_producto} style={styles.item}>
              <div style={styles.info}>
                <h4 style={styles.nombre}>{p.nombre}</h4>
                <p style={styles.precio}>${p.precio.toLocaleString()} c/u</p>
              </div>
              <div style={styles.controles}>
                <button style={styles.btnNum} onClick={() => actualizar(p.id_producto, p.cantidad - 1)}>-</button>
                <span style={styles.cantidad}>{p.cantidad}</span>
                <button style={styles.btnNum} onClick={() => actualizar(p.id_producto, p.cantidad + 1)}>+</button>
                <button style={styles.btnEliminar} onClick={() => eliminar(p.id_producto)}>🗑️</button>
              </div>
              <p style={styles.subtotal}>${(p.precio * p.cantidad).toLocaleString()}</p>
            </div>
          ))}
          <div style={styles.totalBox}>
            <h3>Total: <span style={styles.totalValor}>${total.toLocaleString()}</span></h3>
            <button style={styles.btnComprar}>Proceder al pago</button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  title: { color: '#1a472a', marginBottom: '1.5rem' },
  vacio: { textAlign: 'center', padding: '3rem', color: '#666' },
  item: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1rem 1.5rem', borderRadius: '10px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  info: { flex: 1 },
  nombre: { margin: 0, color: '#1a472a' },
  precio: { margin: 0, color: '#999', fontSize: '0.9rem' },
  controles: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  btnNum: { background: '#e8f5e9', border: 'none', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  cantidad: { minWidth: '30px', textAlign: 'center', fontWeight: 'bold' },
  btnEliminar: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', marginLeft: '0.5rem' },
  subtotal: { fontWeight: 'bold', color: '#f4a226', minWidth: '80px', textAlign: 'right' },
  totalBox: { background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' },
  totalValor: { color: '#f4a226' },
  btn: { background: '#1a472a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' },
  btnComprar: { background: '#f4a226', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
};

export default Carrito;
