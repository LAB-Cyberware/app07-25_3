// pages/test-gemini.js
'use client';
import { useState } from 'react';
import ImageGenerator from '../components/ImageGenerator';

export default function TestGeminiPage() {
  const [testResult, setTestResult] = useState('');
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    setTestResult('Probando API...');
    
    console.log('🚀 Iniciando prueba de API...');

    try {
      console.log('📤 Enviando request...');
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

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Result received:', result);
      
      if (result.success) {
        setTestResult(`✅ API funcionando correctamente
Prompt original: ${result.originalPrompt}
Prompt mejorado: ${result.enhancedPrompt}
Descripción: ${result.description || 'N/A'}`);
      } else {
        const errorMsg = result.error || result.message || 'Error desconocido en resultado';
        console.error('❌ API error:', errorMsg);
        setTestResult(`❌ Error de API: ${errorMsg}`);
      }
    } catch (error) {
      console.error('💥 Catch error:', error);
      const errorMsg = error.message || error.toString() || 'Error de conexión';
      setTestResult(`❌ Error de conexión: ${errorMsg}`);
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
        
        {/* Componente principal */}
        <ImageGenerator />
        
        {/* Sección de prueba */}
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
        </div>
      </div>
    </div>
  );
}