# Task 1: Backend — Services collection

## Files
- Create: `backend/src/collections/Services/index.ts`

## Requirements

Create a new Payload CMS collection `services` with self-referential parent field for 2-level hierarchy (categories with null parent, sub-services with parent set).

### Collection config

```ts
import type { CollectionConfig } from 'payload'

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

export const Services: CollectionConfig<'services'> = {
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
      relationTo: 'services',
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
```

## Verification

1. Verify the file compiles: `pnpm --filter ./backend run build`
2. Run existing backend tests to ensure no regressions: `pnpm --filter ./backend run test:int`

NOTE: The collection is created but NOT yet registered in payload.config.ts — that's Task 2. The build won't pick it up yet, but import resolution should work.
