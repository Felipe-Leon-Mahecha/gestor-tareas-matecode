const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ese email ya está registrado. Prueba a iniciar sesión.',
  'auth/weak-password': 'La contraseña es demasiado débil. Usa al menos 6 caracteres.',
  'auth/invalid-email': 'El email no tiene un formato válido.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de completar el acceso.',
  'auth/network-request-failed': 'Error de red. Revisa tu conexión e inténtalo de nuevo.',
}

const GENERIC_AUTH_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Inténtalo de nuevo.'

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined
  }

  return typeof error.code === 'string' ? error.code : undefined
}

export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error)

  if (code === undefined) {
    return GENERIC_AUTH_ERROR_MESSAGE
  }

  return AUTH_ERROR_MESSAGES[code] ?? GENERIC_AUTH_ERROR_MESSAGE
}
