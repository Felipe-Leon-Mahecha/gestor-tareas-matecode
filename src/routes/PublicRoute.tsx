import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface PublicRouteProps {
  children: ReactNode
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="status-text">Cargando sesión...</p>
  }

  if (user) {
    return <Navigate to="/tasks" replace />
  }

  return <>{children}</>
}
