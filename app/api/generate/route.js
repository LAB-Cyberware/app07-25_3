import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key de Google AI no configurada' }, 
        { status: 500 }
      );
    }

    const { prompt } = await request.json();
    
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt es requerido' }, 
        { status: 400 }
      );
    }

    const fixedAspectRatio = "1:1";
    const aspectRatioDescription = "square format";

    console.log('Generando imagen con prompt:', prompt);
    console.log('AspectRatio fijo:', fixedAspectRatio);

    async function main() {
      let info;
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
      
      const config = {
        responseModalities: [
          'IMAGE',
          'TEXT',
        ],
        responseMimeType: 'text/plain',
      };

      const model = "gemini-2.0-flash-preview-image-generation";
      
      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `Generate an image: ${prompt.trim()}, in ${fixedAspectRatio} aspect ratio, ${aspectRatioDescription}`, 
            },
          ],
        },
      ];
    
      const response = await ai.models.generateContentStream({
        model,
        config,
        contents,
      });

      for await (const chunk of response) {
        if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
          continue;
        }
        
        if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
          const inlineData = chunk.candidates[0].content.parts[0].inlineData;
          return inlineData;
        }
        else {
          info = chunk.text;
          console.log('Texto generado:', chunk.text);
        }
      }
      
      throw new Error('No se generó imagen en la respuesta');
    }

    const result_img = await main(); 
    
    console.log("Imagen generada exitosamente");
    console.log(result_img);

    return NextResponse.json({
      imageBase64: result_img.data, 
      mimeType: result_img.mimeType, 
      success: true,
      model: 'gemini-2.0-flash-preview-image-generation',
      aspectRatio: fixedAspectRatio,
      aspectRatioDescription: aspectRatioDescription
    });

  } catch (error) {
    console.error('Error en la generación de imagen:', error);

    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;

    if (error.message.includes('API key') || error.message.includes('authentication')) {
      errorMessage = 'Error de autenticación con Google AI';
      statusCode = 401;
    } else if (error.message.includes('quota') || error.message.includes('limit')) {
      errorMessage = 'Límite de API alcanzado, intenta más tarde';
      statusCode = 429;
    } else if (error.message.includes('prompt') || error.message.includes('content policy')) {
      errorMessage = 'Prompt inválido o bloqueado por filtros de contenido';
      statusCode = 400;
    } else if (error.message.includes('model') || error.message.includes('not found')) {
      errorMessage = 'Modelo no encontrado o no disponible. Puede requerir billing habilitado.';
      statusCode = 404;
    } else if (error.message.includes('No se generó imagen')) {
      errorMessage = 'El modelo no generó imagen. Intenta con un prompt más específico.';
      statusCode = 422;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        suggestion: 'Verifica que tengas billing habilitado para generación de imágenes'
      }, 
      { status: statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API de generación de imágenes funcionando',
    status: 'ok',
    model: 'gemini-2.0-flash-preview-image-generation',
    aspectRatio: "1:1 (fijo)",
    aspectRatioDescription: "Square format - formato cuadrado fijo para todas las imágenes",
    usage: {
      method: "POST",
      body: {
        prompt: "string (requerido)"
      },
      example: {
        prompt: "hombre en cabaña"
      }
    }
  });
}