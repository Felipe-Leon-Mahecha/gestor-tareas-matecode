import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from '../src/components/TaskForm'

function renderForm(onSubmit = vi.fn()) {
  render(<TaskForm onSubmit={onSubmit} />)
  return onSubmit
}

describe('TaskForm', () => {
  it('muestra error y no llama a onSubmit con el título vacío', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.click(screen.getByRole('button', { name: /crear tarea/i }))

    expect(
      await screen.findByText('El título es obligatorio.'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('muestra error cuando el título solo tiene espacios', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.type(screen.getByLabelText('Título'), '   ')
    await user.click(screen.getByRole('button', { name: /crear tarea/i }))

    expect(
      await screen.findByText('El título es obligatorio.'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('llama a onSubmit con los datos y limpia el formulario', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await user.type(screen.getByLabelText('Título'), 'Comprar pan')
    await user.type(screen.getByLabelText('Descripción'), 'Pan integral')
    await user.click(screen.getByRole('button', { name: /crear tarea/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Comprar pan',
      description: 'Pan integral',
    })
    expect(screen.getByLabelText('Título')).toHaveValue('')
    expect(screen.getByLabelText('Descripción')).toHaveValue('')
  })
})
