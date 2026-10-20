import type { CollectionSlug, TaskConfig } from 'payload'

type ResyncInput = {
  collection?: string
}

const SEARCHABLE_COLLECTIONS: CollectionSlug[] = ['pages', 'posts', 'projects', 'services']

export const resyncSearchIndexTask: TaskConfig<'resyncSearchIndex'> = {
  slug: 'resyncSearchIndex',
  inputSchema: [
    { name: 'collection', type: 'text', required: true },
  ],
  retries: 0,
  handler: async ({ input, req }) => {
    const { collection } = input as ResyncInput

    if (!collection || !SEARCHABLE_COLLECTIONS.includes(collection as CollectionSlug)) {
      req.payload.logger.warn(
        `resyncSearchIndex: Unsupported collection "${String(collection)}"`,
      )
      return { output: { skipped: true, reason: 'unsupported collection' } }
    }

    const { docs } = await req.payload.find({
      collection: collection as CollectionSlug,
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    })

    for (const doc of docs) {
      await req.payload.update({
        collection: collection as CollectionSlug,
        id: doc.id,
        data: {},
        context: { disableRevalidate: true },
      })
    }

    req.payload.logger.info(`resyncSearchIndex: synced ${docs.length} docs in ${collection}`)
    return { output: { collection, synced: docs.length, skipped: false } }
  },
}