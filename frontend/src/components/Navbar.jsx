import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => isActive ? styles.linkActivo : styles.link;

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        <span style={styles.logoIcon}>🌿</span>
        <span style={styles.logoText}>Market<span style={styles.logoAccent}>Putumayo</span></span>
      </Link>

      <div style={styles.links}>
        <NavLink to="/catalogo" style={linkStyle}>Catálogo</NavLink>
        <NavLink to="/mapa-productores" style={linkStyle}>Mapa</NavLink>

        {usuario?.rol === 'COMPRADOR' && (
          <>
            <NavLink to="/carrito" style={linkStyle}>Carrito</NavLink>
            <NavLink to="/mis-pedidos" style={linkStyle}>Mis Pedidos</NavLink>
            <NavLink to="/conversaciones" style={linkStyle}>Mensajes</NavLink>
          </>
        )}

        {usuario?.rol === 'PRODUCTOR' && (
          <>
            <NavLink to="/productor" style={linkStyle}>Mis Productos</NavLink>
            <NavLink to="/productor/ventas" style={linkStyle}>Ventas</NavLink>
            <NavLink to="/conversaciones" style={linkStyle}>Mensajes</NavLink>
          </>
        )}

        {usuario?.rol === 'ADMIN' && (
          <>
            <NavLink to="/admin" style={linkStyle}>Admin</NavLink>
            <NavLink to="/admin/dashboard" style={linkStyle}>Dashboard</NavLink>
          </>
        )}

        {usuario ? (
          <div style={styles.userBox}>
            <Link to="/perfil" style={styles.userChip}>
              <span style={styles.userDot}></span>
              {usuario.nombre}
            </Link>
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
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 2.5rem', minHeight: '72px', background: 'rgba(26, 71, 42, 0.96)', boxShadow: '0 14px 34px rgba(13, 45, 24, 0.18)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.12)', gap: '1.25rem' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none', flexShrink: 0 },
  logoIcon: { fontSize: '1.45rem', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.2))' },
  logoText: { fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: '700', color: 'white', letterSpacing: 0 },
  logoAccent: { color: 'var(--dorado)' },
  links: { display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' },
  link: { color: 'rgba(255,255,255,0.82)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', padding: '0.45rem 0.75rem', borderRadius: '999px' },
  linkActivo: { color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', padding: '0.45rem 0.75rem', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' },
  userBox: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.45rem' },
  userChip: { display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.42rem 0.85rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userDot: { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--verde-claro)', display: 'inline-block', flexShrink: 0 },
  btnSalir: { background: 'transparent', border: '1.5px solid rgba(255,255,255,0.34)', color: 'white', padding: '0.42rem 0.95rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  authBox: { display: 'flex', alignItems: 'center', gap: '0.65rem', marginLeft: '0.45rem' },
  btnLogin: { color: 'rgba(255,255,255,0.86)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', padding: '0.45rem 0.75rem' },
  btnRegistro: { background: 'var(--dorado)', color: 'white', padding: '0.5rem 1rem', borderRadius: '999px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '700', boxShadow: '0 8px 18px rgba(244,162,38,0.22)' },
};

export default Navbar;
