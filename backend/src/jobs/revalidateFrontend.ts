import type { TaskConfig } from 'payload'

import { getInternalFrontendURL } from '@/utilities/getURL'

type RevalidateInput = {
  path?: string
  paths?: string[]
  collection?: string
  locale?: string
}

export const revalidateFrontendTask: TaskConfig<'revalidateFrontend'> = {
  slug: 'revalidateFrontend',
  inputSchema: [
    { name: 'path', type: 'text' },
    { name: 'paths', type: 'json' },
    { name: 'collection', type: 'text' },
    { name: 'locale', type: 'text', defaultValue: 'es' },
  ],
  retries: 2,
  handler: async ({ input }) => {
    const { path, paths, collection, locale } = input as RevalidateInput
    const frontendUrl = getInternalFrontendURL()
    const secret = process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
    if (!secret) {
      throw new Error('REVALIDATE_SECRET not configured')
    }

    const pathList = [...(Array.isArray(paths) ? paths : []), ...(path ? [path] : [])].filter(Boolean) as string[]
    if (pathList.length === 0) {
      throw new Error('No paths provided to revalidate')
    }

    const results = await Promise.allSettled(
      pathList.map(async (p) => {
        const url = new URL('/api/revalidate', frontendUrl)
        url.searchParams.set('secret', secret)

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: [p], collection, locale }),
        })

        if (!response.ok) {
          throw new Error(`Revalidation failed for ${p}: ${response.statusText}`)
        }
        return { path: p, status: 'success' }
      })
    )

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length > 0) {
      throw new Error(`Revalidation failed for ${failed.length} paths`)
    }

    return { output: { revalidated: pathList } }
  },
}