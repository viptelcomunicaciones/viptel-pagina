import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Plugin } from 'payload'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import type { Page, Post, Project, Service } from '@/payload-types'
import { getFrontendURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page | Project | Service> = ({ doc }) => {
  return doc?.title ? `Viptel — ${doc.title}` : 'Viptel Comunicaciones'
}

// Public URLs live in the Astro frontend, not in the CMS
const generateURL: GenerateURL<Post | Page | Project | Service> = ({ doc, collectionConfig }) => {
  const url = getFrontendURL()
  if (collectionConfig?.slug === 'services') return doc?.slug ? `${url}/services/${doc.slug}` : url
  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'services'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'The Astro website checks redirects on every request (SSR).',
              },
            }
          }
          return field
        })
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['pages'],
    generateLabel: (_, doc) => String(doc.title),
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
]
