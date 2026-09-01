type WelcomeEmailProps = {
  name?: string
  loginUrl?: string
}

export const renderWelcomeEmail = (props: WelcomeEmailProps): string => {
  const { name, loginUrl } = props

  return `
    <!doctype html>
    <html lang="es">
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 24px; background: #f4f6f9;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px;">
          <h2 style="color: #0055aa; margin-top: 0;">Bienvenido a Viptel Comunicaciones</h2>
          <p>Hola${name ? ` <strong>${name}</strong>` : ''},</p>
          <p>Tu cuenta ha sido creada correctamente en el CMS de <strong>Viptel Comunicaciones</strong>.</p>
          ${loginUrl ? `<p><a href="${loginUrl}" style="display: inline-block; background: #0055aa; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Iniciar sesión</a></p>` : ''}
          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">Viptel Comunicaciones — Bogotá, Colombia</p>
        </div>
      </body>
    </html>
  `
}