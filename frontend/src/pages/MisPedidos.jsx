import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const MisPedidos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarPedidos(); }, []);

  const cargarPedidos = async () => {
    try {
      const { data } = await API.get('/pedidos/mis-pedidos');
      const agrupados = data.reduce((acc, item) => {
        if (!acc[item.id_pedido]) acc[item.id_pedido] = { id_pedido: item.id_pedido, total: item.total, estado: item.estado, fecha: item.fecha, items: [] };
        acc[item.id_pedido].items.push({ producto: item.producto, cantidad: item.cantidad, precio_unitario: item.precio_unitario });
        return acc;
      }, {});
      setPedidos(Object.values(agrupados));
    } catch (error) { console.error('Error al cargar pedidos:', error); }
    finally { setCargando(false); }
  };

  const colorEstado = (estado) => ({ PENDIENTE: '#f4a226', PAGADO: '#1a472a', ENVIADO: '#3182ce', ENTREGADO: '#38a169', CANCELADO: '#e53e3e' }[estado] || '#666');

  if (cargando) return <div style={styles.loading}>Cargando pedidos...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📋 Mis Pedidos</h2>
      {pedidos.length === 0 ? (
        <div style={styles.vacio}><p>No tienes pedidos aún</p><button style={styles.btn} onClick={() => navigate('/catalogo')}>Ver Catálogo</button></div>
      ) : (
        pedidos.map(p => (
          <div key={p.id_pedido} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h4 style={styles.cardTitulo}>Pedido #{p.id_pedido}</h4>
                <p style={styles.cardFecha}>{new Date(p.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div style={styles.cardDerecha}>
                <span style={{ ...styles.badge, background: colorEstado(p.estado) + '22', color: colorEstado(p.estado) }}>{p.estado}</span>
                <p style={styles.total}>${Number(p.total).toLocaleString()}</p>
              </div>
            </div>
            <div style={styles.items}>
              {p.items.map((item, i) => (
                <div key={i} style={styles.item}>
                  <span>🌿 {item.producto}</span>
                  <span style={styles.itemDetalle}>{item.cantidad} x ${Number(item.precio_unitario).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  title: { color: '#1a472a', marginBottom: '1.5rem' },
  vacio: { textAlign: 'center', padding: '3rem', color: '#666' },
  btn: { background: '#1a472a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', marginTop: '1rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  cardTitulo: { margin: 0, color: '#1a472a' }, cardFecha: { margin: '0.3rem 0 0', color: '#999', fontSize: '0.85rem' },
  cardDerecha: { textAlign: 'right' },
  badge: { padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block' },
  total: { margin: '0.5rem 0 0', fontWeight: 'bold', color: '#f4a226', fontSize: '1.1rem' },
  items: { borderTop: '1px solid #f0f0f0', paddingTop: '1rem' },
  item: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#555', fontSize: '0.9rem' },
  itemDetalle: { color: '#999' },
  loading: { textAlign: 'center', padding: '3rem', color: '#666' },
};

export default MisPedidos;
