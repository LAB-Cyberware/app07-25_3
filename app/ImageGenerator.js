import { useState } from 'react';

export default function ImageGenerator() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedImage('');

    try {
      let requestBody = { prompt };

      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        requestBody.imageBase64 = base64;
      } else if (imageUrl) {
        requestBody.imageUrl = imageUrl;
      } else {
        throw new Error('Debes proporcionar una imagen (archivo o URL)');
      }

      const response = await fetch('/api/gemini/img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedImage(result.generatedImage);
      } else {
        setError(result.error || 'Error desconocido');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Generador de Imágenes con Gemini
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subir imagen desde archivo:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImageFile(e.target.files[0]);
              setImageUrl('');
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O usar URL de imagen:
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageFile(null);
            }}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción para la nueva imagen:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ejemplo: Un paisaje futurista con ciudades flotantes"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !prompt}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generando...' : 'Generar Imagen'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {generatedImage && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Imagen Generada:</h3>
          <img
            src={generatedImage}
            alt="Imagen generada por IA"
            className="w-full rounded-lg shadow-md"
          />
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = generatedImage;
              link.download = 'imagen-generada.png';
              link.click();
            }}
            className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
          >
            Descargar Imagen
          </button>
        </div>
      )}
    </div>
  );
}