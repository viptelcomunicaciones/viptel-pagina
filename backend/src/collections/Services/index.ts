import type { CollectionConfig, CollectionSlug } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Cards } from '../../blocks/Cards/config'
import { Content } from '../../blocks/Content/config'
import { FAQ } from '../../blocks/FAQ/config'
import { Gallery } from '../../blocks/Gallery/config'
import { MediaContent } from '../../blocks/MediaContent/config'
import { Pricing } from '../../blocks/Pricing/config'
import { seoTab } from '../../fields/seoTab'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

export const Services: CollectionConfig = {
  slug: 'services',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'parent', '_status'],
    group: 'Content',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug as string,
          collection: 'services',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'services',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'services' as CollectionSlug,
      admin: {
        position: 'sidebar',
        description: 'Dejar vacío si es una categoría. Seleccionar un servicio padre si es un sub-servicio.',
      },
    },
    slugField(),
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'richText',
              localized: true,
            },
            {
              name: 'features',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'icon',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
            {
              name: 'pricing',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'planName',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                },
                {
                  name: 'currency',
                  type: 'text',
                  defaultValue: 'COP',
                },
                {
                  name: 'period',
                  type: 'text',
                  defaultValue: '/mes',
                },
                {
                  name: 'features',
                  type: 'array',
                  localized: true,
                  fields: [
                    {
                      name: 'feature',
                      type: 'text',
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'highlighted',
                  type: 'checkbox',
                  defaultValue: false,
                },
                {
                  name: 'ctaLabel',
                  type: 'text',
                  localized: true,
                },
              ],
            },
            {
              name: 'faq',
              type: 'array',
              localized: true,
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  localized: true,
                  required: true,
                },
                {
                  name: 'answer',
                  type: 'richText',
                  localized: true,
                  required: true,
                },
              ],
            },
            {
              name: 'gallery',
              type: 'array',
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'alt',
                  type: 'text',
                },
              ],
            },
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              blocks: [
                CallToAction,
                Content,
                FAQ,
                Gallery,
                Pricing,
                Cards,
                MediaContent,
              ],
            },
          ],
        },
        seoTab,
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
