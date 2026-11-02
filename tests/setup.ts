import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Reemplaza el servicio real: los tests nunca inicializan Firebase ni leen el .env.
vi.mock('../src/services/firebase', () => ({
  auth: { currentUser: null },
  db: { name: 'firestore-mock' },
}))
