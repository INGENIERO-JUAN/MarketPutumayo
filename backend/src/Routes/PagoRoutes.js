const express = require('express');
const router = express.Router();
const pool = require('../Config/db');
const { verificarToken, verificarRol } = require('../Middleware/authMiddleware');
const { crearTransaccion, validarMetodoOnline } = require('../Utils/pasarelaPagos');

const notificarPagoAProductores = async (idPedido) => {
  const [productores] = await pool.query(
    `SELECT DISTINCT pr.id_productor, pe.total
     FROM pedidos pe
     JOIN detalle_pedido dp ON pe.id_pedido = dp.id_pedido
     JOIN productos pr ON dp.id_producto = pr.id_producto
     WHERE pe.id_pedido = ?`,
    [idPedido]
  );

  for (const productor of productores) {
    await pool.query(
      `INSERT INTO notificaciones (id_usuario, tipo, mensaje)
       VALUES (?, 'PAGO', ?)`,
      [
        productor.id_productor,
        `Se registro un pago del pedido #${idPedido} por $${Number(productor.total).toLocaleString('es-CO')}.`
      ]
    );
  }
};

const aprobarPago = async (idPago, idPedido) => {
  await pool.query(
    'UPDATE pagos SET estado = "APROBADO" WHERE id_pago = ?',
    [idPago]
  );

  await pool.query(
    'UPDATE pedidos SET estado = "PAGADO" WHERE id_pedido = ?',
    [idPedido]
  );

  await notificarPagoAProductores(idPedido);
};

