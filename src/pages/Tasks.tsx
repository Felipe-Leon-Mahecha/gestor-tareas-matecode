import { useState } from 'react'
import { Button } from '../components/Button'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { logout } from '../services/auth'
import { sendSummaryEmail } from '../services/email'
import { buildSummary } from '../utils/summary'
import { getAuthErrorMessage } from '../utils/authErrors'

export function Tasks() {
  const { user } = useAuth()
  const { tasks, loading, error, addTask, editTask, removeTask, toggleDone } =
    useTasks()
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const [sendingSummary, setSendingSummary] = useState(false)
  const [summarySuccess, setSummarySuccess] = useState('')
  const [summaryError, setSummaryError] = useState('')

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

  async function handleSendSummary() {
    if (sendingSummary) {
      return
    }

    setSendingSummary(true)
    setSummarySuccess('')
    setSummaryError('')
    try {
      await sendSummaryEmail(buildSummary(tasks))
      setSummarySuccess('Te enviamos el resumen de tus tareas por email.')
    } catch (summaryFailure) {
      setSummaryError(
        summaryFailure instanceof Error
          ? summaryFailure.message
          : 'No se pudo enviar el resumen. Inténtalo de nuevo.',
      )
    } finally {
      setSendingSummary(false)
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

      <section className="task-summary">
        <Button
          type="button"
          className="button--secondary"
          onClick={handleSendSummary}
          loading={sendingSummary}
          loadingText="Enviando..."
        >
          Enviarme resumen por email
        </Button>

        {summarySuccess && (
          <p className="form-success" role="status">
            {summarySuccess}
          </p>
        )}
        {summaryError && (
          <p className="form-error" role="alert">
            {summaryError}
          </p>
        )}
      </section>

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
