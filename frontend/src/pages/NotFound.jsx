import { useNavigate } from 'react-router-dom';
const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.container}><div style={styles.content}>
      <span style={styles.icon}>🌿</span>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>Página no encontrada</h2>
      <p style={styles.sub}>La ruta que buscas no existe en MarketPutumayo.</p>
      <button style={styles.btn} onClick={() => navigate('/catalogo')}>Volver al Catálogo</button>
    </div></div>
  );
};
const styles = {
  container: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--crema)' },
  content: { textAlign: 'center', padding: '2rem' },
  icon: { fontSize: '4rem', display: 'block', marginBottom: '1rem' },
  code: { fontFamily: "'Playfair Display', serif", fontSize: '6rem', color: 'var(--verde-oscuro)', lineHeight: 1, marginBottom: '0.5rem' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--negro-suave)', marginBottom: '0.75rem' },
  sub: { color: 'var(--gris-texto)', fontSize: '1rem', marginBottom: '2rem' },
  btn: { background: 'var(--verde-oscuro)', color: 'white', border: 'none', padding: '0.8rem 2rem', borderRadius: 'var(--radio-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
};
export default NotFound;
