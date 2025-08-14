import { Providers } from './providers'

export const metadata = {
  title: 'Generador de Imágenes IA',
  description: 'Generador de imágenes usando Gemini API',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-100">
        <Providers>
          {children}
        </Providers>
        </div>
      </body>
    </html>
  )
}