import type { Payload } from 'payload'

/**
 * Fetches all globals with a single async operation.
 * Mirror of template utility.
 */
export const getGlobals = async (payload: Payload): Promise<{
  header: any
  footer: any
}> => {
  const [header, footer] = await Promise.all([
    payload.findGlobal({ slug: 'header', depth: 1 }),
    payload.findGlobal({ slug: 'footer', depth: 1 }),
  ])

  return { header, footer }
}
