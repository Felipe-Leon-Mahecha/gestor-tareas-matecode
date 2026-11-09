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

const MAX_COUNT = 100_000
const MAX_TITLES = 200
const MAX_TITLE_LENGTH = 200

export type ValidationResult =
  | { ok: true; value: TaskSummary }
  | { ok: false; error: string }

// Valida el payload antes de enviarlo: tipos, rangos y límites de tamaño.
// Devuelve un resultado discriminado para que el endpoint decida el HTTP.
export function validateSummaryPayload(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, error: 'El cuerpo debe ser un objeto JSON.' }
  }

  const body = input as Record<string, unknown>

  if (
    typeof body.total !== 'number' ||
    !Number.isInteger(body.total) ||
    body.total < 0 ||
    body.total > MAX_COUNT
  ) {
    return { ok: false, error: 'El campo "total" debe ser un entero mayor o igual a 0.' }
  }

  if (
    typeof body.completed !== 'number' ||
    !Number.isInteger(body.completed) ||
    body.completed < 0 ||
    body.completed > MAX_COUNT
  ) {
    return { ok: false, error: 'El campo "completed" debe ser un entero mayor o igual a 0.' }
  }

  if (
    typeof body.pending !== 'number' ||
    !Number.isInteger(body.pending) ||
    body.pending < 0 ||
    body.pending > MAX_COUNT
  ) {
    return { ok: false, error: 'El campo "pending" debe ser un entero mayor o igual a 0.' }
  }

  if (!Array.isArray(body.titles) || body.titles.length > MAX_TITLES) {
    return { ok: false, error: 'El campo "titles" debe ser un array de hasta 200 strings.' }
  }

  const titles: string[] = []
  for (const title of body.titles) {
    if (typeof title !== 'string' || title.length > MAX_TITLE_LENGTH) {
      return { ok: false, error: 'Cada título debe ser un string de hasta 200 caracteres.' }
    }
    titles.push(title)
  }

  return {
    ok: true,
    value: {
      total: body.total,
      completed: body.completed,
      pending: body.pending,
      titles,
    },
  }
}
