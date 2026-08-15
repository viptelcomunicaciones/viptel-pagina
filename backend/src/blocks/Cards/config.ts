import type { Block } from 'payload'

import { iconField } from '../../fields/iconField'

export const Cards: Block = {
  slug: 'cards',
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'cards',
      type: 'array',
      required: true,
      fields: [
        iconField(),
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'description', type: 'textarea', localized: true },
        { name: 'linkUrl', type: 'text' },
      ],
    },
  ],
}
