import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultCenter = { lat: 0.853, lng: -76.646 };

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapClickHandler = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
};

const MapCenterUpdater = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 14);
    }
  }, [location, map]);

  return null;
};

const ModalMapa = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation = null,
  titulo = 'Selecciona tu ubicacion',
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  useEffect(() => {
    if (!isOpen) return;

    if (initialLocation) {
      setSelectedLocation(initialLocation);
      return;
    }

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSelectedLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {}
    );
  }, [initialLocation, isOpen]);

  const usarUbicacionActual = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition((position) => {
      setSelectedLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  const handleConfirm = () => {
    if (!selectedLocation) return;

    onSelectLocation({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{titulo}</h3>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Cerrar">
            x
          </button>
        </div>

        <div style={styles.mapContainer}>
          <MapContainer
            center={[selectedLocation?.lat || defaultCenter.lat, selectedLocation?.lng || defaultCenter.lng]}
            zoom={selectedLocation ? 14 : 8}
            style={{ width: '100%', height: '400px', borderRadius: '8px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onSelect={setSelectedLocation} />
            <MapCenterUpdater location={selectedLocation} />
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend(event) {
                    const latlng = event.target.getLatLng();
                    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
                  },
                }}
              />
            )}
          </MapContainer>
        </div>

        <div style={styles.info}>
          {selectedLocation ? (
            <p style={styles.coords}>
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
          ) : (
            <p style={styles.hint}>Haz clic en el mapa para seleccionar tu ubicacion</p>
          )}
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={usarUbicacionActual} style={styles.btnLocate}>
            Usar mi ubicacion
          </button>
          <button type="button" onClick={onClose} style={styles.btnCancel}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={selectedLocation ? styles.btnConfirm : styles.btnDisabled}
            disabled={!selectedLocation}
          >
            Confirmar ubicacion
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: 'var(--radio-lg)',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
  },
  title: {
    margin: 0,
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.25rem',
    color: 'var(--verde-oscuro)',
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    color: '#475569',
    fontWeight: 700,
  },
  mapContainer: {
    padding: '1rem',
    minHeight: '400px',
  },
  info: {
    padding: '0 1.5rem',
  },
  coords: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'var(--verde-oscuro)',
    fontWeight: '500',
  },
  hint: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.75rem',
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  btnLocate: {
    padding: '0.75rem',
    background: '#ecfdf5',
    color: 'var(--verde-oscuro)',
    border: '1px solid #bbf7d0',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '0.75rem',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnConfirm: {
    padding: '0.75rem',
    background: 'var(--verde-oscuro)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDisabled: {
    padding: '0.75rem',
    background: '#cbd5e1',
    color: '#64748b',
    border: 'none',
    borderRadius: 'var(--radio-sm)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
};

export default ModalMapa;
