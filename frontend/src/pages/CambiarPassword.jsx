import { useState } from 'react';
import API from '../api/axios';

const CambiarPassword = () => {
  const [form, setForm] = useState({ passwordActual: '', passwordNueva: '', confirmar: '' });
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [ver, setVer] = useState({ actual: false, nueva: false, confirmar: false });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleVer = (campo) => setVer({ ...ver, [campo]: !ver[campo] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.passwordNueva.length < 6) { setMensaje('❌ La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (form.passwordNueva !== form.confirmar) { setMensaje('❌ Las contraseñas nuevas no coinciden'); return; }
    setGuardando(true); setMensaje('');
    try {
      await API.put('/usuarios/cambiar-password', { passwordActual: form.passwordActual, passwordNueva: form.passwordNueva });
      setMensaje('✅ Contraseña actualizada exitosamente');
      setForm({ passwordActual: '', passwordNueva: '', confirmar: '' });
    } catch (error) {
      setMensaje(`❌ ${error.response?.data?.error || 'Error al cambiar contraseña'}`);
    } finally { setGuardando(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔒 Cambiar Contraseña</h2>
        {mensaje && <div style={mensaje.startsWith('✅') ? styles.exito : styles.error}>{mensaje}</div>}
        <form onSubmit={handleSubmit}>
          {[{name:'passwordActual',label:'Contraseña actual',key:'actual'},{name:'passwordNueva',label:'Nueva contraseña',key:'nueva'},{name:'confirmar',label:'Confirmar nueva contraseña',key:'confirmar'}].map(({name,label,key}) => (
            <div key={name} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <div style={styles.passwordBox}>
                <input style={styles.input} type={ver[key] ? 'text' : 'password'} name={name} value={form[name]} onChange={handleChange} required placeholder="••••••••" />
                <button type="button" style={styles.ojito} onClick={() => toggleVer(key)}>{ver[key] ? '🙈' : '👁️'}</button>
              </div>
            </div>
          ))}
          <button style={styles.btn} type="submit" disabled={guardando}>{guardando ? 'Guardando...' : 'Cambiar contraseña'}</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', background: 'var(--crema)' },
  card: { background: 'white', borderRadius: 'var(--radio-lg)', padding: '2.5rem', width: '100%', maxWidth: '460px', boxShadow: 'var(--sombra-lg)', marginTop: '2rem' },
  title: { fontFamily: "'Playfair Display', serif", color: 'var(--verde-oscuro)', marginBottom: '1.5rem', fontSize: '1.5rem' },
  field: { marginBottom: '1.2rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--verde-oscuro)', marginBottom: '0.35rem' },
  passwordBox: { position: 'relative' },
  input: { width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radio-sm)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  ojito: { position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  btn: { width: '100%', padding: '0.9rem', background: 'var(--verde-oscuro)', color: 'white', border: 'none', borderRadius: 'var(--radio-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  exito: { background: '#f0fdf4', color: 'var(--verde-oscuro)', padding: '0.75rem 1rem', borderRadius: 'var(--radio-sm)', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #bbf7d0' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 'var(--radio-sm)', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' },
};
export default CambiarPassword;
