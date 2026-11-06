import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import { AuthProvider } from '../src/features/auth/AuthContext'

describe('App', () => {
  it('redirige al login cuando no hay sesión', async () => {
    render(
      <AuthProvider>
        <App />
      </AuthProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: /iniciar sesión/i }),
    ).toBeInTheDocument()
  })
})
