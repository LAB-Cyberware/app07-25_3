import ImageGenerator from './ImageGenerator.js';

export default function TestApiPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Prueba de API Gemini + Generación de Imágenes
        </h1>
        
        <ImageGenerator />
        
        <div className="mt-12 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Prueba con JavaScript puro:</h2>
          
          <button 
            onClick={testApiWithJavaScript}
            className="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600"
          >
            Probar con imagen de ejemplo
          </button>
          
          <div id="result" className="mt-4"></div>
        </div>
      </div>
    </div>
  );
}

async function testApiWithJavaScript() {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = 'Cargando...';

  try {
    const response = await fetch('/api/gemini/img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: 'https://via.placeholder.com/300x200/0066cc/ffffff?text=Test+Image',
        prompt: 'Convierte esto en un paisaje de fantasía con montañas mágicas'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      resultDiv.innerHTML = `
        <div class="mt-4">
          <p class="text-green-600 font-semibold">✅ ¡API funcionando!</p>
          <p class="text-sm text-gray-600 mt-2">Prompt usado: ${result.enhancedPrompt}</p>
          <img src="${result.generatedImage}" alt="Resultado" class="mt-2 max-w-full rounded" />
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="text-red-600 font-semibold">❌ Error: ${result.error}</div>
      `;
    }
  } catch (error) {
    resultDiv.innerHTML = `
      <div class="text-red-600 font-semibold">❌ Error: ${error.message}</div>
    `;
  }
}