import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const libraries = ['marker', 'geocoding'];

// Centro de Putumayo por defecto
const defaultCenter = { lat: 0.853, lng: -76.646 };

const ModalMapa = ({ isOpen, onClose, onSelectLocation, initialLocation = null, titulo = 'Selecciona tu ubicación' }) => {
  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [municipio, setMunicipio] = useState('');
  const [geocoding, setGeocoding] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Inicializar Geocoder cuando el mapa esté cargado
  useEffect(() => {
    if (isLoaded && !geocoding) {
      setGeocoding(new window.google.maps.Geocoder());
    }
  }, [isLoaded, geocoding]);

  // Función para obtener municipio desde coordenadas
  const obtenerMunicipio = useCallback((location) => {
    if (!geocoding || !location) return;
    
    setIsGeocoding(true);
    geocoding.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        // Buscar en los componentes de dirección
        const components = results[0].address_components;
        let municipioEncontrado = '';
        
        // Buscar en orden de prioridad: locality, administrative_area_level_2, administrative_area_level_1
        for (const component of components) {
          if (component.types.includes('locality')) {
            municipioEncontrado = component.long_name;
            break;
          } else if (component.types.includes('administrative_area_level_2')) {
            municipioEncontrado = component.long_name;
            break;
          } else if (component.types.includes('administrative_area_level_1')) {
            municipioEncontrado = component.long_name;
            break;
          }
        }
        
        if (municipioEncontrado) {
          setMunicipio(municipioEncontrado);
        } else {
          // Si no encuentra, usar la primera parte del formatted_address
          const formatted = results[0].formatted_address;
          const fallback = formatted ? formatted.split(',')[0].trim() : '';
          setMunicipio(fallback);
          console.log('Municipio encontrado:', fallback, 'desde formatted_address');
        }
      } else {
        console.error('Geocoding failed:', status);
        setMunicipio('');
      }
      setIsGeocoding(false);
    });
  }, [geocoding]);

  let geocoder = null;

  useEffect(() => {
    if (isOpen && initialLocation) {
      setMarkerPosition(initialLocation);
      setSelectedLocation(initialLocation);
      // Obtener municipio para la ubicación inicial
      if (geocoding) {
        obtenerMunicipio(initialLocation);
      }
    } else if (isOpen && !initialLocation) {
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setMarkerPosition(currentPos);
            setSelectedLocation(currentPos);
            // Obtener municipio para la ubicación actual
            if (geocoding) {
              obtenerMunicipio(currentPos);
            }
          },
          () => {
            // If geolocation fails, use default
            console.log('Geolocation not available, using default');
          }
        );
      }
    }
  }, [isOpen, initialLocation, geocoding, obtenerMunicipio]);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
    
    // Centrar el mapa en la ubicación inicial si existe
    if (markerPosition) {
      mapInstance.setCenter(markerPosition);
      mapInstance.setZoom(14);
    }
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const newPosition = { lat, lng };
    setMarkerPosition(newPosition);
    setSelectedLocation(newPosition);
    setMunicipio('');
    setIsGeocoding(true);
    // Reverse geocoding para obtener municipio
    if (geocoding) {
      geocoding.geocode({ location: newPosition }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const components = results[0].address_components;
          let municipioEncontrado = '';
          
          // Buscar en orden de prioridad
          for (const component of components) {
            if (component.types.includes('locality')) {
              municipioEncontrado = component.long_name;
              break;
            } else if (component.types.includes('administrative_area_level_2')) {
              municipioEncontrado = component.long_name;
              break;
            } else if (component.types.includes('administrative_area_level_1')) {
              municipioEncontrado = component.long_name;
              break;
            }
          }
          
          if (municipioEncontrado) {
            setMunicipio(municipioEncontrado);
          } else {
            const formatted = results[0].formatted_address;
            setMunicipio(formatted ? formatted.split(',')[0].trim() : '');
          }
        } else {
          console.error('Geocoding failed:', status);
          setMunicipio('');
        }
        setIsGeocoding(false);
      });
    } else {
      setIsGeocoding(false);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      // Devolver también el municipio encontrado
      onSelectLocation({ 
        lat: selectedLocation.lat, 
        lng: selectedLocation.lng,
        municipio: municipio 
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{titulo}</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.mapContainer}>
          {loadError && (
            <div style={styles.error}>Error al cargar el mapa. Verifica tu conexión.</div>
          )}
          
          {!isLoaded && !loadError && (
            <div style={styles.loading}>Cargando mapa...</div>
          )}

          {isLoaded && !loadError && (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '8px' }}
              center={selectedLocation || defaultCenter}
              zoom={selectedLocation ? 14 : 8}
              onLoad={onMapLoad}
              onClick={handleMapClick}
              options={{
                styles: [
                  {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }],
                  },
                ],
              }}
            >
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={(event) => {
                    const lat = event.latLng.lat();
                    const lng = event.latLng.lng();
                    const newPos = { lat, lng };
                    setMarkerPosition(newPos);
                    setSelectedLocation(newPos);
                    setMunicipio('');
                    setIsGeocoding(true);
                    // Reverse geocoding al arrastrar
                    if (geocoding) {
                      geocoding.geocode({ location: newPos }, (results, status) => {
                        if (status === 'OK' && results[0]) {
                          const components = results[0].address_components;
                          let municipioEncontrado = '';
                          
                          // Buscar en orden de prioridad
                          for (const component of components) {
                            if (component.types.includes('locality')) {
                              municipioEncontrado = component.long_name;
                              break;
                            } else if (component.types.includes('administrative_area_level_2')) {
                              municipioEncontrado = component.long_name;
                              break;
                            } else if (component.types.includes('administrative_area_level_1')) {
                              municipioEncontrado = component.long_name;
                              break;
                            }
                          }
                          
                          if (municipioEncontrado) {
                            setMunicipio(municipioEncontrado);
                          } else {
                            const formatted = results[0].formatted_address;
                            setMunicipio(formatted ? formatted.split(',')[0].trim() : '');
                          }
                        } else {
                          console.error('Geocoding failed:', status);
                          setMunicipio('');
                        }
                        setIsGeocoding(false);
                      });
                    } else {
                      setIsGeocoding(false);
                    }
                  }}
                />
              )}
            </GoogleMap>
          )}
        </div>

        <div style={styles.info}>
          {selectedLocation ? (
            <p style={styles.coords}>
              📍 Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              {municipio && <span style={styles.municipio}> | 🏙️ {municipio}</span>}
              {isGeocoding && <span style={styles.loadingText}> | 🔄 Obteniendo municipio...</span>}
            </p>
          ) : (
            <p style={styles.hint}>Haz clic en el mapa para seleccionar tu ubicación</p>
          )}
        </div>

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.btnCancel}>
            Cancelar
          </button>
          <button 
            onClick={handleConfirm} 
            style={(selectedLocation && !isGeocoding) ? styles.btnConfirm : styles.btnDisabled}
            disabled={!selectedLocation || isGeocoding}
          >
            {isGeocoding ? 'Cargando...' : 'Confirmar ubicación'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
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
    color: '#1a4732',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.25rem',
    lineHeight: 1,
  },
  mapContainer: {
    padding: '1rem',
    minHeight: '400px',
  },
  loading: {
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    color: '#666',
  },
  error: {
    height: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    color: '#dc2626',
  },
  info: {
    padding: '0 1.5rem',
  },
  coords: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#1a4732',
    fontWeight: '500',
  },
  municipio: {
    color: '#059669',
    fontWeight: '600',
  },
  loadingText: {
    color: '#f59e0b',
    fontWeight: '500',
  },
  hint: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748b',
    fontStyle: 'italic',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  btnCancel: {
    flex: 1,
    padding: '0.75rem',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnConfirm: {
    flex: 1,
    padding: '0.75rem',
    background: '#1a4732',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDisabled: {
    flex: 1,
    padding: '0.75rem',
    background: '#cbd5e1',
    color: '#94a3b8',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'not-allowed',
  },
};

export default ModalMapa;