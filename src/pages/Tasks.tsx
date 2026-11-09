import { useState } from 'react'
import { Button } from '../components/Button'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { logout } from '../services/auth'
import { getAuthErrorMessage } from '../utils/authErrors'

export function Tasks() {
  const { user } = useAuth()
  const { tasks, loading, error, addTask, editTask, removeTask, toggleDone } =
    useTasks()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    if (loggingOut) {
      return
    }

    setLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
    } catch (logoutFailure) {
      setLogoutError(getAuthErrorMessage(logoutFailure))
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <main className="tasks-page">
      <header className="tasks-header">
        <div>
          <h1>Mis tareas</h1>
          <p>
            Sesión iniciada como{' '}
            <strong>{user?.email ?? 'usuario sin email'}</strong>
          </p>
        </div>

        <Button
          type="button"
          onClick={handleLogout}
          loading={loggingOut}
          loadingText="Cerrando sesión..."
        >
          Cerrar sesión
        </Button>
      </header>

      {logoutError && (
        <p className="form-error" role="alert">
          {logoutError}
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <TaskForm onSubmit={addTask} />

      {loading ? (
        <p className="status-text">Cargando tareas...</p>
      ) : (
        <TaskList
          tasks={tasks}
          onToggleDone={toggleDone}
          onEdit={editTask}
          onDelete={removeTask}
        />
      )}
    </main>
  )
}
