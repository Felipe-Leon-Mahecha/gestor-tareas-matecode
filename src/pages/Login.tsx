import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { TextField } from '../components/TextField'
import { loginWithEmail, loginWithGoogle } from '../services/auth'
import type { FormErrors, LoginFormValues } from '../types/forms'
import { getAuthErrorMessage } from '../utils/authErrors'
import { validateLoginForm } from '../utils/validators'

const initialValues: LoginFormValues = {
  email: '',
  password: '',
}

export function Login() {
  const navigate = useNavigate()
  const [values, setValues] = useState<LoginFormValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors<LoginFormValues>>({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateValue(field: keyof LoginFormValues, value: string) {
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

  function handleChange(field: keyof LoginFormValues) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      updateValue(field, event.target.value)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) {
      return
    }

    const nextErrors = validateLoginForm(values)
    setErrors(nextErrors)
    setFormError('')

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setLoading(true)
    try {
      await loginWithEmail(values.email.trim(), values.password)
      navigate('/')
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
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
        <h1>Iniciar sesión</h1>

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
            autoComplete="current-password"
            disabled={loading}
          />

          {formError && (
            <p className="form-error" role="alert">
              {formError}
            </p>
          )}

          <Button type="submit" loading={loading} loadingText="Entrando...">
            Entrar
          </Button>
        </form>

        <Button
          type="button"
          className="button--secondary"
          onClick={handleGoogleLogin}
          loading={loading}
          loadingText="Conectando..."
        >
          Continuar con Google
        </Button>

        <p className="auth-alt">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </section>
    </main>
  )
}
