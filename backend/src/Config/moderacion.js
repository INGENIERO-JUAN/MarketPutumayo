const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Modera un producto usando IA.
 * Devuelve { decision: 'APROBADO' | 'RECHAZADO', razon: string }
 */
const moderarProducto = async ({ nombre, descripcion, precio, categoria }) => {
  const prompt = `Eres el moderador automático de MarketPutumayo, un marketplace colombiano de productos locales del departamento del Putumayo. Tu trabajo es revisar productos que los productores quieren publicar y decidir si son apropiados.

PRODUCTO A REVISAR:
- Nombre: ${nombre}
- Descripción: ${descripcion || '(sin descripción)'}
- Precio: $${precio} COP
- Categoría: ${categoria || '(sin categoría)'}

CRITERIOS PARA RECHAZAR:
1. Spam o contenido sin sentido (nombres como "asdfgh", "test123", "prueba")
2. Productos ilegales (drogas, armas, contrabando)
3. Precio claramente absurdo (menor a $100 COP o mayor a $100.000.000 COP)
4. Contenido ofensivo, discriminatorio o inapropiado
5. Nombre o descripción vacíos o sin sentido
6. Productos que no corresponden a un marketplace de alimentos/productos locales del Putumayo

CRITERIOS PARA APROBAR:
- Productos alimenticios, agrícolas, artesanías, bebidas, lácteos, carnes, frutas, verduras, café, cacao, etc.
- Precio razonable para el contexto colombiano
- Nombre y descripción coherentes

Responde ÚNICAMENTE con un JSON sin markdown, exactamente así:
{"decision":"APROBADO","razon":"El producto es válido y apropiado para el marketplace"}
o
{"decision":"RECHAZADO","razon":"Explicación breve del motivo del rechazo"}`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }]
    });

    const texto = response.content[0].text.trim();
    const resultado = JSON.parse(texto);

    if (!['APROBADO', 'RECHAZADO'].includes(resultado.decision)) {
      throw new Error('Respuesta inválida de la IA');
    }

    return resultado;
  } catch (error) {
    console.error('❌ Error en moderación IA:', error.message);
    // Si la IA falla, aprobamos por defecto para no bloquear al productor
    return { decision: 'APROBADO', razon: 'Aprobado automáticamente (moderación IA no disponible)' };
  }
};

module.exports = { moderarProducto };
