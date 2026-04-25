import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Admin = () => {
  const { usuario } = useAuth();
  const [seccion, setSeccion] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [seccion]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (seccion === 'productos') {
        const { data } = await API.get('/productos/pendientes');
        setProductos(data);
      } else if (seccion === 'usuarios') {
        const { data } = await API.get('/usuarios');
        setUsuarios(data);
      } else if (seccion === 'pedidos') {
        const { data } = await API.get('/pedidos');
        setPedidos(data);
      } else if (seccion === 'categorias') {
        const { data } = await API.get('/categorias');
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const aprobarProducto = async (id, estado) => {
    try {
      await API.put(`/productos/${id}/estado`, { estado });
      setMensaje(`✅ Producto ${estado.toLowerCase()} exitosamente`);
      cargarDatos();
    } catch (error) {
      setMensaje('❌ Error al actualizar producto');
    }
  };

  const toggleUsuario = async (id, activo) => {
    try {
      await API.put(`/usuarios/${id}/estado`, { activo: !activo });
      setMensaje(`✅ Usuario ${!activo ? 'activado' : 'desactivado'}`);
      cargarDatos();
    } catch (error) {
      setMensaje('❌ Error al actualizar usuario');
    }
  };

  const actualizarPedido = async (id, estado) => {
    try {
      await API.put(`/pedidos/${id}/estado`, { estado });
      setMensaje(`✅ Pedido actualizado a ${estado}`);
      cargarDatos();
    } catch (error) {
      setMensaje('❌ Error al actualizar pedido');
    }
  };

  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    try {
      await API.post('/categorias', { nombre: nuevaCategoria.trim() });
      setMensaje('✅ Categoría creada exitosamente');
      setNuevaCategoria('');
      cargarDatos();
    } catch (error) {
      setMensaje(`❌ ${error.response?.data?.error || 'Error al crear categoría'}`);
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await API.delete(`/categorias/${id}`);
      setMensaje('✅ Categoría eliminada');
      cargarDatos();
    } catch (error) {
      setMensaje(`❌ ${error.response?.data?.error || 'Error al eliminar categoría'}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚙️ Panel de Administración</h2>
      <p style={styles.sub}>Bienvenido, {usuario?.nombre}</p>

      {mensaje && (
        <div style={mensaje.startsWith('✅') ? styles.exito : styles.error}
          onClick={() => setMensaje('')}>{mensaje}</div>
      )}

      <div style={styles.tabs}>
        <button style={seccion === 'productos' ? styles.tabActivo : styles.tab} onClick={() => setSeccion('productos')}>📦 Productos</button>
        <button style={seccion === 'usuarios' ? styles.tabActivo : styles.tab} onClick={() => setSeccion('usuarios')}>👥 Usuarios</button>
        <button style={seccion === 'pedidos' ? styles.tabActivo : styles.tab} onClick={() => setSeccion('pedidos')}>📋 Pedidos</button>
        <button style={seccion === 'categorias' ? styles.tabActivo : styles.tab} onClick={() => setSeccion('categorias')}>🏷️ Categorías</button>
      </div>

      {cargando && <div style={styles.loading}>Cargando...</div>}

      {/* PRODUCTOS PENDIENTES */}
      {!cargando && seccion === 'productos' && (
        <div>
          {productos.length === 0 ? (
            <div style={styles.vacio}>No hay productos pendientes ✅</div>
          ) : (
            productos.map(p => (
              <div key={p.id_producto} style={styles.card}>
                <div style={styles.cardInfo}>
                  {p.imagen_url && (
                    <img src={p.imagen_url} alt={p.nombre} style={styles.cardImg}
                      onError={(e) => e.target.style.display = 'none'} />
                  )}
                  <h4 style={styles.cardNombre}>{p.nombre}</h4>
                  <p style={styles.cardDesc}>{p.descripcion}</p>
                  <p style={styles.cardMeta}>Productor: {p.productor} | Categoría: {p.categoria}</p>
                  <p style={styles.cardMeta}>Precio: ${Number(p.precio).toLocaleString()} | Stock: {p.stock}</p>
                </div>
                <div style={styles.cardAcciones}>
                  <button style={styles.btnAprobar} onClick={() => aprobarProducto(p.id_producto, 'APROBADO')}>✅ Aprobar</button>
                  <button style={styles.btnRechazar} onClick={() => aprobarProducto(p.id_producto, 'RECHAZADO')}>❌ Rechazar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* USUARIOS */}
      {!cargando && seccion === 'usuarios' && (
        <div>
          {usuarios.map(u => (
            <div key={u.id_usuario} style={styles.card}>
              <div style={styles.cardInfo}>
                <h4 style={styles.cardNombre}>{u.nombre}</h4>
                <p style={styles.cardDesc}>{u.correo}</p>
                <p style={styles.cardMeta}>Rol: {u.rol} | Municipio: {u.municipio || 'N/A'}</p>
              </div>
              <div style={styles.cardAcciones}>
                <span style={{ ...styles.badge, background: u.activo ? '#e8f5e9' : '#fee', color: u.activo ? '#1a472a' : '#c00' }}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
                {u.id_usuario !== usuario.id_usuario && (
                  <button style={u.activo ? styles.btnRechazar : styles.btnAprobar}
                    onClick={() => toggleUsuario(u.id_usuario, u.activo)}>
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PEDIDOS */}
      {!cargando && seccion === 'pedidos' && (
        <div>
          {pedidos.length === 0 ? (
            <div style={styles.vacio}>No hay pedidos registrados</div>
          ) : (
            pedidos.map(p => (
              <div key={p.id_pedido} style={styles.card}>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardNombre}>Pedido #{p.id_pedido}</h4>
                  <p style={styles.cardDesc}>Comprador: {p.comprador} | {p.correo}</p>
                  <p style={styles.cardMeta}>Total: ${Number(p.total).toLocaleString()} | Items: {p.total_items}</p>
                  <p style={styles.cardMeta}>Fecha: {new Date(p.fecha).toLocaleDateString('es-CO')}</p>
                </div>
                <div style={styles.cardAcciones}>
                  <select style={styles.selectEstado} value={p.estado}
                    onChange={(e) => actualizarPedido(p.id_pedido, e.target.value)}>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADO">Pagado</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="ENTREGADO">Entregado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CATEGORÍAS */}
      {!cargando && seccion === 'categorias' && (
        <div>
          <form onSubmit={crearCategoria} style={styles.catForm}>
            <input
              style={styles.catInput}
              type="text"
              placeholder="Nombre de la nueva categoría"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
            />
            <button style={styles.btnAprobar} type="submit">+ Crear</button>
          </form>

          {categorias.length === 0 ? (
            <div style={styles.vacio}>No hay categorías registradas</div>
          ) : (
            <div style={styles.catGrid}>
              {categorias.map(c => (
                <div key={c.id_categoria} style={styles.catCard}>
                  <span style={styles.catNombre}>🏷️ {c.nombre}</span>
                  <button style={styles.btnEliminarCat}
                    onClick={() => eliminarCategoria(c.id_categoria)}>
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  title: { color: '#1a472a' },
  sub: { color: '#666', marginBottom: '1.5rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: { padding: '0.6rem 1.2rem', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', background: 'white', color: '#666' },
  tabActivo: { padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', cursor: 'pointer', background: '#1a472a', color: 'white', fontWeight: 'bold' },
  card: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '1rem 1.5rem', borderRadius: '10px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flexWrap: 'wrap', gap: '1rem' },
  cardImg: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' },
  cardInfo: { flex: 1 },
  cardNombre: { margin: '0 0 0.3rem 0', color: '#1a472a' },
  cardDesc: { margin: '0 0 0.3rem 0', color: '#666', fontSize: '0.9rem' },
  cardMeta: { margin: 0, color: '#999', fontSize: '0.85rem' },
  cardAcciones: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  btnAprobar: { background: '#1a472a', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  btnRechazar: { background: '#fee', color: '#c00', border: '1px solid #c00', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  badge: { padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' },
  selectEstado: { padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' },
  loading: { textAlign: 'center', padding: '2rem', color: '#666' },
  vacio: { textAlign: 'center', padding: '3rem', color: '#999' },
  exito: { background: '#efe', color: '#1a472a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' },
  error: { background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', cursor: 'pointer' },
  catForm: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  catInput: { flex: 1, padding: '0.6rem 1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' },
  catCard: { background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  catNombre: { color: '#1a472a', fontWeight: '600', fontSize: '0.9rem' },
  btnEliminarCat: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem' },
};

export default Admin;
