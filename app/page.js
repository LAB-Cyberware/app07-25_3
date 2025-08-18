import ImageGenerator from '../components/ImageGenerator'

export default function HomePage() {
  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 max-w-3xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Generador de Imágenes con IA
          </h1>
          <p className="text-md text-gray-600 mt-2">
            Sube una imagen, describe la escena que quieres crear y la IA integrará tu imagen como una miniatura.
          </p>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <ImageGenerator />
        </main>
        
        <footer className="text-center mt-8 text-sm text-gray-500">
          <p>Creado con la API de Imagen de Google Gemini.</p>
        </footer>
      </div>
    </div>
  );
}