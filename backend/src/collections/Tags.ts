import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { adminOnly, contentRoles } from '../access/roleBased'
import { slugField } from 'payload'

// Matches the website's `tagToSlug` (lowercase, strip accents, spaces → dashes)
// so tag slugs are stable and identical across CMS and public site.
export const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    create: contentRoles,
    delete: adminOnly,
    read: anyone,
    update: contentRoles,
  },
  labels: {
    singular: 'Etiqueta',
    plural: 'Etiquetas',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
      useAsSlug: 'name',
      slugify: ({ valueToSlugify }) => slugify(String(valueToSlugify ?? '')),
    }),
  ],
}