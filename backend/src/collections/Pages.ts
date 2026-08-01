import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { createParentField, createBreadcrumbsField } from '@payloadcms/plugin-nested-docs'
import { adminOrPublishedOnly, adminOnly } from '@/access'
import { Content } from '../blocks/Content'
import { MediaContent } from '../blocks/MediaContent'
import { Cards } from '../blocks/Cards'
import { Pricing } from '../blocks/Pricing'
import { CTA } from '../blocks/CTA'
import { FAQ } from '../blocks/FAQ'
import { Gallery } from '../blocks/Gallery'
import { Archive } from '../blocks/Archive'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: adminOrPublishedOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', '_status', 'createdAt'],
  },
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    { name: 'description', type: 'textarea', localized: true, admin: { position: 'sidebar' } },
    slugField({ useAsSlug: 'title' }),
    createParentField('pages', { admin: { position: 'sidebar' } }),
    createBreadcrumbsField('pages', { label: 'Breadcrumbs' }),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  defaultValue: 'lowImpact',
                  options: [
                    { label: 'High Impact', value: 'highImpact' },
                    { label: 'Medium Impact', value: 'mediumImpact' },
                    { label: 'Low Impact', value: 'lowImpact' },
                  ],
                },
                { name: 'title', type: 'text', localized: true },
                { name: 'description', type: 'textarea', localized: true },
                {
                  name: 'links',
                  type: 'array',
                  maxRows: 2,
                  admin: { initCollapsed: true },
                  fields: [
                    { name: 'label', type: 'text', required: true },
                    { name: 'url', type: 'text', required: true },
                  ],
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { condition: (_, siblingData) => ['highImpact', 'mediumImpact'].includes(siblingData?.type) },
                },
              ],
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              blocks: [Content, MediaContent, Cards, Pricing, CTA, FAQ, Gallery, Archive],
            },
          ],
        },
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
  ],
}
