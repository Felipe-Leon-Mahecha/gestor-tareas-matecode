import { describe, expect, it } from 'vitest'
import { validateSummaryPayload } from '../api/_lib/validation'
import { buildSummary } from '../src/utils/summary'
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
    description: 'Hooks',
    done: true,
    createdAt: 1000,
  },
]

describe('buildSummary', () => {
  it('calcula total, completed, pending y titles', () => {
    expect(buildSummary(tasks)).toEqual({
      total: 2,
      completed: 1,
      pending: 1,
      titles: ['Comprar pan', 'Estudiar React'],
    })
  })

  it('devuelve todo en cero con la lista vacía', () => {
    expect(buildSummary([])).toEqual({
      total: 0,
      completed: 0,
      pending: 0,
      titles: [],
    })
  })
})

describe('validateSummaryPayload', () => {
  it('acepta un payload válido', () => {
    const result = validateSummaryPayload({
      total: 2,
      completed: 1,
      pending: 1,
      titles: ['Comprar pan'],
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual({
        total: 2,
        completed: 1,
        pending: 1,
        titles: ['Comprar pan'],
      })
    }
  })

  it('rechaza si falta un campo', () => {
    const result = validateSummaryPayload({
      total: 2,
      completed: 1,
      pending: 1,
    })

    expect(result.ok).toBe(false)
  })

  it('rechaza tipos incorrectos', () => {
    expect(
      validateSummaryPayload({
        total: '2',
        completed: 1,
        pending: 1,
        titles: [],
      }).ok,
    ).toBe(false)

    expect(
      validateSummaryPayload({
        total: 2,
        completed: 1.5,
        pending: 1,
        titles: [],
      }).ok,
    ).toBe(false)

    expect(
      validateSummaryPayload({
        total: 2,
        completed: 1,
        pending: 1,
        titles: 'no es array',
      }).ok,
    ).toBe(false)

    expect(
      validateSummaryPayload({
        total: 2,
        completed: 1,
        pending: 1,
        titles: [123],
      }).ok,
    ).toBe(false)
  })

  it('rechaza un titles enorme', () => {
    const hugeTitles = Array.from({ length: 1000 }, () => 'tarea')
    const result = validateSummaryPayload({
      total: 1000,
      completed: 0,
      pending: 1000,
      titles: hugeTitles,
    })

    expect(result.ok).toBe(false)
  })

  it('rechaza un título enorme', () => {
    const result = validateSummaryPayload({
      total: 1,
      completed: 0,
      pending: 1,
      titles: ['a'.repeat(500)],
    })

    expect(result.ok).toBe(false)
  })

  it('rechaza null, arrays y primitivos', () => {
    expect(validateSummaryPayload(null).ok).toBe(false)
    expect(validateSummaryPayload([]).ok).toBe(false)
    expect(validateSummaryPayload('texto').ok).toBe(false)
    expect(validateSummaryPayload(42).ok).toBe(false)
  })
})
