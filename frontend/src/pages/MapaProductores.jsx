import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const defaultCenter = { lat: 0.853, lng: -76.646 };

const greenIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const toLocation = (item) => {
  const lat = Number.parseFloat(item?.latitud);
  const lng = Number.parseFloat(item?.longitud);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
};

const MapClickHandler = ({ enabled, onSelect }) => {
  useMapEvents({
    click(event) {
      if (!enabled) return;
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

const FitMapBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    const validLocations = locations.filter(Boolean);
    if (validLocations.length === 0) {
      map.setView([defaultCenter.lat, defaultCenter.lng], 8);
      return;
    }

    const bounds = L.latLngBounds(validLocations.map((location) => [location.lat, location.lng]));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
  }, [locations, map]);

  return null;
};

const MapaProductores = () => {
  const { usuario } = useAuth();
  const isProductor = usuario?.rol === 'PRODUCTOR';
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const productoresValidos = useMemo(
    () => productores.map((productor) => ({ productor, location: toLocation(productor) })).filter((item) => item.location),
    [productores]
  );

  const mapLocations = useMemo(
    () => [...productoresValidos.map(({ location }) => location), miUbicacion].filter(Boolean),
    [miUbicacion, productoresValidos]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');

        const requests = [API.get('/usuarios/productores')];
        if (isProductor) requests.push(API.get('/usuarios/perfil'));

        const [productoresRes, perfilRes] = await Promise.all(requests);
        setProductores(Array.isArray(productoresRes.data) ? productoresRes.data : []);

        if (perfilRes?.data) {
          const location = toLocation(perfilRes.data);
          if (location) setMiUbicacion(location);
        }
      } catch (err) {
        console.error('Error al cargar mapa:', err);
        setError(err.response?.data?.error || 'Error al cargar ubicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isProductor]);

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) {
      setMensaje('Error: geolocalizacion no soportada en este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMiUbicacion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setMensaje('');
      },
      () => {
        setMensaje('Error: no se pudo obtener tu ubicacion');
      }
    );
  };

  const guardarUbicacion = async () => {
    if (!miUbicacion) return;

    setSaving(true);
    setMensaje('');
    try {
      await API.put('/usuarios/ubicacion', {
        latitud: miUbicacion.lat,
        longitud: miUbicacion.lng,
      });
      setMensaje('Ubicacion guardada correctamente');
      setEditMode(false);
    } catch (err) {
      console.error('Error al guardar ubicacion:', err);
      setMensaje(`Error: ${err.response?.data?.error || 'Error al guardar ubicacion'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <p style={styles.kicker}>Productores locales</p>
          <h1 style={styles.title}>Mapa de productores</h1>
          <p style={styles.subtitle}>Encuentra productores registrados con ubicacion en Putumayo.</p>
        </div>
        <div style={styles.counter}>
          <strong>{productoresValidos.length}</strong>
          <span>ubicaciones</span>
        </div>
      </section>

      {isProductor && (
        <section style={styles.panel}>
          {!editMode ? (
            <div style={styles.editRow}>
              <div>
                <h2 style={styles.panelTitle}>Mi ubicacion</h2>
                <p style={styles.panelText}>
                  {miUbicacion
                    ? `Lat ${miUbicacion.lat.toFixed(5)}, Lng ${miUbicacion.lng.toFixed(5)}`
                    : 'Aun no tienes una ubicacion registrada.'}
                </p>
              </div>
              <button type="button" onClick={() => setEditMode(true)} style={styles.primaryButton}>
                {miUbicacion ? 'Cambiar ubicacion' : 'Establecer ubicacion'}
              </button>
            </div>
          ) : (
            <div>
              <h2 style={styles.panelTitle}>Selecciona tu punto en el mapa</h2>
              <p style={styles.panelText}>Haz clic en el mapa, arrastra el marcador o usa la ubicacion del navegador.</p>
              {miUbicacion && (
                <p style={styles.coords}>Lat {miUbicacion.lat.toFixed(6)}, Lng {miUbicacion.lng.toFixed(6)}</p>
              )}
              <div style={styles.actions}>
                <button type="button" onClick={usarUbicacionActual} style={styles.secondaryButton}>
                  Usar mi ubicacion
                </button>
                <button type="button" onClick={guardarUbicacion} style={styles.primaryButton} disabled={saving || !miUbicacion}>
                  {saving ? 'Guardando...' : 'Guardar ubicacion'}
                </button>
                <button type="button" onClick={() => setEditMode(false)} style={styles.secondaryButton}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {mensaje && <div style={mensaje.includes('Error') ? styles.errorBox : styles.successBox}>{mensaje}</div>}
        </section>
      )}

      <section style={styles.mapPanel}>
        {loading ? (
          <div style={styles.mapState}>Cargando ubicaciones...</div>
        ) : error ? (
          <div style={styles.mapState}>{error}</div>
        ) : (
          <MapContainer
            center={[miUbicacion?.lat || defaultCenter.lat, miUbicacion?.lng || defaultCenter.lng]}
            zoom={miUbicacion ? 12 : 8}
            style={{ width: '100%', height: '520px', borderRadius: '8px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitMapBounds locations={mapLocations} />
            <MapClickHandler enabled={editMode && isProductor} onSelect={setMiUbicacion} />

            {productoresValidos.map(({ productor, location }) => (
              <Marker key={productor.id_usuario} position={[location.lat, location.lng]} icon={greenIcon}>
                <Popup>
                  <div style={styles.infoWindow}>
                    <strong>{productor.nombre}</strong>
                    <span>{productor.municipio || 'Municipio no especificado'}</span>
                    <span>{productor.telefono || 'Telefono no disponible'}</span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {miUbicacion && isProductor && (
              <Marker
                position={[miUbicacion.lat, miUbicacion.lng]}
                icon={blueIcon}
                draggable={editMode}
                eventHandlers={{
                  dragend(event) {
                    const latlng = event.target.getLatLng();
                    setMiUbicacion({ lat: latlng.lat, lng: latlng.lng });
                  },
                }}
              >
                <Popup>Mi ubicacion</Popup>
              </Marker>
            )}
          </MapContainer>
        )}
      </section>

      <section style={styles.grid}>
        {productoresValidos.length === 0 && !loading ? (
          <div style={styles.empty}>No hay productores con ubicacion registrada aun.</div>
        ) : (
          productoresValidos.map(({ productor }) => (
            <article key={productor.id_usuario} style={styles.card}>
              <h3 style={styles.cardTitle}>{productor.nombre}</h3>
              <p style={styles.cardText}>{productor.municipio || 'Municipio no especificado'}</p>
              <p style={styles.cardText}>{productor.telefono || 'Telefono no disponible'}</p>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 72px)',
    background: 'var(--crema)',
    padding: '2rem',
  },
  header: {
    maxWidth: '1180px',
    margin: '0 auto 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: '1rem',
  },
  kicker: {
    margin: '0 0 0.3rem',
    color: 'var(--verde-medio)',
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    color: 'var(--verde-oscuro)',
    fontFamily: "'Playfair Display', serif",
    fontSize: '2rem',
  },
  subtitle: {
    margin: '0.4rem 0 0',
    color: 'var(--gris-texto)',
  },
  counter: {
    minWidth: '126px',
    background: 'white',
    border: '1px solid var(--borde-suave)',
    borderRadius: 'var(--radio-md)',
    padding: '0.8rem 1rem',
    textAlign: 'center',
    boxShadow: 'var(--sombra-sm)',
  },
  panel: {
    maxWidth: '1180px',
    margin: '0 auto 1rem',
    background: 'white',
    border: '1px solid var(--borde-suave)',
    borderRadius: 'var(--radio-md)',
    padding: '1rem',
    boxShadow: 'var(--sombra-sm)',
  },
  editRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  panelTitle: {
    margin: '0 0 0.25rem',
    color: 'var(--verde-oscuro)',
    fontSize: '1rem',
  },
  panelText: {
    margin: 0,
    color: 'var(--gris-texto)',
    fontSize: '0.92rem',
  },
  coords: {
    margin: '0.7rem 0 0',
    color: 'var(--verde-oscuro)',
    fontWeight: 600,
    fontSize: '0.88rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '0.9rem',
  },
  primaryButton: {
    padding: '0.75rem 1rem',
    background: 'var(--verde-oscuro)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radio-sm)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.75rem 1rem',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 'var(--radio-sm)',
    fontWeight: 700,
    cursor: 'pointer',
  },
  successBox: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    borderRadius: 'var(--radio-sm)',
    background: '#f0fdf4',
    color: 'var(--verde-oscuro)',
    border: '1px solid #bbf7d0',
  },
  errorBox: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    borderRadius: 'var(--radio-sm)',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  mapPanel: {
    maxWidth: '1180px',
    margin: '0 auto 1.25rem',
    background: 'white',
    border: '1px solid var(--borde-suave)',
    borderRadius: 'var(--radio-md)',
    padding: '0.75rem',
    boxShadow: 'var(--sombra-md)',
  },
  mapState: {
    height: '520px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
    borderRadius: '8px',
    color: '#64748b',
  },
  infoWindow: {
    display: 'grid',
    gap: '0.25rem',
    color: '#334155',
    minWidth: '180px',
  },
  grid: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'white',
    border: '1px solid var(--borde-suave)',
    borderRadius: 'var(--radio-md)',
    padding: '1rem',
    boxShadow: 'var(--sombra-sm)',
  },
  cardTitle: {
    margin: '0 0 0.5rem',
    color: 'var(--verde-oscuro)',
    fontSize: '1rem',
  },
  cardText: {
    margin: '0.25rem 0',
    color: 'var(--gris-texto)',
    fontSize: '0.9rem',
  },
  empty: {
    gridColumn: '1 / -1',
    background: 'white',
    border: '1px solid var(--borde-suave)',
    borderRadius: 'var(--radio-md)',
    padding: '1rem',
    color: 'var(--gris-texto)',
  },
};

export default MapaProductores;
