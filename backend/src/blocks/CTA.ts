import type { Block } from 'payload'

export const CTA: Block = {
  slug: 'cta',
  fields: [
    { name: 'heading', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'linkText', type: 'text', localized: true },
    { name: 'linkUrl', type: 'text' },
  ],
}