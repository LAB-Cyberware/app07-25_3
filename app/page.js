'use client'

import { useSession, signIn, signOut } from 'next-auth/react' /* Importaciones de useSession, signIn,
signOut de Next Auth. */
import { useRouter } from 'next/navigation' /* Importación de useRouter de Next. */
import { useEffect } from 'react' /* Importación de useEffect de React. */
import { CldImage } from 'next-cloudinary';

export default function Login() {  
  const { data: session, status } = useSession() 
  const router = useRouter() 

  useEffect(() => { 
    if (session && session.user.rol === 'admin') {
      router.push('/admin')
    }
  }, [session, router])

  if (status === 'loading') return <p>Cargando...</p> 

  
  if (session) { 
    if (session.user.rol === 'admin') {
      return ( 
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md"> 
          <h1 className="text-2xl font-bold mb-4">Cargando...</h1> 
          <p>Cargando sesión de Administrador...</p>
        </div> /* Mensaje de sesión de Administrador. */
      )
    }
    return ( 
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Bienvenido</h1>
        <div className="space-y-2">
          <p><strong>Nombre:</strong> {session.user.name}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Rol:</strong> 
            <span className={`ml-2 px-2 py-1 rounded text-sm ${
              session.user.rol === 'mod' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}> {session.user.rol}
            </span>
          </p>
          <CldImage
            src="cld-sample-5" // Use this sample image or upload your own via the Media Explorer
            width="500" // Transform the image: auto-crop to square aspect_ratio
            height="500"
            crop={{
              type: 'auto',
              source: true
            }}
          />
        </div>
        <button 
          onClick={() => signOut()} 
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar sesión
        </button> 
      </div>
    )
  }

  return ( 
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
      <button 
        onClick={() => signIn('google')}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Iniciar sesión con Google
      </button>
    </div>
  )
}