// POST /api/pagos - Registrar pago de un pedido
router.post('/', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  try {
    const { id_pedido, metodo, referencia, monto } = req.body;

    if (!id_pedido || !metodo || !monto) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const metodosValidos = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'NEQUI', 'DAVIPLATA'];
    if (!metodosValidos.includes(metodo)) {
      return res.status(400).json({ error: 'Método de pago inválido' });
    }

    // Verificar que el pedido pertenece al comprador
    const [pedidos] = await pool.query(
      'SELECT id_pedido, estado FROM pedidos WHERE id_pedido = ? AND id_comprador = ?',
      [id_pedido, req.usuario.id_usuario]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedidos[0].estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'El pedido ya fue pagado o cancelado' });
    }

    // Registrar el pago
    const [resultado] = await pool.query(
      'INSERT INTO pagos (id_pedido, metodo, referencia, monto) VALUES (?, ?, ?, ?)',
      [id_pedido, metodo, referencia || null, monto]
    );

    await aprobarPago(resultado.insertId, id_pedido);

    res.status(201).json({
      mensaje: 'Pago registrado exitosamente',
      id_pago: resultado.insertId
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/pagos/pasarela - Crear pago online simulado para NEQUI o TARJETA
router.post('/pasarela', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  try {
    const { id_pedido, metodo, datos_pago } = req.body;
    const metodoNormalizado = String(metodo || '').toUpperCase();

    if (!id_pedido || !metodoNormalizado) {
      return res.status(400).json({ error: 'id_pedido y metodo son requeridos' });
    }

    if (!validarMetodoOnline(metodoNormalizado)) {
      return res.status(400).json({ error: 'La pasarela solo soporta NEQUI o TARJETA' });
    }

    const [pedidos] = await pool.query(
      'SELECT id_pedido, total, estado FROM pedidos WHERE id_pedido = ? AND id_comprador = ?',
      [id_pedido, req.usuario.id_usuario]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = pedidos[0];
    if (pedido.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'El pedido ya fue pagado o cancelado' });
    }

    const [pagosExistentes] = await pool.query(
      `SELECT id_pago, estado, referencia, monto
       FROM pagos
       WHERE id_pedido = ? AND estado IN ('PENDIENTE', 'APROBADO')
       ORDER BY fecha DESC
       LIMIT 1`,
      [id_pedido]
    );

    if (pagosExistentes.length > 0) {
      return res.status(409).json({
        error: 'El pedido ya tiene un pago pendiente o aprobado',
        pago: pagosExistentes[0],
      });
    }

    const resultadoPasarela = await crearTransaccion({
      idPedido: id_pedido,
      metodo: metodoNormalizado,
      monto: Number(pedido.total),
      datosPago: datos_pago || {},
    });

    if (!resultadoPasarela.ok) {
      return res.status(400).json({ error: resultadoPasarela.error });
    }

    const transaccion = resultadoPasarela.transaccion;
    const [resultado] = await pool.query(
      `INSERT INTO pagos (id_pedido, metodo, estado, referencia, monto, proveedor, transaccion_id, checkout_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_pedido,
        metodoNormalizado,
        transaccion.estado,
        transaccion.referencia,
        pedido.total,
        transaccion.proveedor,
        transaccion.idTransaccion,
        transaccion.checkoutUrl,
      ]
    );

    if (transaccion.estado === 'APROBADO') {
      await aprobarPago(resultado.insertId, id_pedido);
    }

    res.status(201).json({
      mensaje: transaccion.mensaje,
      id_pago: resultado.insertId,
      id_pedido,
      metodo: metodoNormalizado,
      estado: transaccion.estado,
      referencia: transaccion.referencia,
      checkout_url: transaccion.checkoutUrl,
      requiere_confirmacion: transaccion.requiereConfirmacion,
    });
  } catch (error) {
    console.error('Error al crear pago en pasarela:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// POST /api/pagos/pasarela/:id_pago/confirmar - Confirmar pago pendiente en modo prueba
router.post('/pasarela/:id_pago/confirmar', verificarToken, verificarRol('COMPRADOR'), async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT p.id_pago, p.id_pedido, p.estado, p.metodo, pe.id_comprador
       FROM pagos p
       JOIN pedidos pe ON p.id_pedido = pe.id_pedido
       WHERE p.id_pago = ? AND pe.id_comprador = ?`,
      [req.params.id_pago, req.usuario.id_usuario]
    );

    if (pagos.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    const pago = pagos[0];
    if (pago.estado === 'APROBADO') {
      return res.json({ mensaje: 'El pago ya estaba aprobado', id_pago: pago.id_pago, estado: pago.estado });
    }

    if (pago.estado !== 'PENDIENTE') {
      return res.status(400).json({ error: 'Solo se pueden confirmar pagos pendientes' });
    }

    await aprobarPago(pago.id_pago, pago.id_pedido);

    res.json({
      mensaje: 'Pago confirmado exitosamente en modo prueba',
      id_pago: pago.id_pago,
      estado: 'APROBADO',
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pagos/:id_pedido - Ver pago de un pedido
router.get('/:id_pedido', verificarToken, async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT p.id_pago, p.metodo, p.estado, p.referencia, p.monto,
              p.proveedor, p.transaccion_id, p.checkout_url, p.fecha
       FROM pagos p
       JOIN pedidos pe ON p.id_pedido = pe.id_pedido
       WHERE p.id_pedido = ? AND (pe.id_comprador = ? OR ? = 'ADMIN')`,
      [req.params.id_pedido, req.usuario.id_usuario, req.usuario.rol]
    );

    if (pagos.length === 0) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(pagos[0]);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// GET /api/pagos - Listar todos los pagos (solo ADMIN)
router.get('/', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const [pagos] = await pool.query(
      `SELECT p.id_pago, p.metodo, p.estado, p.referencia, p.monto,
              p.proveedor, p.transaccion_id, p.fecha,
              pe.id_pedido, u.nombre AS comprador
       FROM pagos p
       JOIN pedidos pe ON p.id_pedido = pe.id_pedido
       JOIN usuarios u ON pe.id_comprador = u.id_usuario
       ORDER BY p.fecha DESC`
    );
    res.json(pagos);
  } catch (error) {
    console.error('Error al listar pagos:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
