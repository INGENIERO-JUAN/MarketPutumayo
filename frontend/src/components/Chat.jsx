import { useCallback, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

let socket = null;

const Chat = ({ id_conversacion, otroUsuario, onCerrar }) => {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const [conectado, setConectado] = useState(false);
  const bottomRef = useRef(null);
  const timerEscribiendo = useRef(null);

  const cargarMensajes = useCallback(async () => {
    try {
      const { data } = await API.get(`/chat/conversaciones/${id_conversacion}/mensajes`);
      setMensajes(data.mensajes);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }, [id_conversacion]);

  const conectarSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    socket = io('http://localhost:4000', { auth: { token } });

    socket.on('connect', () => {
      setConectado(true);
      socket.emit('unirse_conversacion', id_conversacion);
    });

    socket.on('disconnect', () => setConectado(false));

    socket.on('nuevo_mensaje', (msg) => {
      setMensajes(prev => [...prev, msg]);
    });

    socket.on('usuario_escribiendo', ({ nombre, id_usuario }) => {
      if (id_usuario !== usuario.id_usuario) {
        setEscribiendo(nombre);
      }
    });

    socket.on('usuario_dejo_escribir', ({ id_usuario }) => {
      if (id_usuario !== usuario.id_usuario) {
        setEscribiendo(false);
      }
    });
  }, [id_conversacion, usuario.id_usuario]);

  useEffect(() => {
    cargarMensajes();
    conectarSocket();
    return () => {
      clearTimeout(timerEscribiendo.current);
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [cargarMensajes, conectarSocket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleTexto = (e) => {
    setTexto(e.target.value);
    if (socket) {
      socket.emit('escribiendo', { id_conversacion });
      clearTimeout(timerEscribiendo.current);
      timerEscribiendo.current = setTimeout(() => {
        socket.emit('dejo_de_escribir', { id_conversacion });
      }, 1500);
    }
  };

  const enviarMensaje = () => {
    if (!texto.trim() || !socket) return;
    socket.emit('enviar_mensaje', { id_conversacion, mensaje: texto.trim() });
    setTexto('');
    socket.emit('dejo_de_escribir', { id_conversacion });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const formatHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const formatFecha = (fecha) => {
    const hoy = new Date();
    const d = new Date(fecha);
    if (d.toDateString() === hoy.toDateString()) return 'Hoy';
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.chatBox}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerInfo}>
            <div style={styles.avatar}>{otroUsuario?.nombre?.[0]?.toUpperCase() || '?'}</div>
            <div>
              <p style={styles.headerNombre}>{otroUsuario?.nombre || 'Usuario'}</p>
              <p style={styles.headerEstado}>
                <span style={{ ...styles.dot, background: conectado ? '#52b788' : '#999' }}></span>
                {conectado ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button style={styles.btnCerrar} onClick={onCerrar}>✕</button>
        </div>

        {/* Info pago físico */}
        <div style={styles.infoBanner}>
          💡 Puedes coordinar aquí un <strong>pago en efectivo</strong> o un <strong>encuentro físico</strong> con el productor.
        </div>

        {/* Mensajes */}
        <div style={styles.mensajesBox}>
          {mensajes.length === 0 && (
            <div style={styles.sinMensajes}>
              <p>👋 Saluda para comenzar la conversación</p>
            </div>
          )}
          {mensajes.map((m, i) => {
            const esMio = m.id_usuario === usuario.id_usuario;
            const fechaActual = formatFecha(m.enviado_en);
            const fechaAnterior = i > 0 ? formatFecha(mensajes[i - 1].enviado_en) : null;
            const mostrarFecha = fechaActual !== fechaAnterior;

            return (
              <div key={m.id_mensaje}>
                {mostrarFecha && (
                  <div style={styles.fechaSeparador}>{fechaActual}</div>
                )}
                <div style={{ ...styles.mensajeRow, justifyContent: esMio ? 'flex-end' : 'flex-start' }}>
                  {!esMio && <div style={styles.avatarSmall}>{m.nombre?.[0]?.toUpperCase()}</div>}
                  <div style={{ ...styles.burbuja, background: esMio ? '#1a472a' : 'white', color: esMio ? 'white' : '#1a1a1a', borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                    <p style={styles.burbujaTexto}>{m.mensaje}</p>
                    <p style={{ ...styles.burbujaHora, color: esMio ? 'rgba(255,255,255,0.6)' : '#999' }}>
                      {formatHora(m.enviado_en)} {esMio && (m.leido ? '✓✓' : '✓')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {escribiendo && (
            <div style={styles.escribiendoBox}>
              <div style={styles.avatarSmall}>{otroUsuario?.nombre?.[0]?.toUpperCase()}</div>
              <div style={styles.escribiendoBurbuja}>
                <span style={styles.punto}></span>
                <span style={styles.punto}></span>
                <span style={styles.punto}></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputBox}>
          <textarea
            style={styles.textarea}
            value={texto}
            onChange={handleTexto}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje... (Enter para enviar)"
            rows={1}
          />
          <button
            style={{ ...styles.btnEnviar, opacity: texto.trim() ? 1 : 0.5 }}
            onClick={enviarMensaje}
            disabled={!texto.trim()}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 },
  chatBox: { width: '360px', height: '520px', background: '#faf7f2', borderRadius: '20px', boxShadow: '0 8px 40px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8e0' },
  header: { background: '#1a472a', padding: '0.9rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '0.7rem' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', background: '#f4a226', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' },
  headerNombre: { color: 'white', fontWeight: '600', fontSize: '0.95rem', margin: 0 },
  headerEstado: { color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' },
  dot: { width: '6px', height: '6px', borderRadius: '50%', display: 'inline-block' },
  btnCerrar: { background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  infoBanner: { background: '#d8f3dc', padding: '0.6rem 1rem', fontSize: '0.8rem', color: '#1a472a', borderBottom: '1px solid #b7dfc0' },
  mensajesBox: { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  sinMensajes: { textAlign: 'center', color: '#999', fontSize: '0.9rem', marginTop: '2rem' },
  fechaSeparador: { textAlign: 'center', color: '#999', fontSize: '0.75rem', margin: '0.5rem 0', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', padding: '0.2rem 0.8rem', alignSelf: 'center', width: 'fit-content', marginLeft: 'auto', marginRight: 'auto' },
  mensajeRow: { display: 'flex', alignItems: 'flex-end', gap: '0.4rem' },
  avatarSmall: { width: '26px', height: '26px', borderRadius: '50%', background: '#52b788', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0 },
  burbuja: { maxWidth: '75%', padding: '0.6rem 0.9rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  burbujaTexto: { margin: 0, fontSize: '0.9rem', lineHeight: '1.4', wordBreak: 'break-word' },
  burbujaHora: { margin: '0.2rem 0 0', fontSize: '0.7rem', textAlign: 'right' },
  escribiendoBox: { display: 'flex', alignItems: 'flex-end', gap: '0.4rem' },
  escribiendoBurbuja: { background: 'white', padding: '0.6rem 0.9rem', borderRadius: '18px 18px 18px 4px', display: 'flex', gap: '0.3rem', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  punto: { width: '7px', height: '7px', borderRadius: '50%', background: '#999', animation: 'bounce 1s infinite', display: 'inline-block' },
  inputBox: { padding: '0.75rem', borderTop: '1px solid #e2e8e0', display: 'flex', gap: '0.5rem', alignItems: 'flex-end', background: 'white' },
  textarea: { flex: 1, padding: '0.65rem 0.9rem', border: '1.5px solid #e2e8e0', borderRadius: '20px', fontSize: '0.9rem', resize: 'none', outline: 'none', fontFamily: "'DM Sans', sans-serif", maxHeight: '100px', background: '#faf7f2' },
  btnEnviar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1a472a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};

export default Chat;
