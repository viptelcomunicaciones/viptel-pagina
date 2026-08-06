import 'dotenv/config'
import type { CollectionSlug, Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'

const collectionsWithVersions: CollectionSlug[] = ['pages', 'posts', 'projects', 'services']

export const cleanVersions = async (payload: Payload): Promise<void> => {
  payload.logger.info('Cleaning draft versions (published docs are preserved)...')

  for (const collection of collectionsWithVersions) {
    // Count published docs first
    const published = await payload.count({ collection, where: { _status: { equals: 'published' } } })
    payload.logger.info(`  - ${collection}: ${published.totalDocs} published, cleaning versions...`)
    await payload.db.deleteVersions({ collection, where: {} })
    payload.logger.info(`    → draft versions deleted (${published.totalDocs} published docs preserved)`)
  }

  payload.logger.info('Done. All draft versions cleaned.')
}

const payload = await getPayload({ config })
await cleanVersions(payload)
process.exit(0)
