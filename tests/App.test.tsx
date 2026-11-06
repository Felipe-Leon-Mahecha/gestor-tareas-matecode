import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import { AuthProvider } from '../src/features/auth/AuthContext'

describe('App', () => {
  it('muestra el título del gestor', () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    )

    expect(
      screen.getByRole('heading', { name: /gestor de tareas/i }),
    ).toBeInTheDocument()
  })
})
