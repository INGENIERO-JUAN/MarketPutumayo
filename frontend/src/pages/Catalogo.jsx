import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useTipoCambio from '../api/useTipoCambio';

const MONEDAS = [
  { codigo: 'COP', bandera: '🇨🇴', simbolo: '$' },
  { codigo: 'USD', bandera: '🇺🇸', simbolo: '$' },
  { codigo: 'EUR', bandera: '🇪🇺', simbolo: '€' },
  { codigo: 'GBP', bandera: '🇬🇧', simbolo: '£' },
];

const Catalogo = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [monedaVista, setMonedaVista] = useState('COP');

  // API externa de tipo de cambio
  const { convertir, formatearMoneda, cargando: cargandoTasa, error: errorTasa } = useTipoCambio();

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const { data } = await API.get('/productos');
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
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

  const agregarAlCarrito = (e, producto) => {
    e.stopPropagation();
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const existe = carrito.find(p => p.id_producto === producto.id_producto);
    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    localStorage.setItem('carrito', JSON.stringify(carrito));
    setMensaje(`"${producto.nombre}" agregado al carrito`);
    setTimeout(() => setMensaje(''), 2500);
  };

  // Formatea el precio según la moneda seleccionada
  const mostrarPrecio = (precioCOP) => {
    if (monedaVista === 'COP') {
      return `$${Number(precioCOP).toLocaleString('es-CO')}`;
    }
    if (cargandoTasa) return '···';
    const valor = convertir(precioCOP, monedaVista);
    return valor ? formatearMoneda(valor, monedaVista) : `$${Number(precioCOP).toLocaleString()}`;
  };

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaSeleccionada === '' || p.categoria === categoriaSeleccionada;
    return coincideBusqueda && coincideCategoria;
  });

  if (cargando) return (
    <div style={styles.loadingContainer}>
      <div style={styles.loadingDot}></div>
      <p style={styles.loadingText}>Cargando productos...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Productos del Putumayo</h1>
          <p style={styles.heroSub}>Directamente de nuestros productores locales</p>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.filtrosBar}>
          {/* Buscador */}
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              style={styles.buscador}
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Filtros de categoría + selector de moneda en la misma fila */}
          <div style={styles.filtrosFila}>
            <div style={styles.categorias}>
              <button style={categoriaSeleccionada === '' ? styles.catBtnActivo : styles.catBtn} onClick={() => setCategoriaSeleccionada('')}>Todos</button>
              {categorias.map(c => (
                <button
                  key={c.id_categoria}
                  style={categoriaSeleccionada === c.nombre ? styles.catBtnActivo : styles.catBtn}
                  onClick={() => setCategoriaSeleccionada(c.nombre)}
                >{c.nombre}</button>
              ))}
            </div>

            {/* ── Selector de moneda (consume API externa ExchangeRate-API) ── */}
            <div style={styles.selectorMoneda}>
              <span style={styles.selectorLabel}>💱</span>
              {MONEDAS.map(m => (
                <button
                  key={m.codigo}
                  style={monedaVista === m.codigo ? styles.monedaBtnActivo : styles.monedaBtn}
                  onClick={() => setMonedaVista(m.codigo)}
                  title={m.codigo}
                >
                  {m.bandera} {m.codigo}
                </button>
              ))}
              {cargandoTasa && monedaVista !== 'COP' && (
                <span style={{ fontSize: '0.75rem', color: '#999', marginLeft: '0.3rem' }}>Cargando tasa…</span>
              )}
              {errorTasa && monedaVista !== 'COP' && (
                <span style={{ fontSize: '0.75rem', color: '#dc2626', marginLeft: '0.3rem' }}>⚠️ Sin tasa</span>
              )}
            </div>
          </div>
        </div>

        {mensaje && <div style={styles.toast}>🛒 {mensaje}</div>}

        <p style={styles.contador}>
          <strong>{productosFiltrados.length}</strong> producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
          {monedaVista !== 'COP' && !cargandoTasa && (
            <span style={{ marginLeft: '0.75rem', color: '#888', fontSize: '0.8rem' }}>
              · Precios en {monedaVista} (referencia)
            </span>
          )}
        </p>

        {productosFiltrados.length === 0 ? (
          <div style={styles.vacio}>
            <span style={styles.vacioIcon}>🌿</span>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {productosFiltrados.map(p => (
              <div
                key={p.id_producto}
                style={styles.card}
                onClick={() => navigate(`/catalogo/${p.id_producto}`)}
              >
                <div style={styles.cardImgWrapper}>
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      style={styles.cardImg}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div style={{ ...styles.cardImgPlaceholder, display: p.imagen_url ? 'none' : 'flex' }}>🌿</div>
                  <span style={styles.cardCategoria}>{p.categoria}</span>
                </div>

                <div style={styles.cardBody}>
                  <h3 style={styles.cardNombre}>{p.nombre}</h3>
                  {p.descripcion && <p style={styles.cardDesc}>{p.descripcion}</p>}
                  <div style={styles.cardFooter}>
                    <div>
                      {/* Precio principal en la moneda seleccionada */}
                      <p style={styles.cardPrecio}>{mostrarPrecio(p.precio)}</p>
                      {/* Referencia en COP si se muestra otra moneda */}
                      {monedaVista !== 'COP' && (
                        <p style={styles.cardPrecioCOP}>${Number(p.precio).toLocaleString()} COP</p>
                      )}
                      <p style={styles.cardStock}>{p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}</p>
                    </div>
                    {usuario?.rol === 'COMPRADOR' ? (
                      p.stock > 0 ? (
                        <button style={styles.btnCarrito} onClick={(e) => agregarAlCarrito(e, p)}>
                          + Carrito
                        </button>
                      ) : (
                        <span style={styles.agotado}>Agotado</span>
                      )
                    ) : !usuario ? (
                      <span style={styles.avisoLogin}>Inicia sesión</span>
                    ) : null}
                  </div>
                  <p style={styles.cardProductor}>🌱 {p.productor}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'var(--crema)' },
  hero: { background: 'linear-gradient(135deg, var(--verde-oscuro) 0%, var(--verde-medio) 100%)', padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' },
  heroContent: { maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: 'white', marginBottom: '0.5rem' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem' },
  main: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 2.5rem' },
  filtrosBar: { marginBottom: '1.5rem' },
  searchWrapper: { position: 'relative', marginBottom: '1rem' },
  searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' },
  buscador: { width: '100%', padding: '0.85rem 1rem 0.85rem 2.8rem', border: '1.5px solid #e2e8f0', borderRadius: 'var(--radio)', fontSize: '0.95rem', background: 'white', outline: 'none', boxShadow: 'var(--sombra-sm)', boxSizing: 'border-box' },
  filtrosFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' },
  categorias: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  catBtn: { padding: '0.4rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '20px', background: 'white', color: 'var(--gris-texto)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' },
  catBtnActivo: { padding: '0.4rem 1rem', border: '1.5px solid var(--verde-oscuro)', borderRadius: '20px', background: 'var(--verde-oscuro)', color: 'white', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' },
  // Selector de moneda
  selectorMoneda: { display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'white', padding: '0.4rem 0.7rem', borderRadius: '20px', boxShadow: 'var(--sombra-sm)', border: '1.5px solid #e2e8f0' },
  selectorLabel: { fontSize: '0.9rem', marginRight: '0.2rem' },
  monedaBtn: { padding: '0.25rem 0.6rem', border: 'none', borderRadius: 99, background: 'transparent', fontSize: '0.75rem', cursor: 'pointer', color: '#666', fontWeight: 500 },
  monedaBtnActivo: { padding: '0.25rem 0.6rem', border: 'none', borderRadius: 99, background: '#1a472a', fontSize: '0.75rem', cursor: 'pointer', color: 'white', fontWeight: 700 },
  // Toast y contadores
  toast: { background: 'var(--verde-oscuro)', color: 'white', padding: '0.75rem 1.2rem', borderRadius: 'var(--radio)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500', boxShadow: 'var(--sombra-md)' },
  contador: { color: 'var(--gris-texto)', fontSize: '0.9rem', marginBottom: '1.5rem' },
  // Grid y cards
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: 'var(--radio)', overflow: 'hidden', boxShadow: 'var(--sombra-sm)', transition: 'var(--transicion)', cursor: 'pointer' },
  cardImgWrapper: { position: 'relative', height: '180px', overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardImgPlaceholder: { width: '100%', height: '100%', background: 'var(--verde-suave)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' },
  cardCategoria: { position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(255,255,255,0.95)', color: 'var(--verde-oscuro)', padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', boxShadow: 'var(--sombra-sm)' },
  cardBody: { padding: '1.2rem' },
  cardNombre: { fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--negro-suave)', marginBottom: '0.4rem' },
  cardDesc: { color: 'var(--gris-texto)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.6rem' },
  cardPrecio: { fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: '700', color: 'var(--dorado-oscuro)', margin: 0 },
  cardPrecioCOP: { fontSize: '0.72rem', color: '#aaa', margin: '0.1rem 0 0', fontStyle: 'italic' },
  cardStock: { fontSize: '0.75rem', color: 'var(--gris-texto)', marginTop: '0.1rem' },
  btnCarrito: { background: 'var(--verde-oscuro)', color: 'white', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 'var(--radio-sm)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(26,71,42,0.2)' },
  agotado: { color: '#dc2626', fontSize: '0.85rem', fontWeight: '600' },
  avisoLogin: { color: 'var(--gris-texto)', fontSize: '0.8rem', fontStyle: 'italic' },
  cardProductor: { color: 'var(--gris-texto)', fontSize: '0.78rem', borderTop: '1px solid var(--gris-claro)', paddingTop: '0.6rem', marginTop: '0.2rem' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' },
  loadingDot: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--verde-suave)', borderTop: '3px solid var(--verde-oscuro)', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: 'var(--gris-texto)', fontSize: '0.9rem' },
  vacio: { textAlign: 'center', padding: '4rem', color: 'var(--gris-texto)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  vacioIcon: { fontSize: '3rem' },
};

export default Catalogo;
