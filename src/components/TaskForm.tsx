import { useState, type FormEvent } from 'react'
import type { NewTaskInput } from '../types/task'
import { validateTaskTitle } from '../utils/validators'
import { Button } from './Button'
import { TextField } from './TextField'

interface TaskFormProps {
  onSubmit: (input: NewTaskInput) => void
}

export function TaskForm({ onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState<string | undefined>(undefined)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateTaskTitle(title)
    if (error !== undefined) {
      setTitleError(error)
      return
    }

    setTitleError(undefined)
    onSubmit({ title: title.trim(), description: description.trim() })
    setTitle('')
    setDescription('')
  }

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <h2>Nueva tarea</h2>

      <TextField
        label="Título"
        name="title"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value)
          setTitleError(undefined)
        }}
        error={titleError}
        autoComplete="off"
      />
      <TextField
        label="Descripción"
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        autoComplete="off"
      />

      <Button type="submit">Crear tarea</Button>
    </form>
  )
}
