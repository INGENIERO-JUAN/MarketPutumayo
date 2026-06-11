import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Chat from '../components/Chat';

const Conversaciones = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [chatActivo, setChatActivo] = useState(null);
  const [otroUsuario, setOtroUsuario] = useState(null);

  const cargarConversaciones = useCallback(async () => {
    try {
      const { data } = await API.get('/chat/conversaciones');
      setConversaciones(data);
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!usuario) { navigate('/login'); return; }
    cargarConversaciones();

    // Si viene de un producto, abrir chat directamente
    const idConv = searchParams.get('conv');
    if (idConv) {
      setChatActivo(parseInt(idConv, 10));
    }
  }, [cargarConversaciones, navigate, searchParams, usuario]);

  const abrirChat = (conv) => {
    setChatActivo(conv.id_conversacion);
    const otro = usuario.id_usuario === conv.id_comprador
      ? { id_usuario: conv.id_productor, nombre: conv.nombre_productor }
      : { id_usuario: conv.id_comprador, nombre: conv.nombre_comprador };
    setOtroUsuario(otro);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) {
      return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  if (cargando) return <div style={styles.loading}>Cargando conversaciones...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>💬 Mis Conversaciones</h2>
        <p style={styles.subtitle}>Coordina pagos en efectivo o encuentros con los productores</p>
      </div>

      {conversaciones.length === 0 ? (
        <div style={styles.vacio}>
          <span style={styles.vacioIcon}>💬</span>
          <p style={styles.vacioTexto}>No tienes conversaciones aún</p>
          {usuario.rol === 'COMPRADOR' && (
            <p style={styles.vacioSub}>Ve al catálogo y haz clic en &quot;Contactar productor&quot; en cualquier producto</p>
          )}
        </div>
      ) : (
        <div style={styles.lista}>
          {conversaciones.map(conv => {
            const esComprador = usuario.id_usuario === conv.id_comprador;
            const otroNombre = esComprador ? conv.nombre_productor : conv.nombre_comprador;
            const otraLetra = otroNombre?.[0]?.toUpperCase() || '?';

            return (
              <div key={conv.id_conversacion} style={styles.convCard} onClick={() => abrirChat(conv)}>
                <div style={styles.convAvatar}>{otraLetra}</div>
                <div style={styles.convInfo}>
                  <div style={styles.convRow}>
                    <p style={styles.convNombre}>{otroNombre}</p>
                    <span style={styles.convFecha}>{formatFecha(conv.ultima_fecha)}</span>
                  </div>
                  {conv.nombre_producto && (
                    <p style={styles.convProducto}>🌿 {conv.nombre_producto}</p>
                  )}
                  <p style={styles.convUltimo}>
                    {conv.ultimo_mensaje || 'Sin mensajes aún'}
                  </p>
                </div>
                {conv.no_leidos > 0 && (
                  <div style={styles.badge}>{conv.no_leidos}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {chatActivo && (
        <Chat
          id_conversacion={chatActivo}
          otroUsuario={otroUsuario}
          onCerrar={() => { setChatActivo(null); cargarConversaciones(); }}
        />
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh' },
  header: { marginBottom: '2rem' },
  title: { color: '#1a472a', marginBottom: '0.3rem' },
  subtitle: { color: '#666', fontSize: '0.9rem' },
  loading: { textAlign: 'center', padding: '3rem', color: '#666' },
  vacio: { textAlign: 'center', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' },
  vacioIcon: { fontSize: '3rem' },
  vacioTexto: { color: '#555', fontWeight: '600', fontSize: '1rem' },
  vacioSub: { color: '#999', fontSize: '0.9rem', maxWidth: '300px' },
  lista: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  convCard: { background: 'white', borderRadius: '14px', padding: '1rem 1.2rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1.5px solid transparent', transition: 'all 0.2s' },
  convAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: '#1a472a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 },
  convInfo: { flex: 1, minWidth: 0 },
  convRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' },
  convNombre: { fontWeight: '600', color: '#1a1a1a', margin: 0, fontSize: '0.95rem' },
  convFecha: { color: '#999', fontSize: '0.75rem', flexShrink: 0 },
  convProducto: { color: '#52b788', fontSize: '0.78rem', margin: '0 0 0.2rem' },
  convUltimo: { color: '#666', fontSize: '0.85rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { background: '#1a472a', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 },
};

export default Conversaciones;
