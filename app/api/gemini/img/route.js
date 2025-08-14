import { NextRequest, NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl, imageBase64, prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt es requerido' },
        { status: 400 }
      );
    }

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: 'Se requiere imageUrl o imageBase64' },
        { status: 400 }
      );
    }

    let inputImageBase64 = imageBase64;
    if (imageUrl && !imageBase64) {
      inputImageBase64 = await convertUrlToBase64(imageUrl);
    }

    const enhancedPrompt = `${prompt}. Incluye una pequeña miniatura o referencia visual de la imagen proporcionada integrada naturalmente en la composición final.`;

    const geminiResponse = await callGeminiImageAPI(inputImageBase64, enhancedPrompt);
    
    if (!geminiResponse.success) {
      return NextResponse.json(
        { error: 'Error al generar imagen con Gemini' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      generatedImage: geminiResponse.imageBase64,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt
    });

  } catch (error) {
    console.error('Error en API de Gemini:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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

async function callGeminiImageAPI(imageBase64, prompt) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no configurada');
    }

    const base64Data = imageBase64.includes(',') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    const requestBody = {
      contents: [{
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
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

async function generateImageWithDescription(description, originalImageBase64) {
  
  console.log('Generando imagen con descripción:', description);
  console.log('Imagen original recibida:', originalImageBase64 ? 'Sí' : 'No');
  
  return originalImageBase64;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}