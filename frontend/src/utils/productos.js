const TEXTO_PRODUCTO_PRUEBA = [
  'producto notif',
  'productor notif',
  'productor test',
  'prueba de notificacion',
  'prueba funcional',
  'backend',
];

export const esProductoPrueba = (producto) => {
  const texto = [
    producto?.nombre,
    producto?.descripcion,
    producto?.productor,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return TEXTO_PRODUCTO_PRUEBA.some((patron) => texto.includes(patron));
};
