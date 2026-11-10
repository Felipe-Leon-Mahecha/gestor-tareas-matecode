import type { IncomingMessage, ServerResponse } from 'http'
import { sendEmail } from './_lib/email.js'
import {
  validateSummaryPayload,
  type SummaryPayload,
} from './_lib/validation.js'

interface ApiRequest extends IncomingMessage {
  body?: unknown
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function extractBearerToken(header: string | string[] | undefined): string {
  if (typeof header !== 'string') {
    return ''
  }
  const prefix = 'Bearer '
  if (!header.startsWith(prefix)) {
    return ''
  }
  return header.slice(prefix.length).trim()
}

// Verifica el ID token de Firebase y devuelve el email verificado del usuario.
// Se usa la API REST (identitytoolkit) para no depender de firebase-admin.
async function verifyIdToken(token: string): Promise<string> {
  const apiKey = process.env.FIREBASE_WEB_API_KEY
  if (apiKey === undefined || apiKey === '') {
    throw new Error('FIREBASE_WEB_API_KEY no configurada.')
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    },
  )

  if (!response.ok) {
    // El detalle solo se registra en el servidor para poder diagnosticar.
    const detail = await response.text()
    throw new Error(`Token inválido (${response.status}): ${detail}`)
  }

  const data: unknown = await response.json()
  const email = extractEmail(data)
  if (email === null) {
    throw new Error('No se pudo obtener el email del usuario.')
  }
  return email
}

function extractEmail(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null
  }
  const users = (data as { users?: unknown }).users
  if (!Array.isArray(users) || users.length === 0) {
    return null
  }
  const first = users[0]
  if (typeof first !== 'object' || first === null) {
    return null
  }
  const email = (first as { email?: unknown }).email
  return typeof email === 'string' && email !== '' ? email : null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildEmailHtml(summary: SummaryPayload): string {
  const items = summary.titles.map((title) => `<li>${escapeHtml(title)}</li>`).join('')
  return `<!DOCTYPE html><html><body><h2>Resumen de tus tareas</h2><p>Total: ${summary.total} · Completadas: ${summary.completed} · Pendientes: ${summary.pending}</p><ul>${items}</ul></body></html>`
}

export default async function handler(
  req: ApiRequest,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    sendJson(res, 405, { error: 'Método no permitido.' })
    return
  }

  const token = extractBearerToken(req.headers.authorization)
  if (token === '') {
    sendJson(res, 401, { error: 'Falta el token de autenticación.' })
    return
  }

  let email: string
  try {
    email = await verifyIdToken(token)
  } catch (verificationError) {
    // El log queda solo en el servidor: al cliente no se le filtran detalles.
    console.error('send-summary: fallo al verificar el token', verificationError)
    sendJson(res, 401, { error: 'Token inválido o expirado.' })
    return
  }

  const validation = validateSummaryPayload(req.body)
  if (!validation.ok) {
    sendJson(res, 400, { error: validation.error })
    return
  }

  const summary = validation.value

  // El destinatario es SIEMPRE el email verificado del token, nunca del body.
  try {
    await sendEmail({
      to: email,
      subject: 'Resumen de tus tareas',
      html: buildEmailHtml(summary),
    })
    sendJson(res, 200, { ok: true })
  } catch (sendError) {
    // No se filtran detalles internos ni claves al cliente.
    console.error('send-summary: fallo el proveedor de email', sendError)
    sendJson(res, 502, {
      error: 'No se pudo enviar el email. Inténtalo de nuevo.',
      reason: classifyEmailError(sendError),
    })
  }
}

// Código corto y sin secretos para diagnosticar el fallo desde el navegador.
function classifyEmailError(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  const status = message.match(/Resend respondió con estado (\d{3})/)
  if (status !== null) {
    return `provider_${status[1]}`
  }
  if (message.includes('no configurada')) {
    return 'missing_config'
  }
  return 'provider_unreachable'
}
