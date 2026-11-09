import { auth } from './firebase'
import type { TaskSummary } from '../utils/summary'

export async function sendSummaryEmail(summary: TaskSummary): Promise<void> {
  const user = auth.currentUser
  if (user === null) {
    throw new Error('Debes iniciar sesión para enviar el resumen.')
  }

  // El token se obtiene en el cliente; las credenciales del servidor nunca salen.
  const token = await user.getIdToken()

  const response = await fetch('/api/send-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(summary),
  })

  if (!response.ok) {
    let message = 'No se pudo enviar el resumen. Inténtalo de nuevo.'
    try {
      const data: unknown = await response.json()
      if (
        typeof data === 'object' &&
        data !== null &&
        'error' in data &&
        typeof (data as { error: unknown }).error === 'string'
      ) {
        message = (data as { error: string }).error
      }
    } catch {
      // Respuesta no JSON: se mantiene el mensaje genérico.
    }
    throw new Error(message)
  }
}
