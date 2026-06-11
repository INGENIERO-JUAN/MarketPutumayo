import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const EVENTOS_VENTA = [
  'nueva_venta',
  'venta_creada',
  'nuevo_pedido',
  'nuevo_pedido_productor',
  'pedido_creado',
];

const obtenerIdPedido = (venta) => {
  if (!venta || typeof venta !== 'object') return null;
  return venta.id_pedido || venta.pedido?.id_pedido || venta.id || null;
};

const normalizarVentas = (data) => {
  if (!Array.isArray(data)) return [];
  const vistas = new Map();

  data.forEach((venta) => {
    const id = obtenerIdPedido(venta);
    if (!id || vistas.has(id)) return;
    vistas.set(id, venta);
  });

  return [...vistas.values()];
};

const NotificacionesVentas = () => {
  const { usuario } = useAuth();
  const [notificacion, setNotificacion] = useState(null);
  const idsConocidos = useRef(new Set());
  const primeraCarga = useRef(true);
  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const mostrarNotificacion = useCallback((venta) => {
    const id = obtenerIdPedido(venta);
    if (id) idsConocidos.current.add(id);

    setNotificacion({
      id: id || Date.now(),
      titulo: 'Nueva venta recibida',
      detalle: id ? `Pedido #${id}` : 'Revisa tu panel de ventas',
    });

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setNotificacion(null), 8000);
  }, []);

  const revisarVentas = useCallback(async () => {
    try {
      const { data } = await API.get('/pedidos/mis-ventas');
      const ventas = normalizarVentas(data);
      const idsActuales = ventas.map(obtenerIdPedido).filter(Boolean);

      if (primeraCarga.current) {
        idsConocidos.current = new Set(idsActuales);
        primeraCarga.current = false;
        return;
      }

      const nuevas = ventas.filter((venta) => {
        const id = obtenerIdPedido(venta);
        return id && !idsConocidos.current.has(id);
      });

      idsActuales.forEach((id) => idsConocidos.current.add(id));

      if (nuevas.length > 0) {
        mostrarNotificacion(nuevas[nuevas.length - 1]);
      }
    } catch (error) {
      console.error('Error al revisar ventas:', error);
    }
  }, [mostrarNotificacion]);

  useEffect(() => {
    if (usuario?.rol !== 'PRODUCTOR') return undefined;

    revisarVentas();
    const intervalo = setInterval(revisarVentas, 30000);
    const token = localStorage.getItem('token');
    const socket = io('http://localhost:4000', { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('registrar_usuario', usuario.id_usuario);
      socket.emit('unirse_productor', usuario.id_usuario);
    });

    EVENTOS_VENTA.forEach((evento) => {
      socket.on(evento, mostrarNotificacion);
    });

    return () => {
      clearInterval(intervalo);
      clearTimeout(timerRef.current);
      EVENTOS_VENTA.forEach((evento) => socket.off(evento, mostrarNotificacion));
      socket.disconnect();
      socketRef.current = null;
    };
  }, [mostrarNotificacion, revisarVentas, usuario]);

  if (usuario?.rol !== 'PRODUCTOR' || !notificacion) return null;

  return (
    <div style={styles.toast}>
      <button style={styles.cerrar} onClick={() => setNotificacion(null)} aria-label="Cerrar notificacion">
        x
      </button>
      <p style={styles.titulo}>{notificacion.titulo}</p>
      <p style={styles.detalle}>{notificacion.detalle}</p>
      <Link style={styles.link} to="/productor/ventas" onClick={() => setNotificacion(null)}>
        Ver ventas
      </Link>
    </div>
  );
};

const styles = {
  toast: {
    position: 'fixed',
    top: '84px',
    right: '1.5rem',
    width: 'min(340px, calc(100vw - 2rem))',
    background: 'white',
    border: '1px solid #d8f3dc',
    borderLeft: '5px solid #1a472a',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.16)',
    padding: '1rem 1.1rem',
    zIndex: 1200,
  },
  cerrar: {
    position: 'absolute',
    top: '0.55rem',
    right: '0.65rem',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  titulo: { margin: '0 1.3rem 0.2rem 0', color: '#1a472a', fontWeight: 700 },
  detalle: { margin: '0 0 0.7rem', color: '#555', fontSize: '0.9rem' },
  link: {
    color: '#f4a226',
    fontWeight: 700,
    fontSize: '0.9rem',
    textDecoration: 'none',
  },
};

export default NotificacionesVentas;
