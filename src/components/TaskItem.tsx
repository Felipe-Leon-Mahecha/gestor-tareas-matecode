import { useState } from 'react'
import type { Task, TaskChanges } from '../types/task'
import { validateTaskTitle } from '../utils/validators'
import { Button } from './Button'
import { TextField } from './TextField'

interface TaskItemProps {
  task: Task
  onToggleDone: (id: string, done: boolean) => void
  onEdit: (id: string, changes: TaskChanges) => void
  onDelete: (id: string) => void
}

export function TaskItem({
  task,
  onToggleDone,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description)
  const [editError, setEditError] = useState<string | undefined>(undefined)

  function startEditing() {
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditError(undefined)
    setEditing(true)
  }

  function cancelEditing() {
    setEditError(undefined)
    setEditing(false)
  }

  function handleSave() {
    const error = validateTaskTitle(editTitle)
    if (error !== undefined) {
      setEditError(error)
      return
    }

    onEdit(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
    })
    setEditing(false)
  }

  function handleDelete() {
    // Confirmación nativa: evita borrar una tarea con un solo clic accidental.
    if (window.confirm('¿Borrar esta tarea?')) {
      onDelete(task.id)
    }
  }

  if (editing) {
    return (
      <li className="task-item">
        <div className="task-item__edit">
          <TextField
            label="Título"
            value={editTitle}
            onChange={(event) => {
              setEditTitle(event.target.value)
              setEditError(undefined)
            }}
            error={editError}
            autoComplete="off"
          />
          <TextField
            label="Descripción"
            value={editDescription}
            onChange={(event) => setEditDescription(event.target.value)}
            autoComplete="off"
          />

          <div className="task-item__actions">
            <Button type="button" onClick={handleSave}>
              Guardar
            </Button>
            <Button
              type="button"
              className="button--secondary"
              onClick={cancelEditing}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li className={task.done ? 'task-item task-item--done' : 'task-item'}>
      <label className="task-item__check">
        <input
          type="checkbox"
          checked={task.done}
          aria-label={`Marcar "${task.title}" como hecha`}
          onChange={(event) => onToggleDone(task.id, event.target.checked)}
        />
      </label>

      <div className="task-item__body">
        <p className="task-item__title">{task.title}</p>
        {task.description && (
          <p className="task-item__description">{task.description}</p>
        )}
      </div>

      <div className="task-item__actions">
        <Button
          type="button"
          className="button--secondary button--small"
          onClick={startEditing}
        >
          Editar
        </Button>
        <Button
          type="button"
          className="button--danger button--small"
          onClick={handleDelete}
        >
          Borrar
        </Button>
      </div>
    </li>
  )
}
