import { describe, expect, it } from 'vitest'
import { getAuthErrorMessage } from '../src/utils/authErrors'

const GENERIC_MESSAGE = 'Ocurrió un error inesperado. Inténtalo de nuevo.'

const knownCodes: Array<[string, string]> = [
  ['auth/invalid-credential', 'Email o contraseña incorrectos.'],
  [
    'auth/email-already-in-use',
    'Ese email ya está registrado. Prueba a iniciar sesión.',
  ],
  [
    'auth/weak-password',
    'La contraseña es demasiado débil. Usa al menos 6 caracteres.',
  ],
  ['auth/invalid-email', 'El email no tiene un formato válido.'],
  [
    'auth/too-many-requests',
    'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  ],
  [
    'auth/popup-closed-by-user',
    'Cerraste la ventana de Google antes de completar el acceso.',
  ],
  [
    'auth/network-request-failed',
    'Error de red. Revisa tu conexión e inténtalo de nuevo.',
  ],
]

describe('getAuthErrorMessage', () => {
  it.each(knownCodes)('traduce %s a un mensaje en español', (code, expectedMessage) => {
    expect(getAuthErrorMessage({ code })).toBe(expectedMessage)
  })

  it('devuelve el mensaje genérico para un código desconocido', () => {
    expect(getAuthErrorMessage({ code: 'auth/codigo-desconocido' })).toBe(
      GENERIC_MESSAGE,
    )
  })

  it('devuelve el mensaje genérico cuando el valor no es un error de Firebase', () => {
    expect(getAuthErrorMessage('no soy un error')).toBe(GENERIC_MESSAGE)
    expect(getAuthErrorMessage(null)).toBe(GENERIC_MESSAGE)
    expect(getAuthErrorMessage(new Error('sin code'))).toBe(GENERIC_MESSAGE)
  })
})
