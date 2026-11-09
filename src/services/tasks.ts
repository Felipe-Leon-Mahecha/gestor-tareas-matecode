import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import type { NewTaskInput, Task, TaskChanges } from '../types/task'
import { auth, db } from './firebase'

// La colección se llama exactamente "tasks": las reglas de Firestore
// publicadas en la consola dependen de ese nombre.
function tasksCollection() {
  return collection(db, 'tasks')
}

// Firestore devuelve los documentos sin garantías de tipo; se valida campo a
// campo para que un documento inesperado no rompa la lista entera.
function toTask(id: string, data: DocumentData): Task {
  return {
    id,
    userId: typeof data.userId === 'string' ? data.userId : '',
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : '',
    done: data.done === true,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
  }
}

export async function createTask(input: NewTaskInput): Promise<void> {
  const user = auth.currentUser

  if (user === null) {
    throw new Error('Debes iniciar sesión para crear una tarea.')
  }

  // El userId se toma de la sesión y no del formulario: el formulario corre
  // en el navegador y cualquiera podría enviar un userId ajeno.
  // Date.now() en lugar de serverTimestamp() porque las reglas exigen number.
  await addDoc(tasksCollection(), {
    userId: user.uid,
    title: input.title,
    description: input.description,
    done: false,
    createdAt: Date.now(),
  })
}

export function subscribeToTasks(
  userId: string,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): () => void {
  const userTasks = query(tasksCollection(), where('userId', '==', userId))

  return onSnapshot(
    userTasks,
    (snapshot) => {
      const tasks = snapshot.docs
        .map((document) => toTask(document.id, document.data()))
        // Sin orderBy en la query: where + orderBy sobre campos distintos
        // exige un índice compuesto; con pocos documentos basta ordenar aquí.
        .sort((first, second) => second.createdAt - first.createdAt)

      onData(tasks)
    },
    onError,
  )
}

export async function updateTask(
  id: string,
  changes: TaskChanges,
): Promise<void> {
  await updateDoc(doc(tasksCollection(), id), changes)
}

export async function deleteTask(id: string): Promise<void> {
  await deleteDoc(doc(tasksCollection(), id))
}
