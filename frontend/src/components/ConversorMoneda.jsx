import { useState } from 'react';
import useTipoCambio from '../api/useTipoCambio';

/**
 * Componente reutilizable que muestra el precio de un producto
 * en COP y permite ver la conversión a otras monedas.
 * Consume la API externa: https://open.er-api.com/v6/latest/COP
 */
const MONEDAS = [
  { codigo: 'COP', nombre: 'Peso colombiano', bandera: '🇨🇴' },
  { codigo: 'USD', nombre: 'Dólar estadounidense', bandera: '🇺🇸' },
  { codigo: 'EUR', nombre: 'Euro', bandera: '🇪🇺' },
  { codigo: 'MXN', nombre: 'Peso mexicano', bandera: '🇲🇽' },
  { codigo: 'BRL', nombre: 'Real brasileño', bandera: '🇧🇷' },
  { codigo: 'GBP', nombre: 'Libra esterlina', bandera: '🇬🇧' },
];

// Versión compacta: solo el precio convertido (para tarjetas del catálogo)
export const PrecioConvertido = ({ precioCOP, moneda }) => {
  const { convertir, formatearMoneda, cargando } = useTipoCambio();

  if (moneda === 'COP') return null;
  if (cargando) return <span style={styles.cargando}>···</span>;

  const valor = convertir(precioCOP, moneda);
  if (!valor) return null;

  return (
    <span style={styles.precioExtra}>
      ≈ {formatearMoneda(valor, moneda)} {moneda}
    </span>
  );
};

// Versión completa: selector de moneda + precio convertido (para detalle de producto)
const ConversorMoneda = ({ precioCOP }) => {
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('USD');
  const { convertir, formatearMoneda, cargando, error, ultimaActualizacion } = useTipoCambio();

  const valorConvertido = monedaSeleccionada !== 'COP'
    ? convertir(precioCOP, monedaSeleccionada)
    : precioCOP;

  const monedaInfo = MONEDAS.find(m => m.codigo === monedaSeleccionada);

  return (
    <div style={styles.contenedor}>
      <div style={styles.header}>
        <span style={styles.titulo}>💱 Ver precio en otra moneda</span>
        {ultimaActualizacion && (
          <span style={styles.actualizado}>
            Tasa actualizada: {ultimaActualizacion.toLocaleDateString('es-CO')}
          </span>
        )}
      </div>

      {error ? (
        <p style={styles.errorMsg}>⚠️ No se pudo cargar el tipo de cambio</p>
      ) : (
        <>
          <div style={styles.selectorRow}>
            {MONEDAS.filter(m => m.codigo !== 'COP').map(m => (
              <button
                key={m.codigo}
                style={monedaSeleccionada === m.codigo ? styles.btnActivo : styles.btn}
                onClick={() => setMonedaSeleccionada(m.codigo)}
                title={m.nombre}
              >
                {m.bandera} {m.codigo}
              </button>
            ))}
          </div>

          <div style={styles.resultadoBox}>
            {cargando ? (
              <div style={styles.spinner}>
                <div style={styles.spinnerDot} />
                <span style={{ color: '#888', fontSize: '0.85rem' }}>Consultando tasa de cambio...</span>
              </div>
            ) : (
              <div style={styles.resultado}>
                <span style={styles.monedaIcon}>{monedaInfo?.bandera}</span>
                <div>
                  <p style={styles.valorConvertido}>
                    {formatearMoneda(valorConvertido, monedaSeleccionada)} <span style={styles.codigoMoneda}>{monedaSeleccionada}</span>
                  </p>
                  <p style={styles.referencia}>
                    = ${Number(precioCOP).toLocaleString('es-CO')} COP
                  </p>
                </div>
              </div>
            )}
          </div>

          <p style={styles.nota}>
            * Tasas de referencia vía{' '}
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer" style={styles.link}>
              ExchangeRate-API
            </a>
            . No representa tasa oficial de cambio.
          </p>
        </>
      )}
    </div>
  );
};

const C = {
  verde: '#1a472a',
  verdeS: '#e8f5e9',
  dorado: '#f4a226',
  gris: '#64748b',
  grisC: '#f1f5f9',
  blanco: '#ffffff',
};

const styles = {
  // PrecioConvertido
  cargando: { color: '#bbb', fontSize: '0.75rem' },
  precioExtra: { fontSize: '0.78rem', color: C.gris, fontStyle: 'italic', marginLeft: '0.3rem' },

  // ConversorMoneda
  contenedor: { background: C.grisC, borderRadius: 12, padding: '1.2rem 1.3rem', marginTop: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.3rem' },
  titulo: { fontSize: '0.88rem', fontWeight: 700, color: C.verde },
  actualizado: { fontSize: '0.72rem', color: C.gris },
  selectorRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem' },
  btn: { padding: '0.35rem 0.8rem', border: `1.5px solid #dde`, borderRadius: 99, background: C.blanco, fontSize: '0.78rem', cursor: 'pointer', color: C.gris, fontWeight: 500 },
  btnActivo: { padding: '0.35rem 0.8rem', border: `1.5px solid ${C.verde}`, borderRadius: 99, background: C.verde, fontSize: '0.78rem', cursor: 'pointer', color: C.blanco, fontWeight: 700 },
  resultadoBox: { background: C.blanco, borderRadius: 10, padding: '1rem 1.2rem', marginBottom: '0.75rem', minHeight: 64, display: 'flex', alignItems: 'center' },
  spinner: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  spinnerDot: { width: 22, height: 22, borderRadius: '50%', border: `3px solid ${C.verdeS}`, borderTop: `3px solid ${C.verde}`, animation: 'spin 0.8s linear infinite' },
  resultado: { display: 'flex', alignItems: 'center', gap: '1rem' },
  monedaIcon: { fontSize: '2rem' },
  valorConvertido: { margin: 0, fontSize: '1.6rem', fontWeight: 800, color: C.dorado },
  codigoMoneda: { fontSize: '0.9rem', fontWeight: 500, color: C.gris },
  referencia: { margin: '0.1rem 0 0', fontSize: '0.78rem', color: C.gris },
  nota: { fontSize: '0.71rem', color: '#aaa', margin: 0 },
  link: { color: C.gris },
  errorMsg: { color: '#dc2626', fontSize: '0.85rem', margin: 0 },
};

export default ConversorMoneda;
