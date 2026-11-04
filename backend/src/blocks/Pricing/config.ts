import type { Block } from 'payload'

export const Pricing: Block = {
  slug: 'pricing',
  fields: [
    { name: 'heading', type: 'text', localized: true, label: 'Heading de sección' },
    {
      name: 'plans',
      type: 'array',
      label: 'Planes de Precios (Múltiples planes)',
      fields: [
        { name: 'name', type: 'text', localized: true, required: true },
        { name: 'price', type: 'number' },
        { name: 'currency', type: 'text', defaultValue: 'COP' },
        {
          name: 'interval',
          type: 'select',
          options: [
            { label: 'One time', value: 'one-time' },
            { label: 'Monthly', value: 'monthly' },
          ],
        },
        { name: 'highlighted', type: 'checkbox', defaultValue: false, label: 'Destacar este plan' },
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
    },
    // Campos legados para compatibilidad hacia atrás
    {
      type: 'collapsible',
      label: 'Plan Único (Modo legado)',
      admin: {
        initCollapsed: true,
        description: 'Usar únicamente si no se define la lista de planes arriba.',
      },
      fields: [
        { name: 'name', type: 'text', localized: true },
        { name: 'price', type: 'number' },
        { name: 'currency', type: 'text', defaultValue: 'COP' },
        {
          name: 'interval',
          type: 'select',
          options: [
            { label: 'One time', value: 'one-time' },
            { label: 'Monthly', value: 'monthly' },
          ],
        },
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
    },
  ],
}
