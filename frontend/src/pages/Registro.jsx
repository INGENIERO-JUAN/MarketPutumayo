import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';

const Registro = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'COMPRADOR', telefono: '', municipio: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        <h2 style={styles.title}>🌿 Crear Cuenta</h2>
        <p style={styles.subtitle}>Únete a MarketPutumayo</p>
        {error && <div style={styles.error}>{error}</div>}
        {exito && <div style={styles.exito}>{exito}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="text" name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={handleChange} required />
          <input style={styles.input} type="email" name="correo" placeholder="Correo electrónico" value={form.correo} onChange={handleChange} required />
          <input style={styles.input} type="password" name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required />
          <select style={styles.input} name="rol" value={form.rol} onChange={handleChange}>
            <option value="COMPRADOR">Comprador</option>
            <option value="PRODUCTOR">Productor</option>
          </select>
          <input style={styles.input} type="text" name="telefono" placeholder="Teléfono (opcional)" value={form.telefono} onChange={handleChange} />
          <input style={styles.input} type="text" name="municipio" placeholder="Municipio (opcional)" value={form.municipio} onChange={handleChange} />
          <button style={styles.btn} type="submit" disabled={cargando}>
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p style={styles.footer}>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f0' },
  card: { background: 'white', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', color: '#1a472a', marginBottom: '0.3rem' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '0.75rem', background: '#1a472a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  error: { background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' },
  exito: { background: '#efe', color: '#1a472a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' },
  footer: { textAlign: 'center', marginTop: '1rem', color: '#666' },
};

export default Registro;
