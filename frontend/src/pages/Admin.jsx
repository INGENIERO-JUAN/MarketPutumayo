import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario || usuario.rol !== 'ADMIN') navigate('/catalogo');
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ Panel de Administración</h2>
      <p style={styles.sub}>Bienvenido, {usuario?.nombre}</p>
      <div style={styles.grid}>
        <div style={styles.card}>
          <span style={styles.icon}>👥</span>
          <h3>Usuarios</h3>
          <p>Gestionar usuarios registrados</p>
        </div>
        <div style={styles.card}>
          <span style={styles.icon}>📦</span>
          <h3>Productos</h3>
          <p>Aprobar o rechazar productos</p>
        </div>
        <div style={styles.card}>
          <span style={styles.icon}>📋</span>
          <h3>Pedidos</h3>
          <p>Ver todos los pedidos</p>
        </div>
        <div style={styles.card}>
          <span style={styles.icon}>💳</span>
          <h3>Pagos</h3>
          <p>Gestionar pagos pendientes</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  title: { color: '#1a472a' },
  sub: { color: '#666', marginBottom: '2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
  icon: { fontSize: '2.5rem' },
};

export default Admin;
