import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import type { User } from '@/payload-types'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { PostTypes } from './collections/PostTypes'
import { Projects } from './collections/Projects'
import { ProjectCategories } from './collections/ProjectCategories'
import { ProjectTypes } from './collections/ProjectTypes'
import { Services } from './collections/Services'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getFrontendURL, getServerSideURL } from './utilities/getURL'
import {
  cleanupVersionsTask,
  generateSitemapTask,
  resyncSearchIndexTask,
  revalidateFrontendTask,
  webhookDeliveryTask,
} from './jobs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      afterNavLinks: ['@/components/LogoutButton#LogoutButton'],
      beforeDashboard: ['@/components/BeforeDashboard#BeforeDashboard', '@/components/DashboardWidgets/MyDraftsWidget#MyDraftsWidget'],
      beforeLogin: ['@/components/BeforeLogin#BeforeLogin'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    meta: {
      title: 'Viptel CMS',
      description: 'Panel de administración de Viptel Comunicaciones',
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [Pages, Posts, Projects, Services, Media, Categories, Tags, PostTypes, ProjectTypes, ProjectCategories, Users],
  cors: [getServerSideURL(), getFrontendURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [...plugins, mcpPlugin({}), formBuilderPlugin({
    fields: { payment: false },
    formSubmissionOverrides: {
      fields: ({ defaultFields }) => defaultFields,
    },
  })],
  secret: process.env.PAYLOAD_SECRET || '',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  email: process.env.RESEND_API_KEY
    ? resendAdapter({
        defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@viptelcomunicaciones.com',
        defaultFromName: 'Viptel Comunicaciones',
        apiKey: process.env.RESEND_API_KEY,
      })
    : undefined,
localization: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    fallback: true,
  },
  // Allow admins to save and share list filters, columns,and sort orders
queryPresets: {
    access: {
      create: ({ req: { user } }) => (user as User)?.roles?.includes('admin') || false,
      delete: ({ req: { user } }) => (user as User)?.roles?.includes('admin') || false,
      read: ({ req: { user } }) => Boolean(user),
      update: ({ req: { user } }) => (user as User)?.roles?.includes('admin') || false,
    },
    constraints: {},
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the cron secret to be present as an Authorization header
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [
      revalidateFrontendTask,
      resyncSearchIndexTask,
      generateSitemapTask,
      cleanupVersionsTask,
      webhookDeliveryTask,
    ],
  },
})
