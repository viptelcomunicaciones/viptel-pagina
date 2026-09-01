import type { TaskConfig } from 'payload'

type ResyncInput = {
  collection?: string
}

export const resyncSearchIndexTask: TaskConfig<'resyncSearchIndex'> = {
  slug: 'resyncSearchIndex',
  inputSchema: [
    { name: 'collection', type: 'text', required: true },
  ],
  retries: 0,
  handler: async ({ input, req }) => {
    const { collection } = input as ResyncInput

    if (!process.env.MEILISEARCH_HOST) {
      req.payload.logger.warn(
        `resyncSearchIndex: Meilisearch not configured — deferring to infra plan (collection: ${collection})`,
      )
      return { output: { skipped: true, reason: 'meilisearch not configured' } }
    }

    req.payload.logger.info(`resyncSearchIndex: bulk reindex of ${collection} would run here (infra plan)`)
    return { output: { collection, skipped: true, reason: 'infra plan' } }
  },
}