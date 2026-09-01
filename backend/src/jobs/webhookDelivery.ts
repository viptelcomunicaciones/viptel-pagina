import type { TaskConfig } from 'payload'

type WebhookInput = {
  url?: string
  payload?: unknown
  retries?: number
}

export const webhookDeliveryTask: TaskConfig<'webhookDelivery'> = {
  slug: 'webhookDelivery',
  inputSchema: [
    { name: 'url', type: 'text', required: true },
    { name: 'payload', type: 'json' },
    { name: 'retries', type: 'number', defaultValue: 3 },
  ],
  retries: 3,
  handler: async ({ input, req }) => {
    const { url, payload, retries } = input as WebhookInput
    if (!url) {
      throw new Error('webhookDelivery: url is required')
    }

    const maxAttempts = Math.max(1, Number(retries ?? 3))
    let lastError: unknown

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload ?? {}),
        })
        if (!response.ok) {
          throw new Error(`Webhook responded ${response.status}`)
        }
        return { output: { delivered: true, attempts: attempt } }
      } catch (error) {
        lastError = error
        if (attempt < maxAttempts) {
          // Exponential backoff: 1s, 2s, 4s...
          await new Promise((resolve) => setTimeout(resolve, 2 ** (attempt - 1) * 1000))
        }
      }
    }

    req.payload.logger.error(`webhookDelivery: failed after ${maxAttempts} attempts to ${url}`)
    throw lastError
  },
}