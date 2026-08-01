import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { lexicalEditor, BlocksFeature, FixedToolbarFeature, InlineToolbarFeature, HorizontalRuleFeature } from '@payloadcms/richtext-lexical'
import { adminOrPublishedOnly, adminOnly } from '@/access'
import { setAuthor } from '@/hooks/setAuthor'
import { Banner } from '../blocks/Banner'
import { Code } from '../blocks/Code'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: adminOrPublishedOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'author', 'categories', '_status', 'publishedAt'],
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [setAuthor],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'content',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          BlocksFeature({ blocks: [Banner, Code] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
        ],
      }),
    },
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'author', type: 'relationship', relationTo: 'users', admin: { position: 'sidebar' } },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    {
      name: 'tags',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [{ name: 'tag', type: 'text' }],
    },
  ],
}
