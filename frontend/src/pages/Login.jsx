import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.token, data.usuario);
      navigate('/catalogo');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <div style={styles.badge}>🌿 Productos del Putumayo</div>
          <h1 style={styles.heroTitle}>El mercado<br />de tu región</h1>
          <p style={styles.heroSub}>Conectamos productores locales con compradores en todo el departamento.</p>
          <div style={styles.features}>
            <div style={styles.feature}><span>✓</span> Productos 100% locales</div>
            <div style={styles.feature}><span>✓</span> Directamente del productor</div>
            <div style={styles.feature}><span>✓</span> Pago con Nequi y Daviplata</div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.title}>Bienvenido de vuelta</h2>
          <p style={styles.subtitle}>Inicia sesión en tu cuenta</p>

          {error && (
            <div style={styles.error}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Correo electrónico</label>
              <input
                style={styles.input}
                type="email"
                name="correo"
                placeholder="tu@correo.com"
                value={form.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <div style={styles.passwordBox}>
                <input
                  style={styles.inputPassword}
                  type={verPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  style={styles.ojito}
                  onClick={() => setVerPassword(!verPassword)}
                >
                  {verPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button style={styles.btn} type="submit" disabled={cargando}>
              {cargando ? (
                <span>Ingresando...</span>
              ) : (
                <span>Ingresar →</span>
              )}
            </button>
          </form>

          <p style={styles.footer}>
            ¿No tienes cuenta?{' '}
            <Link to="/registro" style={styles.footerLink}>Regístrate gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a472a 0%, #2d6a4f 60%, #52b788 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '420px',
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
    backdropFilter: 'blur(10px)',
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '3rem',
    fontWeight: '700',
    color: 'white',
    lineHeight: '1.1',
    marginBottom: '1rem',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '1.05rem',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  feature: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    background: 'var(--crema)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.8rem',
    color: 'var(--verde-oscuro)',
    marginBottom: '0.3rem',
  },
  subtitle: {
    color: 'var(--gris-texto)',
    marginBottom: '2rem',
    fontSize: '0.95rem',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radio-sm)',
    marginBottom: '1.2rem',
    fontSize: '0.9rem',
    border: '1px solid #fecaca',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  field: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--verde-oscuro)',
    marginBottom: '0.4rem',
    letterSpacing: '0.3px',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.95rem',
    background: 'white',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  passwordBox: {
    position: 'relative',
  },
  inputPassword: {
    width: '100%',
    padding: '0.8rem 1rem',
    paddingRight: '3rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.95rem',
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
    padding: '0.2rem',
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
    marginTop: '0.5rem',
    boxShadow: '0 4px 15px rgba(26,71,42,0.25)',
    transition: 'var(--transicion)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: 'var(--gris-texto)',
    fontSize: '0.9rem',
  },
  footerLink: {
    color: 'var(--verde-oscuro)',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;
