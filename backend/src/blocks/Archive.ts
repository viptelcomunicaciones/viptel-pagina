import type { Block } from 'payload'

export const Archive: Block = {
  slug: 'archive',
  interfaceName: 'ArchiveBlock',
  fields: [
    {
      name: 'introContent',
      type: 'richText',
      label: 'Intro Content',
    },
    {
      name: 'populateBy',
      type: 'select',
      defaultValue: 'collection',
      options: [
        { label: 'Collection', value: 'collection' },
        { label: 'Individual Selection', value: 'selection' },
      ],
    },
    {
      name: 'relationTo',
      type: 'select',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'collection' },
      defaultValue: 'posts',
      options: [{ label: 'Posts', value: 'posts' }],
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'collection' },
      hasMany: true,
      relationTo: 'categories',
    },
    {
      name: 'limit',
      type: 'number',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'collection', step: 1 },
      defaultValue: 10,
    },
    {
      name: 'selectedDocs',
      type: 'relationship',
      admin: { condition: (_, siblingData) => siblingData.populateBy === 'selection' },
      hasMany: true,
      relationTo: ['posts'],
    },
  ],
  labels: { plural: 'Archives', singular: 'Archive' },
}
