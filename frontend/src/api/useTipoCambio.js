import { useState, useEffect } from 'react';

/**
 * Hook que consume la API externa de tipo de cambio:
 * https://open.er-api.com/v6/latest/COP
 *
 * API gratuita, sin API key requerida.
 * Retorna tasas de cambio con COP como moneda base.
 */
const useTipoCambio = () => {
  const [tasas, setTasas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  useEffect(() => {
    const CACHE_KEY = 'market_tasas_cambio';
    const CACHE_TTL = 60 * 60 * 1000; // 1 hora en ms

    const cargarTasas = async () => {
      try {
        // Revisar caché local para no exceder límites de la API
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setTasas(data.rates);
            setUltimaActualizacion(new Date(data.time_last_update_utc));
            setCargando(false);
            return;
          }
        }

        // Llamada a la API externa (gratuita, sin key)
        const response = await fetch('https://open.er-api.com/v6/latest/COP');
        if (!response.ok) throw new Error('Error al consultar tipo de cambio');

        const data = await response.json();

        if (data.result !== 'success') throw new Error('Respuesta inválida de la API');

        // Guardar en caché
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));

        setTasas(data.rates);
        setUltimaActualizacion(new Date(data.time_last_update_utc));
      } catch (err) {
        console.error('Error al cargar tipo de cambio:', err);
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarTasas();
  }, []);

  /**
   * Convierte un valor en COP a la moneda indicada
   * @param {number} valorCOP
   * @param {string} moneda - ej: 'USD', 'EUR', 'MXN'
   * @returns {string} valor formateado con símbolo
   */
  const convertir = (valorCOP, moneda) => {
    if (!tasas || !tasas[moneda]) return null;
    const convertido = valorCOP * tasas[moneda];
    return convertido;
  };

  const formatearMoneda = (valor, moneda) => {
    if (valor === null || valor === undefined) return '—';
    const simbolos = { USD: '$', EUR: '€', MXN: '$', BRL: 'R$', GBP: '£', COP: '$' };
    const simbolo = simbolos[moneda] || moneda + ' ';
    return `${simbolo}${valor.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return { tasas, cargando, error, ultimaActualizacion, convertir, formatearMoneda };
};

export default useTipoCambio;
