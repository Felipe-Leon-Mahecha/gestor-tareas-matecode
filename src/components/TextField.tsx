import { useId, type ChangeEvent } from 'react'

interface TextFieldProps {
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
  autoComplete?: string
  disabled?: boolean
  name?: string
}

export function TextField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  autoComplete,
  disabled = false,
  name,
}: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
