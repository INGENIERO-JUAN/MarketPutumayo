import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader, StandaloneSearchBox } from '@react-google-maps/api';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const libraries = ['places', 'marker'];

const defaultCenter = { lat: 0.853, lng: -76.646 }; // Putumayo, Colombia

const MapaProductores = () => {
  const { usuario } = useAuth();
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [miUbicacion, setMiUbicacion] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchBox, setSearchBox] = useState(null);
  const infowindowRef = useRef(null);
  const markerRefs = useRef({});

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const isProductor = usuario?.rol === 'PRODUCTOR';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Si es productor, obtener su ubicación actual
        if (isProductor) {
          const perfilRes = await axios.get('/usuarios/perfil');
          if (perfilRes.data.latitud && perfilRes.data.longitud) {
            const lat = parseFloat(perfilRes.data.latitud);
            const lng = parseFloat(perfilRes.data.longitud);
            if (!isNaN(lat) && !isNaN(lng)) {
              setMiUbicacion({
                lat,
                lng,
              });
            }
          }
        }

        // Obtener todos los productores con ubicación
        const response = await axios.get('/usuarios/productores');
        console.log('Productores obtenidos:', response.data);
        const validData = response.data.filter(p => {
          const lat = parseFloat(p.latitud);
          const lng = parseFloat(p.longitud);
          return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
        });
        console.log('Productores válidos:', validData.length, 'de', response.data.length);
        setProductores(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isProductor]);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
    infowindowRef.current = new window.google.maps.InfoWindow();

    if (productores.length > 0) {
      const validProductores = productores.filter(p => {
        const lat = parseFloat(p.latitud);
        const lng = parseFloat(p.longitud);
        return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
      });
      if (validProductores.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        validProductores.forEach((p) => {
          bounds.extend({ lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) });
        });
        if (miUbicacion) {
          bounds.extend(miUbicacion);
        }
        console.log('Bounds calculados:', bounds);
        mapInstance.fitBounds(bounds);
        // Asegurar un zoom mínimo
        const listener = window.google.maps.event.addListener(mapInstance, 'idle', () => {
          if (mapInstance.getZoom() > 12) {
            mapInstance.setZoom(12);
          }
          window.google.maps.event.removeListener(listener);
        });
      } else {
        console.log('No hay productores con coordenadas válidas, centrando en Putumayo');
        mapInstance.setCenter(defaultCenter);
        mapInstance.setZoom(8);
      }
    } else {
      console.log('No hay productores con ubicación, centrando en Putumayo');
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(8);
    }
  };

  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  const handlePlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setMiUbicacion({ lat, lng });
          
          // Centrar el mapa en la nueva ubicación
          if (map) {
            map.setCenter(newLocation);
            map.setZoom(14);
          }
        }
      }
    }
  };

  const handleMarkerClick = (productor, marker) => {
    if (infowindowRef.current && marker) {
      infowindowRef.current.setContent(`
        <div style="padding: 8px; max-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #333;">${productor.nombre}</h4>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">
            <strong>Municipio:</strong> ${productor.municipio || 'No especificado'}
          </p>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">
            <strong>Teléfono:</strong> ${productor.telefono || 'No disponible'}
          </p>
        </div>
      `);
      infowindowRef.current.open({
        anchor: marker,
        map,
      });
    }
  };

  const guardarUbicacion = async () => {
    if (!miUbicacion) return;

    try {
      await axios.put('/usuarios/ubicacion', {
        latitud: miUbicacion.lat,
        longitud: miUbicacion.lng
      });
      alert('Ubicación guardada exitosamente');
      setEditMode(false);
    } catch (err) {
      console.error('Error saving location:', err);
      alert('Error al guardar ubicación');
    }
  };

  if (loadError) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ color: '#666' }}>Error al cargar el mapa</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ color: '#666' }}>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <p style={{ color: '#666' }}>Cargando ubicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>📍 Mapa de Productores ({productores.length} ubicaciones)</h2>
      
      {isProductor && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          {!editMode ? (
            <button 
              onClick={() => setEditMode(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              📍 {miUbicacion ? 'Cambiar mi ubicación' : 'Establecer mi ubicación'}
            </button>
          ) : (
            <div>
              <p style={{ marginBottom: '10px' }}>🔍 Busca tu ubicación o haz clic en el mapa para colocarla</p>
              <StandaloneSearchBox
                onLoad={onSearchBoxLoad}
                onPlacesChanged={handlePlacesChanged}
              >
                <input
                  type="text"
                  placeholder="Buscar ubicación..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              </StandaloneSearchBox>
              {miUbicacion && (
                <p style={{ marginBottom: '10px', color: '#666' }}>
                  Ubicación actual: {miUbicacion.lat.toFixed(6)}, {miUbicacion.lng.toFixed(6)}
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={guardarUbicacion}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  💾 Guardar ubicación
                </button>
                <button 
                  onClick={() => setEditMode(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {productores.length === 0 && !loading && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#856404' }}>⚠️ No hay productores con ubicación registrada aún. ¡Regístrate como productor y agrega tu ubicación!</p>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px', borderRadius: '8px' }}
        center={miUbicacion || defaultCenter}
        zoom={miUbicacion ? 12 : 8}
        onLoad={onMapLoad}
        onClick={(e) => {
          if (editMode && isProductor) {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setMiUbicacion({ lat, lng });
            }
          }}
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
          {/* Marcadores de productores */}
          {productores
            .filter(productor => {
              const lat = parseFloat(productor.latitud);
              const lng = parseFloat(productor.longitud);
              return !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng);
            })
            .map((productor) => {
              const lat = parseFloat(productor.latitud);
              const lng = parseFloat(productor.longitud);
              console.log(`Mostrando marcador para ${productor.nombre}: lat=${lat}, lng=${lng}`);
              return (
                <Marker
                  key={productor.id_usuario}
                  position={{
                    lat,
                    lng,
                  }}
                  title={productor.nombre}
                  onClick={(marker) => handleMarkerClick(productor, marker)}
                />
              );
            })}

          {/* Mi ubicación (si es productor) */}
          {miUbicacion && isProductor && (
            <Marker
              position={miUbicacion}
              title="Mi ubicación"
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />
          )}
        </GoogleMap>
      

      <div style={{ marginTop: '20px' }}>
        <h3>Productores ({productores.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
          {productores.map((p) => (
            <div key={p.id_usuario} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{p.nombre}</h4>
              <p style={{ margin: '5px 0', color: '#666' }}>📍 {p.municipio || 'Municipio no especificado'}</p>
              <p style={{ margin: '5px 0', color: '#666' }}>📞 {p.telefono || 'Teléfono no disponible'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapaProductores;