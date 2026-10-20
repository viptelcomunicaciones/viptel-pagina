import type { CollectionAfterChangeHook, GlobalAfterChangeHook } from 'payload'

import { getInternalFrontendURL } from '@/utilities/getURL'

export const revalidateFrontend: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
  context,
}) => {
  if (
    process.env.DISABLE_REVALIDATE === 'true' ||
    context?.disableRevalidate ||
    req.context?.disableRevalidate
  ) {
    return doc
  }

  if (doc._status === 'draft') {
    // Skip autosave drafts to avoid spamming the revalidation endpoint
    return doc
  }

  const secret = process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
  if (!secret) {
    req.payload.logger.warn('REVALIDATE_SECRET not configured — skipping revalidation')
    return doc
  }

  const frontendUrl = getInternalFrontendURL()
  const collectionSlug = typeof collection === 'string' ? collection : collection?.slug
  const paths: string[] = []

  if (collectionSlug === 'pages' && Array.isArray(doc.breadcrumbs) && doc.breadcrumbs.length > 0) {
    for (const crumb of doc.breadcrumbs) {
      if (crumb?.url) paths.push(crumb.url)
    }
  }

  const basePath =
    collectionSlug === 'services'
      ? `/services/${doc.slug}`
      : collectionSlug === 'posts'
        ? `/blog/${doc.slug}`
        : collectionSlug === 'projects'
          ? `/projects/${doc.slug}`
          : doc.slug && doc.slug !== 'home'
            ? `/${doc.slug}`
            : '/'
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
    req.payload.logger.error(
      `Revalidation error for ${collectionSlug}/${doc.id}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ global, doc, req, context }) => {
  if (
    process.env.DISABLE_REVALIDATE === 'true' ||
    context?.disableRevalidate ||
    req.context?.disableRevalidate
  ) {
    return doc
  }

  const secret = process.env.REVALIDATE_SECRET || process.env.PREVIEW_SECRET
  if (!secret) {
    req.payload.logger.warn('REVALIDATE_SECRET not configured — skipping global revalidation')
    return doc
  }

  const frontendUrl = getInternalFrontendURL()
  const globalSlug = typeof global === 'string' ? global : global?.slug

  try {
    const url = new URL('/api/revalidate', frontendUrl)
    url.searchParams.set('secret', secret)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: ['/'], collection: `global:${globalSlug}` }),
    })

    if (!response.ok) {
      req.payload.logger.error(`Global revalidation failed (${response.status}) for ${globalSlug}`)
    }
  } catch (error) {
    req.payload.logger.error(
      `Global revalidation error for ${globalSlug}: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  return doc
}