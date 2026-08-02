import type { Block } from 'payload'

export const FAQ: Block = {
  slug: 'faq',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'question', type: 'text', localized: true, required: true },
        { name: 'answer', type: 'richText', localized: true },
      ],
    },
  ],
}
