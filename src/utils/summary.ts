import type { Task } from '../types/task'

export interface TaskSummary {
  total: number
  completed: number
  pending: number
  titles: string[]
}

export function buildSummary(tasks: Task[]): TaskSummary {
  let completed = 0
  const titles: string[] = []

  for (const task of tasks) {
    if (task.done) {
      completed += 1
    }
    titles.push(task.title)
  }

  return {
    total: tasks.length,
    completed,
    pending: tasks.length - completed,
    titles,
  }
}
