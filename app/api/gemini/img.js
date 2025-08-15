// pages/api/gemini/img.js
export default async function handler(req, res) {
  // Agregar headers CORS y JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  console.log('📝 Recibiendo request:', req.body); // Debug log

  try {
    // Obtener datos del request
    const { imageUrl, imageBase64, prompt } = req.body;
    
    // Validar que tengamos los datos necesarios
    if (!prompt) {
      console.log('❌ Error: Prompt faltante');
      return res.status(400).json({ error: 'Prompt es requerido' });
    }

    if (!imageUrl && !imageBase64) {
      console.log('❌ Error: Imagen faltante');
      return res.status(400).json({ error: 'Se requiere imageUrl o imageBase64' });
    }

    console.log('✅ Datos validados correctamente');
    console.log('📸 ImageUrl:', imageUrl ? 'Presente' : 'No');
    console.log('📸 ImageBase64:', imageBase64 ? 'Presente' : 'No');
    console.log('📝 Prompt:', prompt);

    // Convertir imagen a base64 si viene como URL
    let inputImageBase64 = imageBase64;
    if (imageUrl && !imageBase64) {
      console.log('🔄 Convirtiendo URL a base64...');
      inputImageBase64 = await convertUrlToBase64(imageUrl);
      console.log('✅ Conversión completada');
    }

    // Preparar el prompt mejorado para incluir la miniatura
    const enhancedPrompt = `${prompt}. Incluye una pequeña miniatura o referencia visual de la imagen proporcionada integrada naturalmente en la composición final.`;

    console.log('🤖 Llamando a Gemini API...');
    // Llamar a la API de Gemini
    const geminiResponse = await callGeminiImageAPI(inputImageBase64, enhancedPrompt);
    
    if (!geminiResponse.success) {
      console.log('❌ Error de Gemini:', geminiResponse.error);
      return res.status(500).json({ error: 'Error al generar imagen con Gemini: ' + geminiResponse.error });
    }

    console.log('✅ Respuesta exitosa de Gemini');
    // Retornar la imagen generada en base64
    return res.status(200).json({
      success: true,
      generatedImage: geminiResponse.imageBase64,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      description: geminiResponse.description
    });

  } catch (error) {
    console.error('💥 Error en API de Gemini:', error);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ 
      error: 'Error interno del servidor: ' + error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Función para convertir URL a base64
async function convertUrlToBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('No se pudo descargar la imagen');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('Error convirtiendo URL a base64:', error);
    throw error;
  }
}

// Función para llamar a la API de Gemini
async function callGeminiImageAPI(imageBase64, prompt) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no configurada');
    }

    // Preparar la imagen para Gemini (remover el prefijo data:image/...)
    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // Configuración para la API de Gemini (Imagen + Texto)
    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: "image/jpeg", // Ajustar según el tipo de imagen
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error de Gemini API:', errorData);
      throw new Error(`Error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    // Nota: Gemini Pro Vision genera texto, no imágenes directamente
    // Para generación de imágenes necesitarías usar un servicio diferente
    // como DALL-E, Midjourney, o Stable Diffusion
    
    // Simulación de respuesta (reemplazar con servicio real de generación)
    const generatedImageBase64 = await generateImageWithDescription(
      data.candidates[0]?.content?.parts[0]?.text || prompt,
      imageBase64
    );

    return {
      success: true,
      imageBase64: generatedImageBase64,
      description: data.candidates[0]?.content?.parts[0]?.text
    };

  } catch (error) {
    console.error('Error en llamada a Gemini:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función placeholder para generación de imágenes
// Aquí integrarías un servicio real como DALL-E, Stable Diffusion, etc.
async function generateImageWithDescription(description, originalImageBase64) {
  // PLACEHOLDER: Aquí deberías integrar un servicio real de generación de imágenes
  // Por ejemplo: OpenAI DALL-E, Stability AI, etc.
  
  console.log('Generando imagen con descripción:', description);
  console.log('Imagen original recibida:', originalImageBase64 ? 'Sí' : 'No');
  
  // Por ahora retorna la imagen original (para testing)
  return originalImageBase64;
}

// Solo permitir POST - Ya manejado arriba