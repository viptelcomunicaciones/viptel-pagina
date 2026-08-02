import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'images',
      type: 'array',
      required: true,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text' },
        { name: 'caption', type: 'text', localized: true },
      ],
    },
  ],
}
