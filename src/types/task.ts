export interface Task {
  id: string
  userId: string
  title: string
  description: string
  done: boolean
  createdAt: number
}

export type TaskChanges = Partial<Pick<Task, 'title' | 'description' | 'done'>>

export type NewTaskInput = Pick<Task, 'title' | 'description'>
