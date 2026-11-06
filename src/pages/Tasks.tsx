import { useState } from 'react'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../services/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export function Tasks() {
  const { user } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    if (loggingOut) {
      return
    }

    setLoggingOut(true)
    setError('')
    try {
      await logout()
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <main className="centered-page">
      <h1>Mis tareas</h1>

      <p>
        Sesión iniciada como{' '}
        <strong>{user?.email ?? 'usuario sin email'}</strong>
      </p>

      <Button
        type="button"
        onClick={handleLogout}
        loading={loggingOut}
        loadingText="Cerrando sesión..."
      >
        Cerrar sesión
      </Button>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </main>
  )
}
