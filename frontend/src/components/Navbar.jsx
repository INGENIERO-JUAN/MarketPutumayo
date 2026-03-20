import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <span style={styles.logoIcon}>🌿</span>
        <span style={styles.logoText}>Market<span style={styles.logoAccent}>Putumayo</span></span>
      </Link>
      <div style={styles.links}>
        <Link to="/catalogo" style={styles.link}>Catálogo</Link>
        {usuario?.rol === 'COMPRADOR' && (<><Link to="/carrito" style={styles.link}>🛒 Carrito</Link><Link to="/mis-pedidos" style={styles.link}>📋 Mis Pedidos</Link></>)}
        {usuario?.rol === 'PRODUCTOR' && (<><Link to="/productor" style={styles.link}>📦 Mis Productos</Link><Link to="/productor/pedidos" style={styles.link}>📬 Ventas</Link></>)}
        {usuario?.rol === 'ADMIN' && <Link to="/admin" style={styles.link}>⚙️ Admin</Link>}
        {usuario ? (
          <div style={styles.userBox}>
            <Link to="/perfil" style={styles.userChip}><span style={styles.userDot}></span>{usuario.nombre}</Link>
            <button onClick={handleLogout} style={styles.btnSalir}>Salir</button>
          </div>
        ) : (
          <div style={styles.authBox}>
            <Link to="/login" style={styles.btnLogin}>Ingresar</Link>
            <Link to="/registro" style={styles.btnRegistro}>Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2.5rem', height: '68px', background: 'var(--verde-oscuro)', boxShadow: '0 2px 20px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' },
  logoIcon: { fontSize: '1.5rem' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' },
  logoAccent: { color: 'var(--dorado)' },
  links: { display: 'flex', alignItems: 'center', gap: '1.5rem' },
  link: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' },
  userBox: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' },
  userChip: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', textDecoration: 'none' },
  userDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--verde-claro)', display: 'inline-block' },
  btnSalir: { background: 'transparent', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', padding: '0.35rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' },
  authBox: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '0.5rem' },
  btnLogin: { color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' },
  btnRegistro: { background: 'var(--dorado)', color: 'white', padding: '0.45rem 1.1rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' },
};
export default Navbar;
