import type { PayloadRequest } from 'payload'

import { getFrontendURL } from './getURL'

const collectionPrefixMap: Record<string, string> = {
  posts: '/blog',
  projects: '/projects',
  services: '/services',
  pages: '',
}

type Props = {
  collection: string
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

  // The landing page slug in Payload is "home", which lives at the website root ("/" or "/<locale>")
  let targetPath = ''
  if (collection === 'pages' && slug === 'home') {
    targetPath = locale || '/'
  } else {
    const prefix = collectionPrefixMap[collection] || ''
    targetPath = `${locale}${prefix}/${encodeURIComponent(slug)}`.replace(/\/+/g, '/')
  }

  const encodedParams = new URLSearchParams({
    path: targetPath,
    secret: process.env.PREVIEW_SECRET || '',
  })

  return `${getFrontendURL()}/api/preview?${encodedParams.toString()}`
}
