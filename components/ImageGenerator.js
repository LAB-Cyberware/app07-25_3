'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

const UploadIcon = () => (
  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m16-4l-4-4m0 0l-4 4m4-4v12"></path>
  </svg>
);

const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <p className="ml-4 text-gray-600">Generando tu imagen... Esto puede tardar un momento.</p>
  </div>
);

export default function ImageGenerator() {
  const [inputImageBase64, setInputImageBase64] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputImageBase64(e.target.result);
        setError('');
      };
      reader.readAsDataURL(file);
    } else {
      setError("Por favor, selecciona un archivo de imagen válido.");
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e) => {
    preventDefaults(e);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  }, []);

  const resetToUploader = () => {
    setInputImageBase64(null);
    setGeneratedImage('');
    setPrompt('');
    setError('');
  };

  const handleGeneration = async () => {
    if (!prompt.trim()) {
      setError("Por favor, introduce una descripción para la imagen.");
      return;
    }
    
    setLoading(true);
    setError('');
    setGeneratedImage('');

    try {
      console.log('Enviando solicitud de generación...');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(), 
          image: inputImageBase64 
        }),
      });

      console.log('Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorText;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorText = errorData.error || 'Error desconocido desde la API.';
        } else {
          const textResponse = await response.text();
          errorText = `Error del servidor (${response.status}): ${textResponse}`;
        }
        
        throw new Error(errorText);
      }

      const result = await response.json();
      console.log('Resultado exitoso recibido');
      
      if (result.imageBase64) {
        setGeneratedImage(`data:image/png;base64,${result.imageBase64}`);
      } else {
        throw new Error('No se recibió imagen en la respuesta');
      }

    } catch (err) {
      console.error("Error en la generación:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!inputImageBase64) {
    return (
      <div className="text-center">
        <div 
          id="drop-zone" 
          onDragEnter={preventDefaults}
          onDragOver={preventDefaults}
          onDragLeave={preventDefaults}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 sm:p-12 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input 
            type="file" 
            id="file-input" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => handleFileChange(e.target.files[0])} 
          />
          <div className="flex flex-col items-center">
            <UploadIcon />
            <p className="text-gray-500">
              Arrastra y suelta una imagen aquí, o{' '}
              <span className="font-semibold text-blue-600">haz clic para seleccionar</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP, etc.</p>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <h3 className="font-semibold mb-2 text-lg">Imagen de Entrada</h3>
          <div className="relative">
            <Image 
              id="preview-image" 
              src={inputImageBase64} 
              alt="Vista previa" 
              width={500} 
              height={500} 
              className="rounded-lg shadow-md w-full h-auto object-cover" 
            />
            <button 
              onClick={resetToUploader} 
              className="absolute top-2 right-2 bg-white/80 text-gray-800 hover:bg-white rounded-full p-2 text-sm font-semibold shadow-md transition"
            >
              Cambiar
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col">
          <h3 className="font-semibold mb-2 text-lg">Describe la imagen a generar</h3>
          <textarea 
            id="prompt-input" 
            rows="4" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition flex-grow" 
            placeholder="Ej: Un astronauta en un paisaje marciano..."
            disabled={loading}
          />
          <button 
            onClick={handleGeneration} 
            disabled={loading || !prompt.trim()} 
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Generando...' : 'Generar Imagen'}
          </button>
        </div>
      </div>

      {loading && <Loader />}
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Error:</strong> {error}
          <details className="mt-2">
            <summary className="cursor-pointer text-sm">Detalles técnicos</summary>
            <p className="text-xs mt-1 font-mono bg-red-50 p-2 rounded">
              Verifica que tu clave GEMINI_API_KEY esté configurada correctamente en .env.local
            </p>
          </details>
        </div>
      )}
      
      {generatedImage && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-center mb-6">Resultado</h2>
          <div className="relative">
            <Image 
              id="generated-image" 
              src={generatedImage} 
              alt="Imagen generada" 
              width={1024} 
              height={1024} 
              className="w-full rounded-lg shadow-xl" 
            />
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 border-2 border-white rounded-lg overflow-hidden shadow-lg bg-white/10 backdrop-blur-sm">
              <Image 
                id="thumbnail-image" 
                src={inputImageBase64} 
                alt="Imagen original (referencia)" 
                width={96} 
                height={96} 
                className="w-12 h-12 sm:w-16 sm:h-16 object-cover opacity-80" 
              />
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              💡 Tu imagen original debería aparecer como logo en la esquina superior derecha de la imagen generada
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <a 
              href={generatedImage} 
              download="imagen-generada.png" 
              className="flex-1 text-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition"
            >
              Descargar
            </a>
            <button 
              onClick={resetToUploader} 
              className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              Empezar de Nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}