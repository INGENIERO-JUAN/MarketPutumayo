const OpenAI = require('openai');

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn('⚠️ OPENAI_API_KEY no definido. La moderación de productos está deshabilitada.');
}

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const construirEntradasModeracion = ({ nombre, descripcion, imagen_url }) => {
  const entradas = [];
  const texto = [nombre, descripcion].filter(Boolean).join('\n').trim();

  if (texto) {
    entradas.push(texto);
  }

  if (imagen_url) {
    entradas.push({ type: 'image', image_url: imagen_url });
  }

  return entradas;
};

const extraerCategorias = (resultado) => {
  const categorias = resultado.categories || {};
  return Object.keys(categorias).filter((clave) => categorias[clave]);
};

const evaluarProducto = async ({ nombre, descripcion, imagen_url }) => {
  const entradas = construirEntradasModeracion({ nombre, descripcion, imagen_url });

  if (entradas.length === 0) {
    return { flagged: false, reasons: [], raw: null };
  }

  if (!openai) {
    return { flagged: false, reasons: [], raw: null };
  }

  let respuesta;
  try {
    respuesta = await openai.moderations.create({
      model: 'omni-moderation-latest',
      input: entradas
    });
  } catch (error) {
    // Si la moderación de imagen falla, intentamos moderar solo el texto.
    if (imagen_url) {
      const soloTexto = [nombre, descripcion].filter(Boolean).join('\n').trim();
      if (!soloTexto) {
        throw error;
      }

      respuesta = await openai.moderations.create({
        model: 'omni-moderation-latest',
        input: soloTexto
      });
    } else {
      throw error;
    }
  }

  const resultados = respuesta?.data?.results || respuesta?.results || [];
  const reasons = [];
  let flagged = false;

  resultados.forEach((item, index) => {
    if (item?.flagged) {
      flagged = true;
      reasons.push({
        index,
        inputType: typeof entradas[index] === 'string' ? 'texto' : 'imagen',
        categories: extraerCategorias(item)
      });
    }
  });

  return { flagged, reasons, raw: resultados };
};

module.exports = {
  evaluarProducto
};
