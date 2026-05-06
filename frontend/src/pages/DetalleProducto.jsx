import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import ConversorMoneda from '../components/ConversorMoneda';
import Chat from '../components/Chat';

const DetalleProducto = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [chatAbierto, setChatAbierto] = useState(false);
  const [idConversacion, setIdConversacion] = useState(null);
  const [iniciandoChat, setIniciandoChat] = useState(false);

  useEffect(() => {
    cargarProducto();
    cargarResenas();
  }, [id]);

  const cargarProducto = async () => {
    try {
      const { data } = await API.get(`/productos/${id}`);
      setProducto(data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
    } finally {
      setCargando(false);
    }
  };

  const cargarResenas = async () => {
    try {
      const { data } = await API.get(`/resenas/${id}`);
      setResenas(data);
    } catch (error) {
      // ignorar si no existe el endpoint aún
    }
  };

  const agregarAlCarrito = () => {
    if (!usuario) { navigate('/login'); return; }
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const existe = carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    setMensaje('✅ Producto agregado al carrito');
    setTimeout(() => setMensaje(''), 2500);
  };

  const contactarProductor = async () => {
    if (!usuario) { navigate('/login'); return; }
    setIniciandoChat(true);
    try {
      const { data } = await API.post('/chat/conversaciones', {
        id_productor: producto.id_productor,
        id_producto: producto.id_producto
      });
      setIdConversacion(data.id_conversacion);
      setChatAbierto(true);
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
    } finally {
      setIniciandoChat(false);
    }
  };

  if (cargando) return <div style={styles.loading}>Cargando producto...</div>;

  if (!producto) return (
    <div style={styles.loading}>
      <p>Producto no encontrado</p>
      <button style={styles.btnVolver} onClick={() => navigate('/catalogo')}>Volver al catálogo</button>
    </div>
  );

  return (
    <div style={styles.container}>
      <button style={styles.btnVolver} onClick={() => navigate('/catalogo')}>← Volver al catálogo</button>

      <div style={styles.detalle}>
        <div style={styles.imgBox}>
          {producto.imagen_url ? (
            <img src={producto.imagen_url} alt={producto.nombre} style={styles.img}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <div style={{ ...styles.imgPlaceholder, display: producto.imagen_url ? 'none' : 'flex' }}>🌿</div>
        </div>

        <div style={styles.info}>
          <span style={styles.categoria}>{producto.categoria}</span>
          <h1 style={styles.nombre}>{producto.nombre}</h1>
          <p style={styles.productor}>🌱 Por {producto.productor}</p>

          {producto.descripcion && (
            <p style={styles.descripcion}>{producto.descripcion}</p>
          )}

          <div style={styles.precioBox}>
            <span style={styles.precio}>${Number(producto.precio).toLocaleString()}</span>
            <span style={styles.stock}>
              {producto.stock > 0 ? `${producto.stock} disponibles` : 'Agotado'}
            </span>
          </div>

          <ConversorMoneda precioCOP={producto.precio} />

          {mensaje && <div style={styles.toast}>{mensaje}</div>}

          <div style={styles.botones}>
            {usuario?.rol === 'COMPRADOR' && (
              <>
                {producto.stock > 0 ? (
                  <button style={styles.btnCarrito} onClick={agregarAlCarrito}>
                    🛒 Agregar al carrito
                  </button>
                ) : (
                  <button style={{ ...styles.btnCarrito, background: '#ccc', cursor: 'not-allowed' }} disabled>
                    Sin stock
                  </button>
                )}
                <button style={styles.btnChat} onClick={contactarProductor} disabled={iniciandoChat}>
                  {iniciandoChat ? 'Abriendo chat...' : '💬 Contactar productor'}
                </button>
              </>
            )}

            {!usuario && (
              <button style={styles.btnCarrito} onClick={() => navigate('/login')}>
                Inicia sesión para comprar
              </button>
            )}
          </div>

          {usuario?.rol === 'COMPRADOR' && (
            <div style={styles.infoPago}>
              <p style={styles.infoPagoTexto}>
                💡 ¿Prefieres pagar en efectivo o verte en persona? Usa el chat para coordinar con el productor.
              </p>
            </div>
          )}

          {producto.telefono_productor && (
            <p style={styles.contacto}>📞 {producto.telefono_productor}</p>
          )}
        </div>
      </div>

      {resenas.length > 0 && (
        <div style={styles.resenasBox}>
          <h3 style={styles.resenasTitle}>⭐ Reseñas ({resenas.length})</h3>
          {resenas.map(r => (
            <div key={r.id_resena} style={styles.resenaCard}>
              <div style={styles.resenaHeader}>
                <span style={styles.resenaAutor}>{r.comprador}</span>
                <span style={styles.resenaEstrellas}>{'⭐'.repeat(r.calificacion)}</span>
              </div>
              {r.comentario && <p style={styles.resenaComentario}>{r.comentario}</p>}
              <p style={styles.resenaFecha}>{new Date(r.fecha).toLocaleDateString('es-CO')}</p>
            </div>
          ))}
        </div>
      )}

      {chatAbierto && idConversacion && (
        <Chat
          id_conversacion={idConversacion}
          otroUsuario={{ nombre: producto.productor }}
          onCerrar={() => setChatAbierto(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: { padding: '2rem', maxWidth: '1100px', margin: '0 auto' },
  btnVolver: { background: 'none', border: 'none', color: 'var(--verde-oscuro)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem', padding: 0 },
  detalle: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  imgBox: { borderRadius: '12px', overflow: 'hidden', height: '380px' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  imgPlaceholder: { width: '100%', height: '100%', background: 'var(--verde-suave)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem' },
  info: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  categoria: { background: 'var(--verde-suave)', color: 'var(--verde-oscuro)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-block', width: 'fit-content' },
  nombre: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--negro-suave)', margin: 0 },
  productor: { color: 'var(--gris-texto)', fontSize: '0.9rem', margin: 0 },
  descripcion: { color: 'var(--gris-texto)', lineHeight: '1.7', fontSize: '0.95rem' },
  precioBox: { display: 'flex', alignItems: 'center', gap: '1rem' },
  precio: { fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: '700', color: 'var(--dorado-oscuro)' },
  stock: { color: 'var(--gris-texto)', fontSize: '0.85rem' },
  botones: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  btnCarrito: { background: 'var(--verde-oscuro)', color: 'white', border: 'none', padding: '0.9rem 2rem', borderRadius: 'var(--radio-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(26,71,42,0.25)' },
  btnChat: { background: 'white', color: 'var(--verde-oscuro)', border: '2px solid var(--verde-oscuro)', padding: '0.85rem 2rem', borderRadius: 'var(--radio-sm)', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' },
  infoPago: { background: 'var(--verde-suave)', padding: '0.75rem 1rem', borderRadius: 'var(--radio-sm)' },
  infoPagoTexto: { color: 'var(--verde-oscuro)', fontSize: '0.85rem', margin: 0 },
  toast: { background: 'var(--verde-suave)', color: 'var(--verde-oscuro)', padding: '0.75rem 1rem', borderRadius: 'var(--radio-sm)', fontSize: '0.9rem', fontWeight: '500' },
  contacto: { color: 'var(--gris-texto)', fontSize: '0.85rem', margin: 0 },
  resenasBox: { marginTop: '2rem', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  resenasTitle: { fontFamily: "'Playfair Display', serif", color: 'var(--verde-oscuro)', marginBottom: '1rem' },
  resenaCard: { padding: '1rem 0', borderBottom: '1px solid var(--gris-claro)' },
  resenaHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' },
  resenaAutor: { fontWeight: '600', color: 'var(--negro-suave)', fontSize: '0.9rem' },
  resenaEstrellas: { fontSize: '0.9rem' },
  resenaComentario: { color: 'var(--gris-texto)', fontSize: '0.9rem', margin: '0.3rem 0' },
  resenaFecha: { color: '#bbb', fontSize: '0.8rem', margin: 0 },
  loading: { textAlign: 'center', padding: '3rem', color: 'var(--gris-texto)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
};

export default DetalleProducto;
