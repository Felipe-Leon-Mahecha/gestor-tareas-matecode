import { useEffect, useState } from 'react'
import type { NewTaskInput, Task, TaskChanges } from '../types/task'
import {
  createTask,
  deleteTask,
  subscribeToTasks,
  updateTask,
} from '../services/tasks'
import { getTaskErrorMessage } from '../utils/taskErrors'
import { useAuth } from './useAuth'

export interface UseTasksResult {
  tasks: Task[]
  loading: boolean
  error: string | null
  addTask: (input: NewTaskInput) => Promise<void>
  editTask: (id: string, changes: TaskChanges) => Promise<void>
  removeTask: (id: string) => Promise<void>
  toggleDone: (id: string, done: boolean) => Promise<void>
}

export function useTasks(): UseTasksResult {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [tasks, setTasks] = useState<Task[]>([])
  // Sin usuario no hay nada que cargar; con usuario se empieza en carga
  // hasta que Firestore entregue el primer snapshot.
  const [loading, setLoading] = useState(uid !== null)
  const [error, setError] = useState<string | null>(null)

  // Resetear al cambiar de usuario durante el montaje (patrón de React
  // "adjusting state when a value changes"): sin esto se mostrarían las
  // tareas del usuario anterior hasta el siguiente snapshot.
  const [previousUid, setPreviousUid] = useState(uid)
  if (previousUid !== uid) {
    setPreviousUid(uid)
    setTasks([])
    setLoading(uid !== null)
    setError(null)
  }

  useEffect(() => {
    if (uid === null) {
      return
    }

    // El cleanup cancela la suscripción al desmontar o al cambiar de usuario:
    // sin él quedarían oyentes fantasma escribiendo estado de otro usuario.
    // El uid es la única dependencia para no resuscribirse en cada render.
    const unsubscribe = subscribeToTasks(
      uid,
      (nextTasks) => {
        setTasks(nextTasks)
        setLoading(false)
        setError(null)
      },
      (subscriptionError) => {
        setLoading(false)
        setError(getTaskErrorMessage(subscriptionError))
      },
    )

    return unsubscribe
  }, [uid])

  // Las acciones tragan el error y lo exponen en el estado: ningún await
  // rechazado sin capturar, así una escritura fallida no rompe la app.
  async function addTask(input: NewTaskInput): Promise<void> {
    setError(null)
    try {
      await createTask(input)
    } catch (actionError) {
      setError(getTaskErrorMessage(actionError))
    }
  }

  async function editTask(id: string, changes: TaskChanges): Promise<void> {
    setError(null)
    try {
      await updateTask(id, changes)
    } catch (actionError) {
      setError(getTaskErrorMessage(actionError))
    }
  }

  async function removeTask(id: string): Promise<void> {
    setError(null)
    try {
      await deleteTask(id)
    } catch (actionError) {
      setError(getTaskErrorMessage(actionError))
    }
  }

  // Reutiliza editTask: marcar como hecha es una edición con un solo campo.
  function toggleDone(id: string, done: boolean): Promise<void> {
    return editTask(id, { done })
  }

  return { tasks, loading, error, addTask, editTask, removeTask, toggleDone }
}
