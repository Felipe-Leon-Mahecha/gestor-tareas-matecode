import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { loginWithGoogle, registerWithEmail } from '../services/auth'
import type { FormErrors, RegisterFormValues } from '../types/forms'
import { getAuthErrorMessage } from '../utils/authErrors'
import { validateRegisterForm } from '../utils/validators'

const initialValues: RegisterFormValues = {
  email: '',
  password: '',
  confirmPassword: '',
}

export function Register() {
  const navigate = useNavigate()
  const [values, setValues] = useState<RegisterFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors<RegisterFormValues>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateValue(field: keyof RegisterFormValues, value: string) {
    setValues((current) => {
      const next = { ...current }
      next[field] = value
      return next
    })

    setErrors((current) => {
      if (current[field] === undefined) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function handleChange(field: keyof RegisterFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateValue(field, event.target.value)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) {
      return
    }

    const nextErrors = validateRegisterForm(values)
    setErrors(nextErrors)
    setFormError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      await registerWithEmail(values.email.trim(), values.password)
      navigate('/')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    if (loading) {
      return
    }

    setFormError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate('/')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Crear cuenta</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange('email')}
            error={errors.email}
            autoComplete="email"
            disabled={loading}
          />
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange('password')}
            error={errors.password}
            autoComplete="new-password"
            disabled={loading}
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={loading}
          />

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <Button
            type="submit"
            loading={loading}
            loadingText="Creando cuenta..."
          >
            Crear cuenta
          </Button>
        </form>

        <Button
          type="button"
          className="button--secondary"
          onClick={handleGoogleRegister}
          loading={loading}
          loadingText="Conectando..."
        >
          Continuar con Google
        </Button>

        <p className="auth-alt">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </section>
    </main>
  )
}
