import type { CollectionSlug, PayloadRequest } from 'payload'

import { getFrontendURL } from './getURL'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/blog',
  projects: '/projects',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

// Points to the Astro preview endpoint. Astro validates the secret,
// sets a preview cookie and fetches drafts via the REST API (?draft=true)
export const generatePreviewPath = ({ collection, slug, req }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Non-default locales are served under a locale prefix in Astro (/en/...)
  const locale = req.locale && req.locale !== 'es' ? `/${req.locale}` : ''

  const encodedParams = new URLSearchParams({
    path: `${locale}${collectionPrefixMap[collection]}/${encodeURIComponent(slug)}`,
    secret: process.env.PREVIEW_SECRET || '',
  })

  return `${getFrontendURL()}/api/preview?${encodedParams.toString()}`
}
