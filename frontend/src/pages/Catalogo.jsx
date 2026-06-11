import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useTipoCambio from '../api/useTipoCambio';
import { esProductoPrueba } from '../utils/productos';

const MONEDAS = [
  { codigo: 'COP', bandera: '🇨🇴', simbolo: '$' },
  { codigo: 'USD', bandera: '🇺🇸', simbolo: '$' },
  { codigo: 'EUR', bandera: '🇪🇺', simbolo: '€' },
  { codigo: 'GBP', bandera: '🇬🇧', simbolo: '£' },
];

const IMAGENES_CATEGORIA = {
  cafe: [
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  ],
  cacao: [
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1604514813560-1e4f5726db65?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=900&q=80',
  ],
  chocolate: [
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=900&q=80',
  ],
  artesanias: [
    'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=900&q=80',
  ],
  miel: [
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1577048982768-5cb3e7ddfa19?auto=format&fit=crop&w=900&q=80',
  ],
  frutas: [
    'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=80',
  ],
  lacteos: [
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80',
  ],
  panela: [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
  ],
  plantas: [
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=900&q=80',
  ],
};

const FONDO_ARTESANIA_ANCESTRAL = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520">
    <defs>
      <linearGradient id="base" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#1a472a"/>
        <stop offset="0.52" stop-color="#2d6a4f"/>
        <stop offset="1" stop-color="#f4a226"/>
      </linearGradient>
      <pattern id="beads" width="72" height="72" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="12" cy="12" r="8" fill="#fff8e7" opacity="0.92"/>
        <circle cx="36" cy="12" r="8" fill="#f4a226" opacity="0.95"/>
        <circle cx="60" cy="12" r="8" fill="#1a472a" opacity="0.92"/>
        <circle cx="24" cy="36" r="8" fill="#52b788" opacity="0.95"/>
        <circle cx="48" cy="36" r="8" fill="#fff8e7" opacity="0.9"/>
        <circle cx="12" cy="60" r="8" fill="#c47d0e" opacity="0.9"/>
        <circle cx="36" cy="60" r="8" fill="#d8f3dc" opacity="0.9"/>
        <circle cx="60" cy="60" r="8" fill="#f4a226" opacity="0.9"/>
      </pattern>
    </defs>
    <rect width="900" height="520" fill="url(#base)"/>
    <rect width="900" height="520" fill="url(#beads)" opacity="0.72"/>
    <path d="M0 390 C180 320 260 470 450 390 S720 300 900 390 V520 H0 Z" fill="#fff8e7" opacity="0.16"/>
  </svg>
`)}`;

const FONDOS_PRODUCTO = [
  {
    claves: ['chocolate artesanal', 'chocolate'],
    imagen: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=900&q=80',
  },
  {
    claves: ['pasta de cacao', 'pasta pura'],
    imagen: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80',
  },
  {
    claves: ['cacao en polvo', 'polvo de cacao'],
    imagen: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=900&q=80',
  },
  {
    claves: ['collar indigena', 'artesania', 'artesanía', 'mostacilla'],
    imagen: FONDO_ARTESANIA_ANCESTRAL,
  },
];

const normalizarTexto = (texto = '') =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const obtenerImagenCategoria = (categoria = '') => {
  const texto = normalizarTexto(categoria);
  const clave = Object.keys(IMAGENES_CATEGORIA).find((item) => texto.includes(item));
  return IMAGENES_CATEGORIA[clave] || [
    'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
  ];
};

