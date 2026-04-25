import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Productor = () => {
  const { usuario } = useAuth();
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
        setMensaje('✅ Producto actualizado. Pendiente de aprobación.');
      } else {
        await API.post('/productos', payload);
        setMensaje('✅ Producto enviado para aprobación');
      }

      cancelar();
      cargarMisProductos();
    } catch (error) {
      setMensaje(`❌ ${error.response?.data?.error || 'Error al guardar producto'}`);
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
  container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { color: '#1a472a', margin: 0 },
  btnNuevo: { background: '#1a472a', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  formBox: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '2rem' },
  formTitle: { color: '#1a472a', marginBottom: '1rem' },
  input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' },
  row: { display: 'flex', gap: '1rem' },
  inputMitad: { flex: 1, padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' },
  btnSubmit: { width: '100%', padding: '0.75rem', background: '#f4a226', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' },
  preview: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  imgPlaceholder: { fontSize: '3rem', textAlign: 'center', background: '#f0f4f0', borderRadius: '8px', padding: '1rem' },
  img: { width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' },
  estado: { fontWeight: 'bold', fontSize: '0.85rem' },
  nombre: { color: '#1a472a', margin: 0 },
  desc: { color: '#666', fontSize: '0.9rem', margin: 0 },
  precio: { color: '#f4a226', fontWeight: 'bold', fontSize: '1.2rem', margin: 0 },
  stock: { color: '#999', fontSize: '0.85rem', margin: 0 },
  cat: { color: '#888', fontSize: '0.8rem', fontStyle: 'italic' },
  btnEditar: { marginTop: '0.5rem', background: 'transparent', border: '1px solid #1a472a', color: '#1a472a', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  vacio: { textAlign: 'center', padding: '3rem', color: '#999' },
  exito: { background: '#efe', color: '#1a472a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  error: { background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
};

export default Productor;
