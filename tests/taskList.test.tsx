import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TaskList } from '../src/components/TaskList'
import type { Task } from '../src/types/task'

const tasks: Task[] = [
  {
    id: 'task-1',
    userId: 'user-1',
    title: 'Comprar pan',
    description: '',
    done: false,
    createdAt: 2000,
  },
  {
    id: 'task-2',
    userId: 'user-1',
    title: 'Estudiar React',
    description: 'Hooks y Firestore',
    done: true,
    createdAt: 1000,
  },
]

function renderList(items: Task[]) {
  const onToggleDone = vi.fn()
  const onEdit = vi.fn()
  const onDelete = vi.fn()

  render(
    <TaskList
      tasks={items}
      onToggleDone={onToggleDone}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  )

  return { onToggleDone, onEdit, onDelete }
}

describe('TaskList', () => {
  it('muestra un mensaje claro cuando la lista está vacía', () => {
    renderList([])

    expect(
      screen.getByText('Aún no tienes tareas. Crea la primera con el formulario.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('renderiza una tarea por cada elemento de la lista', () => {
    renderList(tasks)

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Comprar pan')).toBeInTheDocument()
    expect(screen.getByText('Estudiar React')).toBeInTheDocument()
  })
})
