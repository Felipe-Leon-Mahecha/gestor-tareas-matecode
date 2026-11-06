import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

type FirebaseEnvKey =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_AUTH_DOMAIN'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_STORAGE_BUCKET'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'

const missingEnvKeys: FirebaseEnvKey[] = []

// Acumula las variables ausentes para reportarlas todas en un solo error.
function readEnv(key: FirebaseEnvKey): string {
  const value = (import.meta.env as unknown as Record<string, unknown>)[key]

  if (typeof value !== 'string' || value.trim() === '') {
    missingEnvKeys.push(key)
    return ''
  }

  return value
}

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Faltan variables de entorno de Firebase: ${missingEnvKeys.join(', ')}. ` +
      'Copia .env.example a .env y completa los valores antes de iniciar la app.',
  )
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
