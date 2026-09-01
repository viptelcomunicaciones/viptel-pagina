import type { CollectionSlug, Payload } from 'payload'

const collectionsWithVersions: CollectionSlug[] = ['pages', 'posts', 'projects', 'services']

export const cleanVersions = async (payload: Payload, options: { dryRun?: boolean } = {}): Promise<{ collections: string[] }> => {
  const { dryRun } = options
  payload.logger.info(`Cleaning draft versions (published docs are preserved)${dryRun ? ' — DRY RUN' : ''}...`)

  for (const collection of collectionsWithVersions) {
    const published = await payload.count({ collection, where: { _status: { equals: 'published' } } })
    if (dryRun) {
      payload.logger.info(`  - ${collection}: ${published.totalDocs} published, dry run — nothing deleted`)
      continue
    }
    payload.logger.info(`  - ${collection}: ${published.totalDocs} published, cleaning versions...`)
    await payload.db.deleteVersions({ collection, where: {} })
    payload.logger.info(`    → draft versions deleted (${published.totalDocs} published docs preserved)`)
  }

  payload.logger.info('Done. All draft versions cleaned.')
  return { collections: collectionsWithVersions }
}