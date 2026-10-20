import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { adminOnly, contentRoles } from '../access/roleBased'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  access: {
    create: contentRoles,

    delete: adminOnly,

    read: anyone,

    update: contentRoles,

  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory making them publicly accessible even outside of Payload
    staticDir: process.env.MEDIA_PATH || path.resolve(dirname, '../../public/media'),
    adminThumbnail: ({ doc }) => {
      const sizes = doc?.sizes as Record<string, { url?: string }> | undefined
      if (sizes?.thumbnail?.url) return sizes.thumbnail.url
      if (typeof doc?.url === 'string' && doc.url) return doc.url
      if (process.env.R2_PUBLIC_URL && typeof doc?.filename === 'string') {
        const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/+$/, '')
        return `${publicUrl}/${doc.filename}`
      }
      return null
    },
    focalPoint: true,
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'square',
        width: 500,
        height: 500,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'small',
        width: 600,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'medium',
        width: 900,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'large',
        width: 1400,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'xlarge',
        width: 1920,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
    ],
  },
}
