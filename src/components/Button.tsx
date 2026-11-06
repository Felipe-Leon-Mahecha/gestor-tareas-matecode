import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
}

export function Button({
  loading = false,
  loadingText = 'Cargando...',
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = className ? `button ${className}` : 'button'

  return (
    <button
      {...rest}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? loadingText : children}
    </button>
  )
}
