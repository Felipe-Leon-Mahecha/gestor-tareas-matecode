import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TaskItem } from '../src/components/TaskItem'
import type { Task } from '../src/types/task'

const task: Task = {
  id: 'task-1',
  userId: 'user-1',
  title: 'Comprar pan',
  description: 'Pan integral',
  done: false,
  createdAt: 1000,
}

function renderItem() {
  const onToggleDone = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  render(
    <TaskItem
      task={task}
      onToggleDone={onToggleDone}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )

  return { onToggleDone, onEdit, onDelete }
}

afterEach(() => {
  // Restaura el spy de window.confirm para que no arrastre entre tests.
  vi.restoreAllMocks()
})

describe('TaskItem', () => {
  it('marca la tarea como hecha', async () => {
    const user = userEvent.setup()
    const { onToggleDone } = renderItem()

    await user.click(screen.getByRole('checkbox', { name: /comprar pan/i }))

    expect(onToggleDone).toHaveBeenCalledWith('task-1', true)
  })

  it('edita en línea y guarda los cambios', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderItem()

    await user.click(screen.getByRole('button', { name: /editar/i }))

    const titleInput = screen.getByLabelText('Título')
    expect(titleInput).toHaveValue('Comprar pan')

    await user.clear(titleInput)
    await user.type(titleInput, 'Comprar leche')
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(onEdit).toHaveBeenCalledWith('task-1', {
      title: 'Comprar leche',
      description: 'Pan integral',
    })
    expect(screen.queryByRole('button', { name: /guardar/i })).toBeNull()
  })

  it('no guarda la edición con el título vacío', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderItem()

    await user.click(screen.getByRole('button', { name: /editar/i }))
    await user.clear(screen.getByLabelText('Título'))
    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(
      await screen.findByText('El título es obligatorio.'),
    ).toBeInTheDocument()
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('borra la tarea solo si se confirma', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { onDelete } = renderItem()

    await user.click(screen.getByRole('button', { name: /borrar/i }))

    expect(window.confirm).toHaveBeenCalledWith('¿Borrar esta tarea?')
    expect(onDelete).toHaveBeenCalledWith('task-1')
  })

  it('no borra cuando se cancela la confirmación', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const { onDelete } = renderItem()

    await user.click(screen.getByRole('button', { name: /borrar/i }))

    expect(onDelete).not.toHaveBeenCalled()
  })
})
