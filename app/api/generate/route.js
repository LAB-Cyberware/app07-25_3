import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt, image } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'El prompt es requerido' }, { status: 400 });
    }

const finalPrompt = `TAREA: Genera una imagen de: ${prompt}

- Genera una imagen de: ${prompt}
- Resolución alta y calidad profesional

VERIFICACIÓN: La IMAGEN FINAL debe mostrar "${prompt}"`;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'La clave de API de Gemini no está configurada en el servidor.' 
      }, { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`;

    const contentParts = [
      { text: finalPrompt }
    ];

    if (image) {
      const base64Data = image.replace(/^data:image\/[^;]+;base64,/, '');
      
      contentParts.push({
        inlineData: {
          mimeType: "image/jpeg", 
          data: base64Data
        }
      });
    }

    const payload = {
      contents: [{
        parts: contentParts
      }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      }
    };

    console.log('Enviando solicitud a Gemini 2.0 Flash:', apiUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload),
    });

    console.log('Respuesta de Gemini API:', apiResponse.status, apiResponse.statusText);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('Error de la API de Gemini:', errorText);
      
      let errorMessage = errorText;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorText;
      } catch (e) {
      }
      
      return NextResponse.json({ 
        error: `Error de la API externa: ${errorMessage}` 
      }, { status: apiResponse.status });
    }

    const result = await apiResponse.json();
    console.log('Resultado de Gemini API:', result);

    let imageBase64 = null;
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageBase64) {
      console.error('Estructura de respuesta inesperada:', result);
      return NextResponse.json({ 
        error: 'La respuesta de la API no contenía una imagen válida. Es posible que el modelo no haya generado una imagen esta vez. Intenta de nuevo con un prompt más específico como "genera una imagen de..."'
      }, { status: 500 });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    return NextResponse.json({ imageBase64: cleanBase64 });

  } catch (error) {
    console.error('Error interno del servidor:', error);
    return NextResponse.json({ 
      error: `Ocurrió un error inesperado en el servidor: ${error.message}` 
    }, { status: 500 });
  }
}