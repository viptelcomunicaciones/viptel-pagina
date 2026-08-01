import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { adminOrPublishedOnly, adminOnly } from '@/access'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: adminOrPublishedOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'client', 'year', '_status'],
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField({ useAsSlug: 'title' }),
    { name: 'description', type: 'textarea', localized: true },
    { name: 'content', type: 'richText', localized: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'alt', type: 'text' },
      ],
    },
    { name: 'client', type: 'text', admin: { position: 'sidebar' } },
    { name: 'year', type: 'number', admin: { position: 'sidebar' } },
    {
      name: 'tags',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [{ name: 'tag', type: 'text' }],
    },
  ],
}
