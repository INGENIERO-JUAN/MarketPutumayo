import { useEffect, useState } from 'react';
import API from '../api/axios';

const PedidosProductor = () => {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarPedidos(); }, []);

  const cargarPedidos = async () => {
    try { const { data } = await API.get('/pedidos/mis-ventas'); setPedidos(data); }
    catch (error) { console.error('Error al cargar ventas:', error); }
    finally { setCargando(false); }
  };

  const colorEstado = (estado) => ({ PENDIENTE: '#f4a226', PAGADO: '#1a472a', ENVIADO: '#3182ce', ENTREGADO: '#38a169', CANCELADO: '#e53e3e' }[estado] || '#666');

  if (cargando) return <div style={styles.loading}>Cargando ventas...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 Pedidos Recibidos</h2>
      <p style={styles.sub}>Pedidos que incluyen tus productos</p>
      {pedidos.length === 0 ? (
        <div style={styles.vacio}><span style={styles.vacioIcon}>📭</span><p>No tienes ventas aún</p></div>
      ) : (
        pedidos.map(p => (
          <div key={p.id_pedido} style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h4 style={styles.cardTitulo}>Pedido #{p.id_pedido}</h4>
                <p style={styles.cardMeta}>Comprador: <strong>{p.comprador}</strong></p>
                <p style={styles.cardMeta}>{new Date(p.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <span style={{ ...styles.badge, background: colorEstado(p.estado) + '22', color: colorEstado(p.estado) }}>{p.estado}</span>
            </div>
            <div style={styles.itemsBox}>
              {p.items.map((item, i) => (
                <div key={i} style={styles.item}>
                  <div style={styles.itemInfo}><span style={styles.itemNombre}>🌿 {item.producto}</span><span style={styles.itemCantidad}>{item.cantidad} unidades</span></div>
                  <span style={styles.itemPrecio}>${Number(item.precio_unitario * item.cantidad).toLocaleString()}</span>
                </div>
              ))}
            </div>
            {p.direccion_entrega && <p style={styles.direccion}>📍 {p.direccion_entrega}</p>}
          </div>
        ))
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '900px', margin: '0 auto' },
  title: { color: '#1a472a', marginBottom: '0.25rem' },
  sub: { color: '#999', fontSize: '0.9rem', marginBottom: '1.5rem' },
  vacio: { textAlign: 'center', padding: '4rem', color: '#999', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  vacioIcon: { fontSize: '3rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '1rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  cardTitulo: { margin: '0 0 0.3rem', color: '#1a472a', fontSize: '1rem' },
  cardMeta: { margin: '0.15rem 0', color: '#888', fontSize: '0.85rem' },
  badge: { padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block', whiteSpace: 'nowrap' },
  itemsBox: { borderTop: '1px solid #f0f0f0', paddingTop: '1rem' },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid #fafafa' },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  itemNombre: { color: '#333', fontSize: '0.9rem', fontWeight: '500' },
  itemCantidad: { color: '#999', fontSize: '0.8rem' },
  itemPrecio: { color: '#f4a226', fontWeight: 'bold', fontSize: '0.95rem' },
  direccion: { marginTop: '0.75rem', color: '#888', fontSize: '0.85rem' },
  loading: { textAlign: 'center', padding: '3rem', color: '#666' },
};
export default PedidosProductor;
