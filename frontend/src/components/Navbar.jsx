import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>🌿 MarketPutumayo</Link>
      <div style={styles.links}>
        <Link to="/catalogo" style={styles.link}>Catálogo</Link>
        {usuario?.rol === 'COMPRADOR' && <Link to="/carrito" style={styles.link}>🛒 Carrito</Link>}
        {usuario?.rol === 'PRODUCTOR' && <Link to="/productor" style={styles.link}>📦 Mis Productos</Link>}
        {usuario?.rol === 'ADMIN' && <Link to="/admin" style={styles.link}>⚙️ Admin</Link>}
        {usuario ? (
          <>
            <span style={styles.user}>Hola, {usuario.nombre}</span>
            <button onClick={handleLogout} style={styles.btn}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Ingresar</Link>
            <Link to="/registro" style={styles.linkBtn}>Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1a472a', color: 'white' },
  logo: { color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' },
  links: { display: 'flex', alignItems: 'center', gap: '1.2rem' },
  link: { color: 'white', textDecoration: 'none' },
  linkBtn: { background: '#f4a226', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', textDecoration: 'none' },
  btn: { background: 'transparent', border: '1px solid white', color: 'white', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  user: { color: '#a8d5a2', fontSize: '0.9rem' },
};

export default Navbar;
