import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Tasks } from '../src/pages/Tasks'
import { useAuth } from '../src/hooks/useAuth'
import { useTasks } from '../src/hooks/useTasks'
import { sendSummaryEmail } from '../src/services/email'
import type { Task } from '../src/types/task'

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../src/hooks/useTasks', () => ({
  useTasks: vi.fn(),
}))

vi.mock('../src/services/email', () => ({
  sendSummaryEmail: vi.fn(),
}))

const useAuthMock = vi.mocked(useAuth)
const useTasksMock = vi.mocked(useTasks)
const sendSummaryEmailMock = vi.mocked(sendSummaryEmail)

const tasks: Task[] = [
  {
    id: 'task-1',
    userId: 'user-1',
    title: 'Comprar pan',
    description: '',
    done: false,
    createdAt: 1000,
  },
]

function setupMocks() {
  useAuthMock.mockReturnValue({
    user: { uid: 'user-1', email: 'ana@example.com', displayName: 'Ana' },
    loading: false,
  })
  useTasksMock.mockReturnValue({
    tasks,
    loading: false,
    error: null,
    addTask: vi.fn(),
    editTask: vi.fn(),
    removeTask: vi.fn(),
    toggleDone: vi.fn(),
  })
}

describe('Tasks summary button', () => {
  beforeEach(() => {
    sendSummaryEmailMock.mockReset()
    setupMocks()
  })

  it('muestra estado de carga mientras se envía', async () => {
    const user = userEvent.setup()
    let resolveSend: () => void = () => {}
    sendSummaryEmailMock.mockImplementation(
      () => new Promise<void>((resolve) => {
        resolveSend = resolve
      }),
    )

    render(<Tasks />)
    await user.click(screen.getByRole('button', { name: /enviarme resumen por email/i }))

    expect(await screen.findByRole('button', { name: /enviando/i })).toBeDisabled()

    resolveSend()
    await waitFor(() => expect(sendSummaryEmailMock).toHaveBeenCalled())
  })

  it('muestra éxito cuando el envío termina bien', async () => {
    const user = userEvent.setup()
    sendSummaryEmailMock.mockResolvedValue(undefined)

    render(<Tasks />)
    await user.click(screen.getByRole('button', { name: /enviarme resumen por email/i }))

    expect(
      await screen.findByText('Te enviamos el resumen de tus tareas por email.'),
    ).toBeInTheDocument()
  })

  it('muestra error cuando el envío falla', async () => {
    const user = userEvent.setup()
    sendSummaryEmailMock.mockRejectedValue(new Error('No se pudo enviar el resumen.'))

    render(<Tasks />)
    await user.click(screen.getByRole('button', { name: /enviarme resumen por email/i }))

    expect(await screen.findByText('No se pudo enviar el resumen.')).toBeInTheDocument()
  })
})
