import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { everyone, adminOnly } from '@/access'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const MEDIA_PATH = process.env.MEDIA_PATH || path.resolve(dirname, '../../public/media')

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: everyone,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: MEDIA_PATH,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 300 },
      { name: 'small', width: 600 },
      { name: 'medium', width: 900 },
      { name: 'large', width: 1400 },
      { name: 'xlarge', width: 1920 },
      { name: 'og', width: 1200, height: 630, crop: 'center' },
    ],
  },
}
