import { useEffect, useState } from 'react';
import API from '../api/axios';

// ── Paleta MarketPutumayo ──────────────────────────────────────────────
const C = {
  verde: '#1a472a',
  verdeM: '#2d6a4f',
  verdeSuave: '#e8f5e9',
  dorado: '#f4a226',
  doradoSuave: '#fff8e7',
  gris: '#64748b',
  grisClaro: '#f1f5f9',
  blanco: '#ffffff',
  rojo: '#dc2626',
  azul: '#2563eb',
  morado: '#7c3aed',
};

const ESTADO_COLOR = {
  PENDIENTE: '#f59e0b',
  PAGADO: '#2563eb',
  ENVIADO: '#7c3aed',
  ENTREGADO: '#16a34a',
  CANCELADO: '#dc2626',
};

// ── Helpers ───────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toLocaleString('es-CO')}`;
const pct = (val, total) => total ? Math.round((val / total) * 100) : 0;

// ── Componentes pequeños ──────────────────────────────────────────────
const KpiCard = ({ icono, titulo, valor, sub, color }) => (
  <div style={{ background: C.blanco, borderRadius: 14, padding: '1.4rem 1.6rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '1.1rem', flex: '1 1 180px' }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
      {icono}
    </div>
    <div>
      <p style={{ margin: 0, fontSize: '0.78rem', color: C.gris, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{titulo}</p>
      <p style={{ margin: '0.2rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: color }}>{valor}</p>
      {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: C.gris }}>{sub}</p>}
    </div>
  </div>
);

const BarHorizontal = ({ label, value, max, color, suffix = '' }) => (
  <div style={{ marginBottom: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
      <span style={{ fontSize: '0.85rem', color: C.gris, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{value}{suffix}</span>
    </div>
    <div style={{ background: C.grisClaro, borderRadius: 99, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct(value, max)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

const Badge = ({ estado }) => (
  <span style={{ background: (ESTADO_COLOR[estado] || C.gris) + '20', color: ESTADO_COLOR[estado] || C.gris, borderRadius: 99, padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 700 }}>
    {estado}
  </span>
);

const SeccionCard = ({ titulo, icono, children }) => (
  <div style={{ background: C.blanco, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
    <div style={{ padding: '1.1rem 1.5rem', borderBottom: `1px solid ${C.grisClaro}`, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span style={{ fontSize: '1.1rem' }}>{icono}</span>
      <h3 style={{ margin: 0, fontSize: '1rem', color: C.verde, fontWeight: 700 }}>{titulo}</h3>
    </div>
    <div style={{ padding: '1.2rem 1.5rem' }}>{children}</div>
  </div>
);

// ── Dashboard principal ───────────────────────────────────────────────
const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [topProductos, setTopProductos] = useState([]);
  const [recientes, setRecientes] = useState([]);
  const [productores, setProductores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    setCargando(true);
    setError('');
    try {
      const [r1, r2, r3, r4, r5] = await Promise.all([
        API.get('/estadisticas/resumen'),
        API.get('/estadisticas/productos-top'),
        API.get('/estadisticas/pedidos-recientes'),
        API.get('/estadisticas/productores'),
        API.get('/estadisticas/ventas-por-categoria'),
      ]);
      setResumen(r1.data);
      setTopProductos(r2.data);
      setRecientes(r3.data);
      setProductores(r4.data);
      setCategorias(r5.data);
    } catch (err) {
      setError('Error al cargar estadísticas. Verifica que el servidor esté activo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // ── Derivados del resumen ──────────────────────────────────────────
  const totalUsuarios = resumen?.usuarios?.reduce((a, u) => a + Number(u.total), 0) || 0;
  const totalProductos = resumen?.productos?.reduce((a, p) => a + Number(p.total), 0) || 0;
  const totalPedidos = resumen?.pedidos?.reduce((a, p) => a + Number(p.total), 0) || 0;
  const getRol = (rol) => resumen?.usuarios?.find(u => u.rol === rol)?.total || 0;
  const getEstado = (est) => resumen?.pedidos?.find(p => p.estado === est)?.total || 0;
  const maxVendido = topProductos.length ? Math.max(...topProductos.map(p => Number(p.total_vendido))) : 1;
  const maxIngresosCat = categorias.length ? Math.max(...categorias.map(c => Number(c.ingresos))) : 1;
  const maxIngresosProdutor = productores.length ? Math.max(...productores.map(p => Number(p.ingresos_totales))) : 1;

  // ── Loading / Error ────────────────────────────────────────────────
  if (cargando) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 44, height: 44, border: `4px solid ${C.verdeSuave}`, borderTop: `4px solid ${C.verde}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: C.gris, fontSize: '0.9rem' }}>Cargando estadísticas…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '2rem', background: '#fee2e2', borderRadius: 14, color: C.rojo }}>
      <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</p>
      <p style={{ fontWeight: 700, marginBottom: '1rem' }}>{error}</p>
      <button onClick={cargarTodo} style={{ background: C.verde, color: C.blanco, border: 'none', padding: '0.6rem 1.5rem', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
        Reintentar
      </button>
    </div>
  );

  return (
    <div style={{ background: C.grisClaro, minHeight: '100vh', padding: '2rem 2.5rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Encabezado */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: C.verde, margin: 0 }}>
          📊 Dashboard
        </h1>
        <p style={{ color: C.gris, margin: '0.3rem 0 0', fontSize: '0.92rem' }}>
          Estadísticas en tiempo real de Market Putumayo
        </p>
      </div>

      {/* KPIs principales */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard icono="💰" titulo="Ingresos totales" valor={fmt(resumen?.total_ingresos)} sub="pedidos pagados/enviados/entregados" color={C.dorado} />
        <KpiCard icono="🛒" titulo="Total pedidos" valor={totalPedidos} sub={`${getEstado('PENDIENTE')} pendientes`} color={C.azul} />
        <KpiCard icono="📦" titulo="Productos" valor={totalProductos} sub={`${resumen?.productos?.find(p => p.estado === 'APROBADO')?.total || 0} aprobados`} color={C.verde} />
        <KpiCard icono="👥" titulo="Usuarios" valor={totalUsuarios} sub={`${getRol('PRODUCTOR')} productores · ${getRol('COMPRADOR')} compradores`} color={C.morado} />
        <KpiCard icono="🗂️" titulo="Categorías" valor={resumen?.total_categorias || 0} color="#0891b2" />
      </div>

      {/* Fila 1: Estado pedidos + Top productos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>

        {/* Estado de pedidos */}
        <SeccionCard titulo="Estado de pedidos" icono="🔄">
          {resumen?.pedidos?.length === 0 ? (
            <p style={{ color: C.gris, fontSize: '0.9rem' }}>Sin pedidos aún</p>
          ) : (
            resumen?.pedidos?.map(p => (
              <div key={p.estado} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.grisClaro}` }}>
                <Badge estado={p.estado} />
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, color: C.verde }}>{p.total}</span>
                  <span style={{ color: C.gris, fontSize: '0.78rem', marginLeft: '0.5rem' }}>{fmt(p.ingresos)}</span>
                </div>
              </div>
            ))
          )}
        </SeccionCard>

        {/* Top productos */}
        <SeccionCard titulo="Top 5 productos más vendidos" icono="🏆">
          {topProductos.length === 0 ? (
            <p style={{ color: C.gris, fontSize: '0.9rem' }}>Sin ventas registradas</p>
          ) : (
            topProductos.map((p, i) => (
              <div key={i}>
                <BarHorizontal
                  label={`${i + 1}. ${p.nombre}`}
                  value={Number(p.total_vendido)}
                  max={maxVendido}
                  color={[C.dorado, C.verde, C.azul, C.morado, '#0891b2'][i]}
                  suffix=" uds."
                />
              </div>
            ))
          )}
        </SeccionCard>

        {/* Ventas por categoría */}
        <SeccionCard titulo="Ingresos por categoría" icono="🏷️">
          {categorias.length === 0 ? (
            <p style={{ color: C.gris, fontSize: '0.9rem' }}>Sin datos</p>
          ) : (
            categorias.map((c, i) => (
              <BarHorizontal
                key={i}
                label={c.categoria}
                value={Number(c.ingresos)}
                max={maxIngresosCat}
                color={[C.verde, C.dorado, C.azul, C.morado, '#0891b2', '#be185d'][i % 6]}
              />
            ))
          )}
        </SeccionCard>
      </div>

      {/* Fila 2: Pedidos recientes + Ranking productores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem' }}>

        {/* Pedidos recientes */}
        <SeccionCard titulo="Últimos 10 pedidos" icono="🕐">
          {recientes.length === 0 ? (
            <p style={{ color: C.gris, fontSize: '0.9rem' }}>Sin pedidos</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
                <thead>
                  <tr style={{ color: C.gris, textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>#</th>
                    <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Comprador</th>
                    <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Municipio</th>
                    <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recientes.map((p) => (
                    <tr key={p.id_pedido} style={{ borderTop: `1px solid ${C.grisClaro}` }}>
                      <td style={{ padding: '0.5rem 0.6rem', color: C.gris }}>{p.id_pedido}</td>
                      <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600, color: C.verde }}>{p.comprador}</td>
                      <td style={{ padding: '0.5rem 0.6rem', color: C.gris }}>{p.municipio || '—'}</td>
                      <td style={{ padding: '0.5rem 0.6rem', fontWeight: 700, color: C.dorado }}>{fmt(p.total)}</td>
                      <td style={{ padding: '0.5rem 0.6rem' }}><Badge estado={p.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SeccionCard>

        {/* Ranking productores */}
        <SeccionCard titulo="Ranking de productores" icono="🌱">
          {productores.length === 0 ? (
            <p style={{ color: C.gris, fontSize: '0.9rem' }}>Sin productores</p>
          ) : (
            productores.map((p, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: C.verde }}>{i + 1}. {p.productor}</span>
                    {p.municipio && <span style={{ fontSize: '0.75rem', color: C.gris, marginLeft: '0.4rem' }}>({p.municipio})</span>}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: C.dorado }}>{fmt(p.ingresos_totales)}</span>
                </div>
                <div style={{ background: C.grisClaro, borderRadius: 99, height: 7, overflow: 'hidden' }}>
                  <div style={{ width: `${pct(p.ingresos_totales, maxIngresosProdutor)}%`, height: '100%', background: [C.verde, C.dorado, C.azul, C.morado][i % 4], borderRadius: 99, transition: 'width 0.6s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.72rem', color: C.gris }}>📦 {p.total_productos} productos</span>
                  <span style={{ fontSize: '0.72rem', color: C.gris }}>🛒 {p.total_ventas} ventas</span>
                </div>
              </div>
            ))
          )}
        </SeccionCard>
      </div>

      {/* Botón recargar */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={cargarTodo}
          style={{ background: C.verde, color: C.blanco, border: 'none', padding: '0.65rem 2rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(26,71,42,0.2)' }}
        >
          🔄 Actualizar estadísticas
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
