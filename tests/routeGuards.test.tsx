import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { useAuth } from '../src/hooks/useAuth'
import { ProtectedRoute } from '../src/routes/ProtectedRoute'
import { PublicRoute } from '../src/routes/PublicRoute'
import type { AuthUser } from '../src/types/auth'

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const useAuthMock = vi.mocked(useAuth)

const user: AuthUser = {
  uid: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
}

function mockSession(nextUser: AuthUser | null, loading = false) {
  useAuthMock.mockReturnValue({ user: nextUser, loading })
}

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/tasks']}>
      <Routes>
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <p>Contenido privado</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Pantalla de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function renderPublic() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <p>Formulario de login</p>
            </PublicRoute>
          }
        />
        <Route path="/tasks" element={<p>Pantalla de tareas</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('muestra la carga mientras se resuelve la sesión', () => {
    mockSession(null, true)

    renderProtected()

    expect(screen.getByText('Cargando sesión...')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('redirige a /login cuando no hay usuario', () => {
    mockSession(null)

    renderProtected()

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })

  it('muestra el contenido cuando hay usuario', () => {
    mockSession(user)

    renderProtected()

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  it('redirige a /tasks cuando ya hay sesión', () => {
    mockSession(user)

    renderPublic()

    expect(screen.getByText('Pantalla de tareas')).toBeInTheDocument()
    expect(screen.queryByText('Formulario de login')).not.toBeInTheDocument()
  })

  it('muestra el formulario cuando no hay sesión', () => {
    mockSession(null)

    renderPublic()

    expect(screen.getByText('Formulario de login')).toBeInTheDocument()
    expect(screen.queryByText('Pantalla de tareas')).not.toBeInTheDocument()
  })
})
