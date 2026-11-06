import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import type { AuthUser } from '../src/types/auth'

// Los tests no deben inicializar Firebase ni hacer llamadas reales al SDK.
vi.mock('../src/services/firebase', () => ({
  auth: { currentUser: null },
  db: { name: 'firestore-mock' },
}))

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
