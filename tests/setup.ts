import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import type { AuthUser } from '../src/types/auth'

// Reemplaza el servicio real: los tests nunca inicializan Firebase ni leen el .env.
vi.mock('../src/services/firebase', () => ({
  auth: { currentUser: null },
  db: { name: 'firestore-mock' },
}))

// Evita llamadas reales a Firebase Auth en cualquier test.
vi.mock('../src/services/auth', () => ({
  registerWithEmail: vi.fn(),
  loginWithEmail: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
  subscribeToAuthChanges: vi.fn(
    (callback: (user: AuthUser | null) => void) => {
      callback(null)
      return () => {}
    },
  ),
}))

afterEach(() => {
  vi.clearAllMocks()
})
