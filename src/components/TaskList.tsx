import type { Task, TaskChanges } from '../types/task'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggleDone: (id: string, done: boolean) => void
  onEdit: (id: string, changes: TaskChanges) => void
  onDelete: (id: string) => void
}

export function TaskList({
  tasks,
  onToggleDone,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="task-empty">
        Aún no tienes tareas. Crea la primera con el formulario.
      </p>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleDone={onToggleDone}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
