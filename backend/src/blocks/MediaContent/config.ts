import type { Block } from 'payload'

export const MediaContent: Block = {
  slug: 'media-content',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
