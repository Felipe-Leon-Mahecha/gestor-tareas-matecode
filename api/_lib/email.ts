export interface SendEmailInput {
  to: string
  subject: string
  html: string
}

// Todo el proveedor de email vive aquí: cambiarlo por AWS SES en el futuro
// solo requiere reescribir esta función, sin tocar el endpoint.
export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey === undefined || apiKey === '') {
    throw new Error('RESEND_API_KEY no configurada.')
  }

  const from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!response.ok) {
    // El detalle de Resend se registra solo en el servidor para diagnosticar.
    const detail = await response.text()
    throw new Error(`Resend respondió con estado ${response.status}: ${detail}`)
  }
}
