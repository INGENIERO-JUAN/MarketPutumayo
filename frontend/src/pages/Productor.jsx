import { useEffect, useState } from 'react';
import API from '../api/axios';

const Productor = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null); // producto en edición
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const formVacio = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '', imagen_url: '' };
  const [form, setForm] = useState(formVacio);

  useEffect(() => {
    cargarMisProductos();
    cargarCategorias();
  }, []);

  const cargarMisProductos = async () => {
    try {
      const { data } = await API.get('/productos/mis-productos');
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data } = await API.get('/categorias');
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const abrirEdicion = (p) => {
    setEditando(p.id_producto);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      id_categoria: categorias.find(c => c.nombre === p.categoria)?.id_categoria || '',
      imagen_url: p.imagen_url || ''
    });
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditando(null);
    setForm(formVacio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje('');
    try {
      const payload = {
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock),
        id_categoria: parseInt(form.id_categoria)
      };

      if (editando) {
        await API.put(`/productos/${editando}`, payload);
        setMensaje('✅ Producto actualizado.');
      } else {
        const { data } = await API.post('/productos', payload);
        setMensaje(`✅ ${data.mensaje}`);
      }

      cancelar();
      cargarMisProductos();
    } catch (error) {
      const msgError = error.response?.data?.error || 'Error al guardar producto';
      setMensaje(`❌ ${msgError}`);
    } finally {
      setCargando(false);
    }
  };

  const colorEstado = (estado) => {
    if (estado === 'APROBADO') return '#1a472a';
    if (estado === 'RECHAZADO') return '#c00';
    return '#f4a226';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🌿 Mis Productos</h2>
        <button style={styles.btnNuevo} onClick={() => mostrarForm ? cancelar() : setMostrarForm(true)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo Producto'}
        </button>
      </div>

      {mensaje && <div style={mensaje.startsWith('✅') ? styles.exito : styles.error}>{mensaje}</div>}

      {mostrarForm && (
        <div style={styles.formBox}>
          <h3 style={styles.formTitle}>{editando ? '✏️ Editar producto' : 'Publicar nuevo producto'}</h3>
          <form onSubmit={handleSubmit}>
            <input style={styles.input} type="text" name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={handleChange} required />
            <textarea style={styles.textarea} name="descripcion" placeholder="Descripción del producto" value={form.descripcion} onChange={handleChange} rows={3} />
            <div style={styles.row}>
              <input style={styles.inputMitad} type="number" name="precio" placeholder="Precio ($)" value={form.precio} onChange={handleChange} min="0" required />
              <input style={styles.inputMitad} type="number" name="stock" placeholder="Stock (unidades)" value={form.stock} onChange={handleChange} min="0" required />
            </div>
            <select style={styles.input} name="id_categoria" value={form.id_categoria} onChange={handleChange} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map(c => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>
            <input style={styles.input} type="url" name="imagen_url" placeholder="URL de imagen (opcional) ej: https://..." value={form.imagen_url} onChange={handleChange} />
            {form.imagen_url && (
              <img src={form.imagen_url} alt="preview" style={styles.preview} onError={(e) => e.target.style.display = 'none'} />
            )}
            <button style={styles.btnSubmit} type="submit" disabled={cargando}>
              {cargando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Publicar producto'}
            </button>
          </form>
        </div>
      )}

      {productos.length === 0 ? (
        <div style={styles.vacio}>No tienes productos publicados aún</div>
      ) : (
        <div style={styles.grid}>
          {productos.map(p => (
            <div key={p.id_producto} style={styles.card}>
              {p.imagen_url ? (
                <img src={p.imagen_url} alt={p.nombre} style={styles.img} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <div style={styles.imgPlaceholder}>🌿</div>
              )}
              <span style={{ ...styles.estado, color: colorEstado(p.estado) }}>● {p.estado}</span>
              <h3 style={styles.nombre}>{p.nombre}</h3>
              <p style={styles.desc}>{p.descripcion}</p>
              <p style={styles.precio}>${Number(p.precio).toLocaleString()}</p>
              <p style={styles.stock}>Stock: {p.stock} unidades</p>
              <p style={styles.cat}>{p.categoria}</p>
              <button style={styles.btnEditar} onClick={() => abrirEdicion(p)}>✏️ Editar</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2.5rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.88)', border: '1px solid var(--borde-suave)', borderRadius: 'var(--radio-lg)', padding: '1.25rem 1.4rem', boxShadow: 'var(--sombra-sm)', gap: '1rem', flexWrap: 'wrap' },
  title: { color: '#1a472a', margin: 0, fontSize: '1.9rem' },
  btnNuevo: { background: '#1a472a', color: 'white', border: 'none', padding: '0.7rem 1.3rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 22px rgba(26,71,42,0.22)' },
  formBox: { background: 'white', padding: '1.5rem', borderRadius: 'var(--radio-lg)', boxShadow: 'var(--sombra-md)', marginBottom: '2rem', border: '1px solid var(--borde-suave)' },
  formTitle: { color: '#1a472a', marginBottom: '1rem' },
  input: { width: '100%', padding: '0.82rem 0.95rem', marginBottom: '1rem', border: '1.5px solid rgba(26,71,42,0.12)', borderRadius: 'var(--radio-sm)', fontSize: '0.95rem', boxSizing: 'border-box', background: '#fffdf9' },
  textarea: { width: '100%', padding: '0.82rem 0.95rem', marginBottom: '1rem', border: '1.5px solid rgba(26,71,42,0.12)', borderRadius: 'var(--radio-sm)', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical', background: '#fffdf9' },
  row: { display: 'flex', gap: '1rem' },
  inputMitad: { flex: 1, padding: '0.82rem 0.95rem', marginBottom: '1rem', border: '1.5px solid rgba(26,71,42,0.12)', borderRadius: 'var(--radio-sm)', fontSize: '0.95rem', background: '#fffdf9' },
  btnSubmit: { width: '100%', padding: '0.82rem', background: '#f4a226', color: 'white', border: 'none', borderRadius: '999px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 22px rgba(244,162,38,0.22)' },
  preview: { width: '100%', height: '170px', objectFit: 'cover', borderRadius: 'var(--radio-sm)', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: 'var(--radio)', padding: '1rem', boxShadow: 'var(--sombra-sm)', display: 'flex', flexDirection: 'column', gap: '0.45rem', border: '1px solid var(--borde-suave)' },
  imgPlaceholder: { fontSize: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, #d8f3dc 0%, #c8ecd0 100%)', borderRadius: 'var(--radio-sm)', padding: '1.7rem 1rem' },
  img: { width: '100%', height: '155px', objectFit: 'cover', borderRadius: 'var(--radio-sm)' },
  estado: { fontWeight: 'bold', fontSize: '0.85rem' },
  nombre: { color: '#1a472a', margin: 0 },
  desc: { color: '#666', fontSize: '0.9rem', margin: 0 },
  precio: { color: '#f4a226', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 },
  stock: { color: '#999', fontSize: '0.85rem', margin: 0 },
  cat: { color: '#888', fontSize: '0.8rem', fontStyle: 'italic' },
  btnEditar: { marginTop: '0.5rem', background: 'transparent', border: '1.5px solid #1a472a', color: '#1a472a', padding: '0.48rem 0.8rem', borderRadius: '999px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' },
  vacio: { textAlign: 'center', padding: '3rem', color: '#999', background: 'white', borderRadius: 'var(--radio-lg)', border: '1px solid var(--borde-suave)', boxShadow: 'var(--sombra-sm)' },
  exito: { background: '#f0fdf4', color: '#1a472a', padding: '0.85rem 1rem', borderRadius: 'var(--radio-sm)', marginBottom: '1rem', border: '1px solid #bbf7d0' },
  error: { background: '#fee', color: '#c00', padding: '0.85rem 1rem', borderRadius: 'var(--radio-sm)', marginBottom: '1rem', border: '1px solid #fecaca' },
};

export default Productor;
