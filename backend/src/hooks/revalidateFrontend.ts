import type { CollectionAfterChangeHook } from 'payload'

import { getFrontendURL } from '@/utilities/getURL'

export const revalidateFrontend: CollectionAfterChangeHook = async ({ collection, doc, req }) => {
  if (doc._status === 'draft') {
    // Skip autosave drafts to avoid spamming the revalidation endpoint
    return doc
  }

  const secret = process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
  if (!secret) {
    req.payload.logger.warn('REVALIDATE_SECRET not configured — skipping revalidation')
    return doc
  }

  const frontendUrl = getFrontendURL()
  const collectionSlug = typeof collection === 'string' ? collection : collection?.slug
  const paths: string[] = []

  if (collectionSlug === 'pages' && Array.isArray(doc.breadcrumbs) && doc.breadcrumbs.length > 0) {
    for (const crumb of doc.breadcrumbs) {
      if (crumb?.url) paths.push(crumb.url)
    }
  }

  const basePath = collectionSlug === 'services' ? `/services/${doc.slug}` : doc.slug ? `/${doc.slug}` : '/'
  paths.push(basePath)

  try {
    const url = new URL('/api/revalidate', frontendUrl)
    url.searchParams.set('secret', secret)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths, collection: collectionSlug, locale: doc.locale }),
    })

    if (!response.ok) {
      req.payload.logger.error(`Revalidation failed (${response.status}) for ${collectionSlug}/${doc.id}`)
    }
  } catch (error) {
    req.payload.logger.error(`Revalidation error for ${collectionSlug}/${doc.id}: ${error instanceof Error ? error.message : String(error)}`)
  }

  return doc
}