import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '../src/hooks/useAuth'
import { useTasks } from '../src/hooks/useTasks'
import { subscribeToTasks } from '../src/services/tasks'
import type { AuthUser } from '../src/types/auth'
import type { Task } from '../src/types/task'

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../src/services/tasks', () => ({
  subscribeToTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}))

const useAuthMock = vi.mocked(useAuth)
const subscribeToTasksMock = vi.mocked(subscribeToTasks)

const user: AuthUser = {
  uid: 'user-1',
  email: 'ana@example.com',
  displayName: 'Ana',
}

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

function mockSession(nextUser: AuthUser | null, loading = false) {
  useAuthMock.mockReturnValue({ user: nextUser, loading })
}

describe('useTasks', () => {
  beforeEach(() => {
    subscribeToTasksMock.mockReset()
    subscribeToTasksMock.mockReturnValue(() => {})
  })

  it('no se suscribe cuando no hay usuario', () => {
    mockSession(null)

    const { result } = renderHook(() => useTasks())

    expect(subscribeToTasksMock).not.toHaveBeenCalled()
    expect(result.current.tasks).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('entrega las tareas de la suscripcion al usuario actual', async () => {
    mockSession(user)
    subscribeToTasksMock.mockImplementation((_uid, onData) => {
      onData(tasks)
      return () => {}
    })

    const { result } = renderHook(() => useTasks())

    expect(subscribeToTasksMock).toHaveBeenCalledWith(
      'user-1',
      expect.any(Function),
      expect.any(Function),
    )
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.tasks).toEqual(tasks)
    expect(result.current.error).toBeNull()
  })

  it('cancela la suscripcion al desmontar', () => {
    mockSession(user)
    const unsubscribe = vi.fn()
    subscribeToTasksMock.mockReturnValue(unsubscribe)

    const { unmount } = renderHook(() => useTasks())
    expect(subscribeToTasksMock).toHaveBeenCalledTimes(1)

    unmount()

    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })

  it('expone el error en espanol cuando la suscripcion falla', async () => {
    mockSession(user)
    subscribeToTasksMock.mockImplementation((_uid, _onData, onError) => {
      onError(Object.assign(new Error('sin permiso'), { code: 'permission-denied' }))
      return () => {}
    })

    const { result } = renderHook(() => useTasks())

    await waitFor(() =>
      expect(result.current.error).toBe(
        'No tienes permiso para acceder a estas tareas.',
      ),
    )
    expect(result.current.loading).toBe(false)
  })
})
