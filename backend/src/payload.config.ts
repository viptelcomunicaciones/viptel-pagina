import { postgresAdapter } from '@payloadcms/db-postgres'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { resendAdapter } from '@payloadcms/email-resend'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      title: 'Viptel CMS',
      description: 'Panel de administración de Viptel Comunicaciones',
    },
  },
  collections: [Categories, Media, Pages, Posts, Projects, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@viptelcomunicaciones.com',
        defaultFromName: 'Viptel Comunicaciones',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.FRONTEND_URL || 'http://localhost:4321',
  ].filter(Boolean),
  localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    fallback: true,
  },
  plugins: [
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => String(doc.title),
      generateURL: (docs) =>
        docs.reduce((url, doc) => {
          const slug = String(doc.slug || doc.title || '').toLowerCase().replace(/\s+/g, '-')
          return `${url}/${slug}`
        }, ''),
    }),
    seoPlugin({
      collections: ['pages', 'posts', 'projects'],
      generateTitle: ({ doc }) => `Viptel — ${doc?.title || ''}`,
      generateDescription: ({ doc }) => doc?.excerpt || doc?.description || '',
    }),
  ],
  sharp,
})
