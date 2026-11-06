import type {
  FormErrors,
  LoginFormValues,
  RegisterFormValues,
} from '../types/forms'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export function validateEmail(email: string): string | undefined {
  const trimmedEmail = email.trim()

  if (trimmedEmail === '') {
    return 'El email es obligatorio.'
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return 'El email no tiene un formato válido.'
  }

  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (password === '') {
    return 'La contraseña es obligatoria.'
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  return undefined
}

export function validateLoginForm(
  values: LoginFormValues,
): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {}

  const emailError = validateEmail(values.email)
  if (emailError) {
    errors.email = emailError
  }

  const passwordError = validatePassword(values.password)
  if (passwordError) {
    errors.password = passwordError
  }

  return errors
}

export function validateRegisterForm(
  values: RegisterFormValues,
): FormErrors<RegisterFormValues> {
  const errors: FormErrors<RegisterFormValues> = {}

  const emailError = validateEmail(values.email)
  if (emailError) {
    errors.email = emailError
  }

  const passwordError = validatePassword(values.password)
  if (passwordError) {
    errors.password = passwordError
  }

  if (values.confirmPassword === '') {
    errors.confirmPassword = 'Confirma tu contraseña.'
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return errors
}
