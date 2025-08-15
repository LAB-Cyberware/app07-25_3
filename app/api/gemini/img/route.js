// app/api/gemini/img.js
// Para que funcione en tu estructura actual, debe usar este formato:

import { NextResponse } from 'next/server';

export async function POST(request) {
  console.log('🔥 API Gemini llamada recibida');
  
  try {
    const body = await request.json();
    const { imageUrl, imageBase64, prompt } = body;
    
    console.log('📦 Body recibido:', { imageUrl: !!imageUrl, imageBase64: !!imageBase64, prompt });
    
    // Validaciones
    if (!prompt) {
      console.log('❌ Error: Prompt faltante');
      return NextResponse.json({ error: 'Prompt es requerido' }, { status: 400 });
    }

    if (!imageUrl && !imageBase64) {
      console.log('❌ Error: Imagen faltante');
      return NextResponse.json({ error: 'Se requiere imageUrl o imageBase64' }, { status: 400 });
    }

    // Convertir URL a base64 si es necesario
    let inputImageBase64 = imageBase64;
    if (imageUrl && !imageBase64) {
      console.log('🔄 Convirtiendo URL a base64...');
      inputImageBase64 = await convertUrlToBase64(imageUrl);
      console.log('✅ Conversión completada');
    }

    // Preparar prompt mejorado
    const enhancedPrompt = `${prompt}. Incluye una pequeña miniatura o referencia visual de la imagen proporcionada integrada naturalmente en la composición final.`;

    console.log('🤖 Procesando con Gemini (modo simulación)...');
    
    // Simulación temporal
    const result = {
      success: true,
      generatedImage: inputImageBase64, // Devolver la imagen original como placeholder
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
      description: `✅ Imagen procesada exitosamente con el prompt: "${prompt}". 
      
NOTA: Esta es una simulación. La imagen mostrada es la original que subiste. 

Para generar imágenes reales, necesitarías integrar un servicio como:
- OpenAI DALL-E 
- Stability AI Stable Diffusion
- Replicate
- Midjourney API

Gemini Pro Vision puede ANALIZAR imágenes pero no GENERAR nuevas imágenes.`
    };

    console.log('✅ Respuesta exitosa preparada');
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 Error en API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor: ' + error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Función helper para convertir URL a base64
async function convertUrlToBase64(url) {
  try {
    console.log('🌐 Descargando imagen de:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: No se pudo descargar la imagen`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    const base64 = `data:${contentType};base64,${buffer.toString('base64')}`;
    console.log('✅ Imagen convertida a base64, tamaño:', buffer.length, 'bytes');
    return base64;
    
  } catch (error) {
    console.error('❌ Error convirtiendo URL a base64:', error);
    throw new Error(`Error al descargar imagen: ${error.message}`);
  }
}

// Manejar otros métodos
export async function GET() {
  return NextResponse.json({ error: 'Método GET no permitido. Usa POST.' }, { status: 405 });
}