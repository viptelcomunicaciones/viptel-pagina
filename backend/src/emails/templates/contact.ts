type ContactEmailProps = {
  name?: string
  email?: string
  phone?: string
  message?: string
  company?: string
}

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export const renderContactEmail = (props: ContactEmailProps): string => {
  const { name, email, phone, message, company } = props

  return `
    <!doctype html>
    <html lang="es">
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f4f6f9;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px;">
          <h2 style="color: #0055aa; margin-top: 0;">Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${phone ? `<p><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ''}
          ${company ? `<p><strong>Empresa:</strong> ${escapeHtml(company)}</p>` : ''}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="white-space: pre-wrap; color: #374151;">${escapeHtml(message)}</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">Viptel Comunicaciones — Bogotá, Colombia</p>
        </div>
      </body>
    </html>
  `
}