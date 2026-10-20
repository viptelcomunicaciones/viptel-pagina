import type { Payload } from 'payload'
import type { Footer, Header } from '@/payload-types'

/**
 * Fetches all globals with a single async operation.
 * Mirror of template utility.
 */
export const getGlobals = async (payload: Payload): Promise<{
  header: Header
  footer: Footer
}> => {
  const [header, footer] = await Promise.all([
    payload.findGlobal({ slug: 'header', depth: 1 }),
    payload.findGlobal({ slug: 'footer', depth: 1 }),
  ])

  return { header, footer }
}
