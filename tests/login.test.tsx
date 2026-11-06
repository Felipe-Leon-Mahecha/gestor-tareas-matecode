import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Login } from '../src/pages/Login'
import { loginWithEmail } from '../src/services/auth'

const loginWithEmailMock = vi.mocked(loginWithEmail)

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<p>home</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Login', () => {
  beforeEach(() => {
    loginWithEmailMock.mockReset()
  })

  it('muestra los errores al enviar vacío', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByText('El email es obligatorio.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('La contraseña es obligatoria.'),
    ).toBeInTheDocument()
    expect(loginWithEmailMock).not.toHaveBeenCalled()
  })

  it('llama al servicio con los datos correctos', async () => {
    const user = userEvent.setup()
    loginWithEmailMock.mockResolvedValue({
      uid: 'user-1',
      email: 'ana@example.com',
      displayName: null,
    })
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'secreta123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(loginWithEmailMock).toHaveBeenCalledWith(
        'ana@example.com',
        'secreta123',
      )
    })
  })

  it('muestra el mensaje cuando el servicio falla', async () => {
    const user = userEvent.setup()
    loginWithEmailMock.mockRejectedValue({ code: 'auth/invalid-credential' })
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'ana@example.com')
    await user.type(screen.getByLabelText(/contraseña/i), 'secreta123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email o contraseña incorrectos.',
    )
    expect(loginWithEmailMock).toHaveBeenCalledTimes(1)
  })
})
