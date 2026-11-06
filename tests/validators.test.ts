import { describe, expect, it } from 'vitest'
import {
  validateEmail,
  validateLoginForm,
  validatePassword,
  validateRegisterForm,
} from '../src/utils/validators'

describe('validateEmail', () => {
  it('acepta un email válido', () => {
    expect(validateEmail('ana@example.com')).toBeUndefined()
  })

  it('rechaza un email vacío', () => {
    expect(validateEmail('   ')).toBe('El email es obligatorio.')
  })

  it('rechaza un email con formato inválido', () => {
    expect(validateEmail('ana-sin-arroba')).toBe(
      'El email no tiene un formato válido.',
    )
  })
})

describe('validatePassword', () => {
  it('acepta una contraseña de 6 caracteres', () => {
    expect(validatePassword('123456')).toBeUndefined()
  })

  it('rechaza una contraseña vacía', () => {
    expect(validatePassword('')).toBe('La contraseña es obligatoria.')
  })

  it('rechaza una contraseña corta', () => {
    expect(validatePassword('12345')).toBe(
      'La contraseña debe tener al menos 6 caracteres.',
    )
  })
})

describe('validateLoginForm', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(
      validateLoginForm({ email: 'ana@example.com', password: '123456' }),
    ).toEqual({})
  })

  it('devuelve errores por campo cuando está vacío', () => {
    expect(validateLoginForm({ email: '', password: '' })).toEqual({
      email: 'El email es obligatorio.',
      password: 'La contraseña es obligatoria.',
    })
  })
})

describe('validateRegisterForm', () => {
  it('no devuelve errores con datos válidos', () => {
    expect(
      validateRegisterForm({
        email: 'ana@example.com',
        password: '123456',
        confirmPassword: '123456',
      }),
    ).toEqual({})
  })

  it('detecta cuando la confirmación no coincide', () => {
    expect(
      validateRegisterForm({
        email: 'ana@example.com',
        password: '123456',
        confirmPassword: '654321',
      }),
    ).toEqual({ confirmPassword: 'Las contraseñas no coinciden.' })
  })

  it('exige confirmar la contraseña', () => {
    expect(
      validateRegisterForm({
        email: 'ana@example.com',
        password: '123456',
        confirmPassword: '',
      }),
    ).toEqual({ confirmPassword: 'Confirma tu contraseña.' })
  })
})
