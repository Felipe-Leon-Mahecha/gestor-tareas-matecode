const TASK_ERROR_MESSAGES: Record<string, string> = {
  'permission-denied': 'No tienes permiso para acceder a estas tareas.',
  'not-found': 'La tarea ya no existe.',
  unavailable: 'Sin conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  'resource-exhausted':
    'Demasiadas operaciones. Espera un momento e inténtalo de nuevo.',
}

const GENERIC_TASK_ERROR_MESSAGE = 'Ocurrió un error. Inténtalo de nuevo.'

// Mismo patrón que authErrors.ts: los códigos internos de Firebase nunca
// llegan a la interfaz, se traducen a un mensaje que el usuario entiende.
function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined
  }

  return typeof error.code === 'string' ? error.code : undefined
}

export function getTaskErrorMessage(error: unknown): string {
  const code = getErrorCode(error)

  if (code === undefined) {
    return GENERIC_TASK_ERROR_MESSAGE
  }

  return TASK_ERROR_MESSAGES[code] ?? GENERIC_TASK_ERROR_MESSAGE
}
