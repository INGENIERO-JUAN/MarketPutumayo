import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ModalMapa from '../components/ModalMapa';

const Perfil = () => {
  const { usuario, login } = useAuth();
  const [form, setForm] = useState({ nombre: '', telefono: '', municipio: '', latitud: null, longitud: null });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [initialLocation, setInitialLocation] = useState(null);

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    try {
      const { data } = await API.get('/usuarios/perfil');
      setForm({
        nombre: data.nombre || '',
        telefono: data.telefono || '',
        municipio: data.municipio || '',
        latitud: data.latitud || null,
        longitud: data.longitud || null,
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationSelect = (location) => {
    setForm({
      ...form,
      latitud: location.lat,
      longitud: location.lng,
      municipio: location.municipio || form.municipio,
    });
  };

  const obtenerUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensaje('Error: geolocalizacion no soportada en este navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setInitialLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMostrarMapa(true);
      },
      () => {
        setMensaje('Error: no se pudo obtener tu ubicacion. Revisa los permisos del navegador.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setMensaje('Error: el nombre es requerido'); return; }
    setGuardando(true);
    setMensaje('');
    try {
      await API.put('/usuarios/perfil', form);
      const token = localStorage.getItem('token');
      login(token, { ...usuario, nombre: form.nombre });
      setMensaje('Perfil actualizado exitosamente');
    } catch (error) {
      setMensaje(`Error: ${error.response?.data?.error || 'Error al actualizar perfil'}`);
    } finally {
      setGuardando(false);
    }
  };

  const rolLabel = { ADMIN: 'Administrador', PRODUCTOR: 'Productor', COMPRADOR: 'Comprador' };

  if (cargando) return <div style={styles.loading}>Cargando perfil...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.avatarBox}>
          <div style={styles.avatar}>{usuario?.nombre?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 style={styles.nombre}>{usuario?.nombre}</h2>
            <span style={styles.rolBadge}>{rolLabel[usuario?.rol] || usuario?.rol}</span>
          </div>
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoItem}><span style={styles.infoLabel}>Correo:</span> {usuario?.correo}</p>
        </div>

        <hr style={styles.divider} />
        <h3 style={styles.sectionTitle}>Editar informacion</h3>

        {mensaje && <div style={mensaje.startsWith('Perfil') ? styles.exito : styles.error}>{mensaje}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre completo</label>
            <input style={styles.input} type="text" name="nombre" value={form.nombre} onChange={handleChange} required />
          </div>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>Telefono</label>
              <input style={styles.input} type="text" name="telefono" placeholder="3XX XXX XXXX" value={form.telefono} onChange={handleChange} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Municipio</label>
              <div style={styles.locationLine}>
                <input style={styles.inputLocation} type="text" name="municipio" placeholder="Mocoa, Sibundoy..." value={form.municipio} onChange={handleChange} />
                <button type="button" style={styles.iconButton} onClick={obtenerUbicacionActual} title="Usar ubicacion actual">
                  📍
                </button>
              </div>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Ubicacion en el mapa</label>
            <button type="button" style={styles.btnUbicacion} onClick={() => setMostrarMapa(true)}>
              {form.latitud && form.longitud ? 'Actualizar ubicacion' : 'Seleccionar ubicacion'}
            </button>
            {form.latitud && form.longitud && (
              <p style={styles.coordsText}>
                Lat: {Number(form.latitud).toFixed(4)}, Lng: {Number(form.longitud).toFixed(4)}
              </p>
            )}
          </div>

          <button style={styles.btn} type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <hr style={styles.divider} />

        <Link to="/perfil/cambiar-password" style={styles.btnPassword}>
          Cambiar contrasena
        </Link>
      </div>

      <ModalMapa
        isOpen={mostrarMapa}
        onClose={() => {
          setMostrarMapa(false);
          setInitialLocation(null);
        }}
        onSelectLocation={handleLocationSelect}
        initialLocation={initialLocation || (form.latitud && form.longitud ? { lat: Number(form.latitud), lng: Number(form.longitud) } : null)}
        titulo="Actualiza tu ubicacion"
      />
    </div>
  );
};

const styles = {
  container: { minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem', background: 'var(--crema)' },
  card: { background: 'white', borderRadius: 'var(--radio-lg)', padding: '2.5rem', width: '100%', maxWidth: '520px', boxShadow: 'var(--sombra-lg)', marginTop: '2rem' },
  avatarBox: { display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', background: 'var(--verde-oscuro)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '700', fontFamily: "'Playfair Display', serif", flexShrink: 0 },
  nombre: { fontFamily: "'Playfair Display', serif", color: 'var(--verde-oscuro)', margin: '0 0 0.3rem', fontSize: '1.4rem' },
  rolBadge: { background: 'var(--verde-suave)', color: 'var(--verde-oscuro)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' },
  infoBox: { marginBottom: '1rem' },
  infoItem: { color: 'var(--gris-texto)', fontSize: '0.9rem', margin: '0.3rem 0' },
  infoLabel: { fontWeight: '600', color: 'var(--negro-suave)' },
  divider: { border: 'none', borderTop: '1px solid var(--gris-claro)', margin: '1.5rem 0' },
  sectionTitle: { fontFamily: "'Playfair Display', serif", color: 'var(--verde-oscuro)', fontSize: '1.1rem', marginBottom: '1rem' },
  field: { marginBottom: '1rem' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: '600', color: 'var(--verde-oscuro)', marginBottom: '0.35rem' },
  input: { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radio-sm)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  locationLine: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  inputLocation: { flex: 1, minWidth: 0, width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radio-sm)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  iconButton: { width: '42px', height: '42px', background: '#f0fdf4', color: 'var(--verde-oscuro)', border: '1px solid #86efac', borderRadius: 'var(--radio-sm)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 },
  btnUbicacion: { width: '100%', padding: '0.75rem 1rem', background: '#f0fdf4', color: 'var(--verde-oscuro)', border: '2px dashed #86efac', borderRadius: 'var(--radio-sm)', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' },
  coordsText: { marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--verde-oscuro)', fontWeight: '500' },
  btn: { width: '100%', padding: '0.9rem', background: 'var(--verde-oscuro)', color: 'white', border: 'none', borderRadius: 'var(--radio-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginTop: '0.5rem' },
  btnPassword: { display: 'block', textAlign: 'center', padding: '0.75rem', border: '1.5px solid var(--verde-oscuro)', borderRadius: 'var(--radio-sm)', color: 'var(--verde-oscuro)', fontWeight: '600', fontSize: '0.95rem', textDecoration: 'none' },
  exito: { background: '#f0fdf4', color: 'var(--verde-oscuro)', padding: '0.75rem 1rem', borderRadius: 'var(--radio-sm)', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #bbf7d0' },
  error: { background: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 'var(--radio-sm)', marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid #fecaca' },
  loading: { textAlign: 'center', padding: '3rem', color: 'var(--gris-texto)' },
};

export default Perfil;
