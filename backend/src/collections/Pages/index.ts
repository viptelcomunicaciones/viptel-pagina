import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { adminOnly, contentRoles } from '../../access/roleBased'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Cards } from '../../blocks/Cards/config'
import { Content } from '../../blocks/Content/config'
import { FAQ } from '../../blocks/FAQ/config'
import { Gallery } from '../../blocks/Gallery/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { MediaContent } from '../../blocks/MediaContent/config'
import { Pricing } from '../../blocks/Pricing/config'
import { seoTab } from '../../fields/seoTab'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateFrontend } from '../../hooks/revalidateFrontend'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { Code } from '@/blocks/Code/config'
import { Form } from '@/blocks/FormBlock/config'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: contentRoles,
    delete: adminOnly,
    read: authenticatedOrPublished,
    update: contentRoles,
  },
  // Soft-delete: move to trash instead of hard delete
  trash: true,
  labels: {
    singular: 'Pagina',
    plural: 'Paginas',
  },
  // This config controls what's populated by default when a page is referenced
  defaultPopulate: {
    title: true,
    slug: true,
  },
admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug as string,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
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
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              localized: true,
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                Cards,
                Pricing,
                FAQ,
                Gallery,
                MediaContent,
                Code,
                Form,
              ],
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
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
      index: true,
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateFrontend],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
