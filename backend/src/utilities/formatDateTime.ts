/**
 * Formats a date with locale awareness for the Payload admin.
 * Mirror of the template utility: https://github.com/payloadcms/payload/blob/main/templates/website/src/utilities/formatDateTime.ts
 */
export const formatDateTime = (timestamp: string, locale = 'es'): string => {
  const now = new Date()
  let date = new Date(timestamp)
  if (!date.getTime()) date = now

  const diff = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diff / (1000 * 60))
  const diffHours = Math.floor(diff / (1000 * 60 * 60))
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  const localeString = locale === 'en' ? 'en-US' : 'es-CO'

  if (diffMinutes < 1) return 'Ahora mismo'
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays} días`

  return date.toLocaleDateString(localeString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
