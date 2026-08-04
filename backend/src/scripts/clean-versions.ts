import 'dotenv/config'
import type { CollectionSlug, Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'

const collectionsWithVersions: CollectionSlug[] = ['pages', 'posts', 'projects', 'services']

export const cleanVersions = async (payload: Payload): Promise<void> => {
  payload.logger.info('Cleaning ALL draft versions...')

  for (const collection of collectionsWithVersions) {
    payload.logger.info(`  - ${collection}: deleting versions...`)
    const result = await payload.db.deleteVersions({ collection, where: {} })
    payload.logger.info(`    → ${result.length} versions deleted`)
  }

  payload.logger.info('Done. All draft versions cleaned. Published documents remain intact.')
}

const payload = await getPayload({ config })
await cleanVersions(payload)
process.exit(0)