const obtenerImagenFondoProducto = (producto) => {
  const textoNombre = normalizarTexto(producto?.nombre || '');
  const textoCategoria = normalizarTexto(producto?.categoria || '');
  const textoProducto = `${textoNombre} ${textoCategoria}`;
  const fondoEspecifico = FONDOS_PRODUCTO.find(({ claves }) =>
    claves.some((clave) => textoProducto.includes(normalizarTexto(clave)))
  );

  if (fondoEspecifico) return fondoEspecifico.imagen;

  const opciones = obtenerImagenCategoria(producto?.categoria);
  const base = `${producto?.id_producto || ''}${producto?.nombre || ''}`;
  const indice = [...base].reduce((total, caracter) => total + caracter.charCodeAt(0), 0) % opciones.length;
  return opciones[indice];
};

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
  const [imagenesConError, setImagenesConError] = useState({});

  // API externa de tipo de cambio
  const { convertir, formatearMoneda, cargando: cargandoTasa, error: errorTasa } = useTipoCambio();

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      const { data } = await API.get('/productos');
      setProductos(data.filter((producto) => !esProductoPrueba(producto)));
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
          <span style={styles.heroBadge}>Mercado local</span>
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
                  {m.codigo}
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
            {productosFiltrados.map(p => {
              const tieneImagenProducto = Boolean(p.imagen_url && !imagenesConError[p.id_producto]);

              return (
                <div
                  key={p.id_producto}
                  style={styles.card}
                  onClick={() => navigate(`/catalogo/${p.id_producto}`)}
                >
                  <div
                    style={{
                      ...styles.cardImgWrapper,
                    }}
                  >
                    <img
                      src={obtenerImagenFondoProducto(p)}
                      alt=""
                      aria-hidden="true"
                      style={styles.categoryImage}
                    />
                    <div style={styles.imageOverlay}></div>
                    <span style={styles.categoryWatermark}>{p.categoria}</span>
                    <span style={styles.cardCategoria}>{p.categoria}</span>
                    {tieneImagenProducto && (
                      <div style={styles.productImageFrame}>
                        <img
                          src={p.imagen_url}
                          alt={p.nombre}
                          style={styles.productImage}
                          onError={() => setImagenesConError(prev => ({ ...prev, [p.id_producto]: true }))}
                        />
                      </div>
                    )}
                    {!tieneImagenProducto && (
                      <div style={styles.noImageSeal}>
                        <span style={styles.noImageIcon}>🌿</span>
                        <span style={styles.noImageText}>{p.categoria}</span>
                      </div>
                    )}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'var(--crema)' },
  hero: { background: 'linear-gradient(135deg, rgba(26,71,42,0.98) 0%, rgba(45,106,79,0.96) 68%, rgba(82,183,136,0.9) 100%)', padding: '3.4rem 2.5rem 4rem', position: 'relative', overflow: 'hidden', borderBottom: '1px solid rgba(26,71,42,0.1)' },
  heroContent: { maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 },
  heroBadge: { display: 'inline-flex', width: 'fit-content', background: 'rgba(255,255,255,0.14)', color: 'white', border: '1px solid rgba(255,255,255,0.22)', padding: '0.32rem 0.8rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem' },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginBottom: '0.55rem', lineHeight: 1.08 },
  heroSub: { color: 'rgba(255,255,255,0.84)', fontSize: '1.05rem', maxWidth: '520px' },
  main: { maxWidth: '1200px', margin: '-1.75rem auto 0', padding: '0 2.5rem 2.5rem', position: 'relative', zIndex: 2 },
  filtrosBar: { marginBottom: '1.4rem', background: 'rgba(255,255,255,0.92)', border: '1px solid var(--borde-suave)', borderRadius: 'var(--radio-lg)', boxShadow: 'var(--sombra-md)', padding: '1rem', backdropFilter: 'blur(12px)' },
  searchWrapper: { position: 'relative', marginBottom: '1rem' },
  searchIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' },
  buscador: { width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', border: '1.5px solid rgba(26,71,42,0.11)', borderRadius: 'var(--radio)', fontSize: '0.95rem', background: '#fffdf9', outline: 'none', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)', boxSizing: 'border-box' },
  filtrosFila: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' },
  categorias: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  catBtn: { padding: '0.44rem 1rem', border: '1.5px solid rgba(26,71,42,0.12)', borderRadius: '999px', background: 'white', color: 'var(--gris-texto)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  catBtnActivo: { padding: '0.44rem 1rem', border: '1.5px solid var(--verde-oscuro)', borderRadius: '999px', background: 'var(--verde-oscuro)', color: 'white', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '700', boxShadow: '0 8px 18px rgba(26,71,42,0.18)' },
  // Selector de moneda
  selectorMoneda: { display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#fffdf9', padding: '0.4rem 0.7rem', borderRadius: '999px', border: '1.5px solid rgba(26,71,42,0.12)' },
  selectorLabel: { fontSize: '0.9rem', marginRight: '0.2rem' },
  monedaBtn: { padding: '0.25rem 0.6rem', border: 'none', borderRadius: 99, background: 'transparent', fontSize: '0.75rem', cursor: 'pointer', color: '#666', fontWeight: 500 },
  monedaBtnActivo: { padding: '0.25rem 0.6rem', border: 'none', borderRadius: 99, background: '#1a472a', fontSize: '0.75rem', cursor: 'pointer', color: 'white', fontWeight: 700 },
  // Toast y contadores
  toast: { background: 'var(--verde-oscuro)', color: 'white', padding: '0.75rem 1.2rem', borderRadius: 'var(--radio)', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: '500', boxShadow: 'var(--sombra-md)' },
  contador: { color: 'var(--gris-texto)', fontSize: '0.9rem', marginBottom: '1.25rem' },
  // Grid y cards
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' },
  card: { background: 'white', borderRadius: 'var(--radio)', overflow: 'hidden', boxShadow: 'var(--sombra-sm)', transition: 'var(--transicion)', cursor: 'pointer', border: '1px solid var(--borde-suave)' },
  cardImgWrapper: { position: 'relative', height: '184px', overflow: 'hidden', backgroundColor: '#d8f3dc' },
  categoryImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.95) contrast(1.02)', transform: 'scale(1.04)' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(26,71,42,0.38) 0%, rgba(26,71,42,0.14) 48%, rgba(244,162,38,0.22) 100%)' },
  categoryWatermark: { position: 'absolute', left: '1.1rem', bottom: '0.9rem', color: 'rgba(255,255,255,0.28)', fontFamily: "'Playfair Display', serif", fontSize: '2.15rem', fontWeight: 700, lineHeight: 1, maxWidth: '58%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 8px 22px rgba(0,0,0,0.22)' },
  productImageFrame: { position: 'absolute', right: '1rem', bottom: '1rem', width: '104px', height: '104px', borderRadius: '22px', background: 'rgba(255,253,249,0.94)', boxShadow: '0 18px 36px rgba(13,45,24,0.22)', border: '1px solid rgba(255,255,255,0.8)', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px' },
  noImageSeal: { position: 'absolute', right: '1rem', bottom: '1rem', minWidth: '108px', height: '96px', borderRadius: '22px', background: 'rgba(255,253,249,0.9)', boxShadow: '0 18px 36px rgba(13,45,24,0.2)', border: '1px solid rgba(255,255,255,0.8)', padding: '0.7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' },
  noImageIcon: { fontSize: '1.7rem', lineHeight: 1 },
  noImageText: { color: 'var(--verde-oscuro)', fontSize: '0.72rem', fontWeight: 800, maxWidth: '92px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardCategoria: { position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(255,255,255,0.96)', color: 'var(--verde-oscuro)', padding: '0.28rem 0.72rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700', boxShadow: 'var(--sombra-sm)' },
  cardBody: { padding: '1.25rem' },
  cardNombre: { fontFamily: "'Playfair Display', serif", fontSize: '1.18rem', color: 'var(--negro-suave)', marginBottom: '0.4rem', lineHeight: 1.2 },
  cardDesc: { color: 'var(--gris-texto)', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '0.9rem', minHeight: '2.55rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.6rem' },
  cardPrecio: { fontFamily: "'Playfair Display', serif", fontSize: '1.38rem', fontWeight: '700', color: 'var(--dorado-oscuro)', margin: 0 },
  cardPrecioCOP: { fontSize: '0.72rem', color: '#aaa', margin: '0.1rem 0 0', fontStyle: 'italic' },
  cardStock: { fontSize: '0.75rem', color: 'var(--gris-muted)', marginTop: '0.1rem' },
  btnCarrito: { background: 'var(--verde-oscuro)', color: 'white', border: 'none', padding: '0.58rem 1.05rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 10px 20px rgba(26,71,42,0.22)', whiteSpace: 'nowrap' },
  agotado: { color: '#dc2626', fontSize: '0.85rem', fontWeight: '600' },
  avisoLogin: { color: 'var(--gris-texto)', fontSize: '0.8rem', fontStyle: 'italic' },
  cardProductor: { color: 'var(--gris-muted)', fontSize: '0.78rem', borderTop: '1px solid var(--gris-claro)', paddingTop: '0.65rem', marginTop: '0.25rem' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' },
  loadingDot: { width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--verde-suave)', borderTop: '3px solid var(--verde-oscuro)', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: 'var(--gris-texto)', fontSize: '0.9rem' },
  vacio: { textAlign: 'center', padding: '4rem', color: 'var(--gris-texto)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  vacioIcon: { fontSize: '3rem' },
};

export default Catalogo;
