const crypto = require('crypto');

const PASARELAS_VALIDAS = ['MOCK'];
const METODOS_ONLINE = ['NEQUI', 'TARJETA'];

const obtenerProveedor = () => {
  const proveedor = (process.env.PASARELA_PROVIDER || 'MOCK').toUpperCase();
  return PASARELAS_VALIDAS.includes(proveedor) ? proveedor : 'MOCK';
};

const generarReferencia = (idPedido) => {
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `MP-${idPedido}-${Date.now()}-${random}`;
};

const validarMetodoOnline = (metodo) => METODOS_ONLINE.includes(String(metodo || '').toUpperCase());

const validarDatosPago = (metodo, datosPago = {}) => {
  if (metodo === 'NEQUI') {
    const telefono = String(datosPago.telefono || '').replace(/\D/g, '');
    if (!/^3\d{9}$/.test(telefono)) {
      return { valido: false, error: 'Para pagar con Nequi debes enviar un telefono colombiano valido' };
    }
  }

  if (metodo === 'TARJETA') {
    const tokenTarjeta = datosPago.token_tarjeta || datosPago.card_token;
    const ultimos4 = String(datosPago.ultimos4 || datosPago.last4 || '').replace(/\D/g, '');

    if (!tokenTarjeta && !/^\d{4}$/.test(ultimos4)) {
      return { valido: false, error: 'Para pagar con tarjeta envia un token de tarjeta o los ultimos 4 digitos en modo prueba' };
    }
  }

  return { valido: true };
};

const crearTransaccionMock = ({ idPedido, metodo, monto }) => {
  const referencia = generarReferencia(idPedido);
  const autoAprobar = process.env.PASARELA_MOCK_AUTO_APROBAR !== 'false';
  const estado = autoAprobar ? 'APROBADO' : 'PENDIENTE';

  return {
    proveedor: 'MOCK',
    referencia,
    idTransaccion: referencia,
    estado,
    monto,
    metodo,
    checkoutUrl: null,
    requiereConfirmacion: !autoAprobar,
    mensaje: autoAprobar
      ? 'Pago aprobado en modo prueba'
      : 'Transaccion creada en modo prueba. Confirma el pago con el endpoint de confirmacion.',
  };
};

const crearTransaccion = async ({ idPedido, metodo, monto, datosPago }) => {
  const proveedor = obtenerProveedor();
  const validacion = validarDatosPago(metodo, datosPago);

  if (!validacion.valido) {
    return { ok: false, error: validacion.error };
  }

  if (proveedor === 'MOCK') {
    return { ok: true, transaccion: crearTransaccionMock({ idPedido, metodo, monto }) };
  }

  return { ok: false, error: 'Proveedor de pagos no soportado' };
};

module.exports = {
  METODOS_ONLINE,
  crearTransaccion,
  validarMetodoOnline,
};
