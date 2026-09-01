type NewsletterEmailProps = {
  email?: string
  unsubscribeUrl?: string
}

export const renderNewsletterEmail = (props: NewsletterEmailProps): string => {
  const { email, unsubscribeUrl } = props

  return `
    <!doctype html>
    <html lang="es">
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f4f6f9;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px;">
          <h2 style="color: #0055aa; margin-top: 0;">¡Gracias por suscribirte!</h2>
          <p>Hola${email ? ` <strong>${email}</strong>` : ''},</p>
          <p>Has confirmado tu suscripción al boletín de <strong>Viptel Comunicaciones</strong>.</p>
          <p>Recibirás novedades sobre telecomunicaciones, desarrollo web y marketing digital.</p>
          ${unsubscribeUrl ? `<p style="font-size: 12px; color: #9ca3af;"><a href="${unsubscribeUrl}" style="color: #0055aa;">Cancelar suscripción</a></p>` : ''}
          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">Viptel Comunicaciones — Bogotá, Colombia</p>
        </div>
      </body>
    </html>
  `
}