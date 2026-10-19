import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { Plugin } from 'payload'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import { anyone } from '@/access/anyone'
import { adminOnly, contentRoles } from '@/access/roleBased'
import type { Page, Post, Project, Service } from '@/payload-types'
import { getFrontendURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page | Project | Service> = ({ doc }) => {
  const title = doc?.title ? String(doc.title).trim() : ''
  const slug = doc?.slug ? String(doc.slug).trim() : ''

  if (slug === 'home' || !title) {
    return 'Viptel Comunicaciones — Telecomunicaciones y Soluciones Digitales'
  }

  // Si el título ya contiene el nombre de marca, se respeta sin duplicar
  if (title.toLowerCase().includes('viptel')) {
    return title
  }

  return `${title} — Viptel Comunicaciones`
}

// Public URLs live in the Astro frontend, not in the CMS
const generateURL: GenerateURL<Post | Page | Project | Service> = ({ doc, collectionConfig }) => {
  const url = getFrontendURL()
  const slug = doc?.slug || ''
  if (collectionConfig?.slug === 'services') {
    return slug ? `${url}/services/${slug}` : `${url}/services`
  }
  if (collectionConfig?.slug === 'posts') {
    return slug ? `${url}/blog/${slug}` : `${url}/blog`
  }
  if (collectionConfig?.slug === 'projects') {
    return slug ? `${url}/projects/${slug}` : `${url}/projects`
  }
  if (slug === 'home') return url
  return slug ? `${url}/${slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'services'],
    redirectTypes: ['301', '302'],
    redirectTypeFieldOverride: { defaultValue: '301', required: false },
    overrides: {
      access: {
        read: anyone,
        create: contentRoles,
        update: contentRoles,
        delete: adminOnly,
      },
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
  searchPlugin({
    collections: ['pages', 'posts', 'projects', 'services'],
    localize: true,
    defaultPriorities: {
      services: 40,
      pages: 30,
      projects: 20,
      posts: 10,
    },
    searchOverrides: {
      slug: 'search',
      access: {
        read: anyone,
        create: contentRoles,
        update: contentRoles,
        delete: adminOnly,
      },
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'slug',
          type: 'text',
          index: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'excerpt',
          type: 'textarea',
          localized: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'url',
          type: 'text',
          localized: true,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    beforeSync: ({ originalDoc, searchDoc, collectionSlug }) => {
      const slug = originalDoc?.slug || ''
      const rawExcerpt =
        (typeof originalDoc?.excerpt === 'string' && originalDoc.excerpt) ||
        (typeof originalDoc?.shortDescription === 'string' && originalDoc.shortDescription) ||
        (typeof originalDoc?.description === 'string' && originalDoc.description) ||
        (typeof originalDoc?.meta?.description === 'string' && originalDoc.meta.description) ||
        ''

      let url = `/${slug}`
      if (collectionSlug === 'services') url = `/services/${slug}`
      else if (collectionSlug === 'posts') url = `/blog/${slug}`
      else if (collectionSlug === 'projects') url = `/projects/${slug}`
      else if (collectionSlug === 'pages') url = slug === 'home' ? '/' : `/${slug}`

      return {
        ...searchDoc,
        title: originalDoc?.title || searchDoc.title || slug,
        slug,
        excerpt: rawExcerpt,
        url,
      }
    },
  }),
]

