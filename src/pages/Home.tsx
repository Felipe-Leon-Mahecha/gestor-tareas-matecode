import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuth } from '../hooks/useAuth'
import { logout } from '../services/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export function Home() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
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
      navigate('/login')
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <main className="centered-page">
      <h1>Gestor de Tareas - MateCode</h1>

      {loading ? (
        <p>Cargando sesión...</p>
      ) : user ? (
        <>
          <p>
            Sesión iniciada como{' '}
            <strong>{user.email ?? 'usuario sin email'}</strong>
          </p>
          <Button
            type="button"
            onClick={handleLogout}
            loading={loggingOut}
            loadingText="Cerrando sesión..."
          >
            Cerrar sesión
          </Button>
        </>
      ) : (
        <>
          <p>No hay sesión iniciada.</p>
          <Link to="/login">Iniciar sesión</Link>
        </>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </main>
  )
}
