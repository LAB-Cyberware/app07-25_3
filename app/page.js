'use client'

import { useState } from 'react';
import ImageGenerator from '../components/ImageGenerator';

export default function TestGeminiPage() {
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    setTestResult('Probando API...');

    try {
      const response = await fetch('/api/gemini/img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Imagen+de+Prueba',
          prompt: 'Un paisaje futurista con ciudades flotantes'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ API funcionando correctamente
Prompt original: ${result.originalPrompt}
Prompt mejorado: ${result.enhancedPrompt}`);
      } else {
        setTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error de conexión: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Prueba de API Gemini + Generación de Imágenes
        </h1>
        
        <ImageGenerator />
        
        <div className="mt-12 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Prueba rápida de la API:</h2>
          
          <button 
            onClick={testAPI}
            disabled={testing}
            className={`py-2 px-4 rounded-md text-white font-semibold ${
              testing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            {testing ? 'Probando...' : 'Probar API con imagen de ejemplo'}
          </button>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Instrucciones:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Asegúrate de tener <code className="bg-gray-200 px-1 rounded">GEMINI_API_KEY</code> en tu <code className="bg-gray-200 px-1 rounded">.env.local</code></li>
              <li>El archivo de la API debe estar en: <code className="bg-gray-200 px-1 rounded">pages/api/gemini/img.js</code></li>
              <li>El componente debe estar en: <code className="bg-gray-200 px-1 rounded">components/ImageGenerator.js</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}