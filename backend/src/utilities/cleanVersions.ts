import type { CollectionSlug, Payload } from 'payload'

const collectionsWithVersions: CollectionSlug[] = ['pages', 'posts', 'projects', 'services']

export interface CleanVersionsOptions {
  dryRun?: boolean
  keep?: number
}

export const cleanVersions = async (
  payload: Payload,
  options: CleanVersionsOptions = {},
): Promise<{ collections: string[]; totalDeleted: number }> => {
  const { dryRun = false, keep = 5 } = options
  payload.logger.info(
    `Cleaning excess versions (keeping up to ${keep} latest per document)${dryRun ? ' [DRY RUN]' : ''}...`,
  )

  let totalDeletedAll = 0

  for (const collection of collectionsWithVersions) {
    payload.logger.info(`Processing collection: "${collection}"...`)

    // 1. Fetch all parent documents in this collection
    const allDocs = await payload.find({
      collection,
      limit: 1000,
      pagination: false,
      depth: 0,
    })

    let collectionDeleted = 0
    let collectionExamined = 0

    for (const doc of allDocs.docs) {
      collectionExamined++
      const docId = doc.id

      // 2. Find all versions for this document, sorted newest first
      const versionsRes = await payload.findVersions({
        collection,
        where: {
          parent: {
            equals: docId,
          },
        },
        limit: 200,
        sort: '-createdAt',
      })

      const versions = versionsRes.docs || []

      // If document has keep (e.g. 5) or fewer versions, DO NOT TOUCH (keep all)
      if (versions.length <= keep) {
        continue
      }

      // The versions beyond `keep` are the ones to prune (the oldest ones)
      const versionsToDelete = versions.slice(keep)

      const idsToDelete = versionsToDelete
        .map((v) => v.id)
        .filter((id): id is string => Boolean(id))

      if (idsToDelete.length === 0) continue

      if (dryRun) {
        payload.logger.info(
          `  [DRY RUN] Doc #${docId}: ${versions.length} versions total. Would delete ${idsToDelete.length} oldest versions, keeping latest ${keep}.`,
        )
      } else {
        await payload.db.deleteVersions({
          collection,
          where: {
            id: {
              in: idsToDelete,
            },
          },
        })
        payload.logger.info(
          `  Doc #${docId}: deleted ${idsToDelete.length} oldest versions (kept ${keep} latest).`,
        )
      }

      collectionDeleted += idsToDelete.length
    }

    payload.logger.info(
      `Finished "${collection}": ${collectionExamined} docs checked, ${collectionDeleted} versions ${dryRun ? 'eligible for deletion' : 'deleted'}.`,
    )
    totalDeletedAll += collectionDeleted
  }

  payload.logger.info(
    `Done. Total versions ${dryRun ? 'identified to delete' : 'deleted'}: ${totalDeletedAll}. All documents preserve up to ${keep} latest versions.`,
  )

  return { collections: collectionsWithVersions, totalDeleted: totalDeletedAll }
}
