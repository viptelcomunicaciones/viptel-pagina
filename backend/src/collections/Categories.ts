import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { adminOrPublishedOnly, adminOnly } from '@/access'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: adminOrPublishedOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField({ useAsSlug: 'title' }),
  ],
}
