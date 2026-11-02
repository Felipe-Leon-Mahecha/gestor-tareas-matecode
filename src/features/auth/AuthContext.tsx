import { createContext, useEffect, useState, type ReactNode } from 'react'
import { subscribeToAuthChanges } from '../../services/auth'
import type { AuthUser } from '../../types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    // Limpieza: evita suscripciones duplicadas (StrictMode monta/desmonta en dev).
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
