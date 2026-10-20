import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  const payload = await getPayload({ config })
  payload.logger.info('Resyncing search index for all searchable collections...')

  const collections = ['pages', 'posts', 'projects', 'services'] as const
  let totalIndexed = 0

  for (const collection of collections) {
    const { docs } = await payload.find({
      collection,
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
    })

    payload.logger.info(`Indexing ${docs.length} published docs from "${collection}"...`)

    for (const doc of docs) {
      for (const locale of ['es', 'en'] as const) {
        try {
          await payload.update({
            collection,
            id: doc.id,
            locale,
            data: {},
            context: { disableRevalidate: true },
          })
          totalIndexed++
        } catch (err) {
          payload.logger.warn(`Could not sync doc ${doc.id} (${locale}) in ${collection}: ${err}`)
        }
      }
    }
  }

  payload.logger.info(`Done! Successfully synced ${totalIndexed} documents into search index.`)
  process.exit(0)
}

run().catch((err) => {
  console.error('Error resyncing search index:', err)
  process.exit(1)
})
