import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import axios from '../api/axios';

const libraries = ['marker'];

const defaultCenter = { lat: 0.853, lng: -76.646 }; // Putumayo, Colombia

const MapView = ({ height = '400px' }) => {
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const infowindowRef = useRef(null);
  const markerRefs = useRef({});

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    const fetchProductores = async () => {
      try {
        const response = await axios.get('/usuarios/productores');
        setProductores(response.data);
      } catch (err) {
        console.error('Error fetching productores:', err);
        setError('Error al cargar ubicaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchProductores();
  }, []);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
    
    // Crear InfoWindow una sola vez
    infowindowRef.current = new window.google.maps.InfoWindow();

    // Centrar el mapa en los productores
    if (productores.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      productores.forEach((p) => {
        bounds.extend({ lat: parseFloat(p.latitud), lng: parseFloat(p.longitud) });
      });
      mapInstance.fitBounds(bounds);
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

  if (loadError) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ color: '#666' }}>Error al cargar el mapa</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ color: '#666' }}>Cargando mapa...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ color: '#666' }}>Cargando ubicaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ color: '#666' }}>{error}</p>
      </div>
    );
  }

  if (productores.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ color: '#666' }}>No hay productores con ubicación registrada</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height, borderRadius: '8px' }}
      center={defaultCenter}
      zoom={8}
      onLoad={onMapLoad}
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
      {productores.map((productor) => (
        <Marker
          key={productor.id_usuario}
          position={{
            lat: parseFloat(productor.latitud),
            lng: parseFloat(productor.longitud),
          }}
          title={productor.nombre}
          onClick={(marker) => handleMarkerClick(productor, marker)}
        />
      ))}
    </GoogleMap>
  );
};

export default MapView;