import type { Block } from 'payload'

export const Pricing: Block = {
  slug: 'pricing',
  fields: [
    { name: 'name', type: 'text', localized: true, required: true },
    { name: 'price', type: 'number' },
    { name: 'currency', type: 'text', defaultValue: 'COP' },
    { name: 'interval', type: 'select', options: [{ label: 'One time', value: 'one-time' }, { label: 'Monthly', value: 'monthly' }] },
    {
      name: 'features',
      type: 'array',
      fields: [
        { name: 'feature', type: 'text', localized: true },
        { name: 'included', type: 'checkbox', defaultValue: true },
      ],
    },
    { name: 'linkText', type: 'text', localized: true },
    { name: 'linkUrl', type: 'text' },
  ],
}
