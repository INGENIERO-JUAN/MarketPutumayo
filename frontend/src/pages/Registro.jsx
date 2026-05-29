import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import ModalMapa from '../components/ModalMapa';

const Registro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'COMPRADOR', telefono: '', municipio: '', latitud: null, longitud: null });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = (location) => {
    setForm({ 
      ...form, 
      latitud: location.lat, 
      longitud: location.lng,
      municipio: location.municipio || form.municipio 
    });
  };

  const obtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setInitialLocation(currentPos);
          setMostrarMapa(true);
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          setError('No se pudo obtener tu ubicación. Verifica permisos de geolocalización.');
        }
      );
    } else {
      setError('Geolocalización no soportada en este navegador.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await API.post('/auth/registro', form);
      setExito('¡Registro exitoso! Redirigiendo...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link to="/" style={styles.logoLink}>
            <span>🌿</span>
            <span style={styles.logoText}>MarketPutumayo</span>
          </Link>
          <h2 style={styles.title}>Crear cuenta</h2>
          <p style={styles.subtitle}>Únete a la comunidad del Putumayo</p>
        </div>

        {error && <div style={styles.error}>⚠️ {error}</div>}
        {exito && <div style={styles.exito}>✅ {exito}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Nombre completo</label>
              <input style={styles.input} type="text" name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Municipio</label>
              <div style={styles.municipioContainer}>
                <input style={styles.inputMunicipio} type="text" name="municipio" placeholder="Mocoa, Sibundoy..." value={form.municipio} onChange={handleChange} />
                <button type="button" style={styles.btnUbicacionPeque} onClick={obtenerUbicacionActual} title="Obtener ubicación actual">
                  📍
                </button>
              </div>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input style={styles.input} type="email" name="correo" placeholder="tu@correo.com" value={form.correo} onChange={handleChange} required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.passwordBox}>
              <input
                style={styles.inputPassword}
                type={verPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" style={styles.ojito} onClick={() => setVerPassword(!verPassword)}>
                {verPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Tipo de cuenta</label>
              <select style={styles.input} name="rol" value={form.rol} onChange={handleChange}>
                <option value="COMPRADOR">🛒 Comprador</option>
                <option value="PRODUCTOR">🌱 Productor</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Teléfono</label>
              <input style={styles.input} type="text" name="telefono" placeholder="3XX XXX XXXX" value={form.telefono} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Ubicación en el mapa</label>
            <button type="button" style={styles.btnUbicacion} onClick={() => setMostrarMapa(true)}>
              📍 {form.latitud && form.longitud ? 'Ubicación seleccionada' : 'Seleccionar ubicación'}
            </button>
            {form.latitud && form.longitud && (
              <p style={styles.coordsText}>Lat: {form.latitud.toFixed(4)}, Lng: {form.longitud.toFixed(4)}</p>
            )}
          </div>

          <div style={styles.rolInfo}>
            {form.rol === 'COMPRADOR' ? (
              <p style={styles.rolTexto}>🛒 Como <strong>Comprador</strong> puedes explorar el catálogo y hacer pedidos.</p>
            ) : (
              <p style={styles.rolTexto}>🌱 Como <strong>Productor</strong> puedes publicar tus productos para vender.</p>
            )}
          </div>

          <button style={styles.btn} type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Crear cuenta →'}
          </button>
        </form>

        <p style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={styles.footerLink}>Inicia sesión</Link>
        </p>
      </div>

      <ModalMapa
        isOpen={mostrarMapa}
        onClose={() => { setMostrarMapa(false); setInitialLocation(null); }}
        onSelectLocation={handleLocationSelect}
        initialLocation={initialLocation}
        titulo="Selecciona tu ubicación"
      />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, var(--verde-suave) 0%, var(--crema) 100%)',
    padding: '2rem',
  },
  card: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: 'var(--radio-lg)',
    boxShadow: 'var(--sombra-lg)',
    width: '100%',
    maxWidth: '520px',
  },
  header: {
    marginBottom: '1.8rem',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    textDecoration: 'none',
    marginBottom: '1.2rem',
    fontSize: '1rem',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: '700',
    color: 'var(--verde-oscuro)',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.7rem',
    color: 'var(--verde-oscuro)',
    marginBottom: '0.3rem',
  },
  subtitle: {
    color: 'var(--gris-texto)',
    fontSize: '0.9rem',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radio-sm)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid #fecaca',
  },
  exito: {
    background: '#f0fdf4',
    color: 'var(--verde-oscuro)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radio-sm)',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid #bbf7d0',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--verde-oscuro)',
    marginBottom: '0.35rem',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  passwordBox: {
    position: 'relative',
  },
  inputPassword: {
    width: '100%',
    padding: '0.75rem 1rem',
    paddingRight: '3rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    background: 'white',
    outline: 'none',
  },
  ojito: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  rolInfo: {
    background: 'var(--verde-suave)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radio-sm)',
    marginBottom: '1.2rem',
  },
  rolTexto: {
    fontSize: '0.85rem',
    color: 'var(--verde-oscuro)',
  },
  btnUbicacion: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#f0fdf4',
    color: 'var(--verde-oscuro)',
    border: '2px dashed #86efac',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  coordsText: {
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--verde-oscuro)',
    fontWeight: '500',
  },
  municipioContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  inputMunicipio: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    background: 'white',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btnUbicacionPeque: {
    padding: '0.75rem',
    background: '#f0fdf4',
    color: 'var(--verde-oscuro)',
    border: '1px solid #86efac',
    borderRadius: 'var(--radio-sm)',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s',
  },
  btn: {
    width: '100%',
    padding: '0.9rem',
    background: 'var(--verde-oscuro)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radio-sm)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(26,71,42,0.25)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.2rem',
    color: 'var(--gris-texto)',
    fontSize: '0.9rem',
  },
  footerLink: {
    color: 'var(--verde-oscuro)',
    fontWeight: '600',
  },
};

export default Registro;
