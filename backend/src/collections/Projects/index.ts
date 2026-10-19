import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { adminOnly, contentRoles } from '../../access/roleBased'
import { seoTab } from '../../fields/seoTab'
import { tocField } from '../../fields/tocField'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { revalidateFrontend } from '../../hooks/revalidateFrontend'

import { slugField } from 'payload'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  access: {
    create: contentRoles,
    delete: adminOnly,
    read: authenticatedOrPublished,
    update: contentRoles,
  },
  // Soft-delete: move to trash instead of hard delete
  trash: true,
  labels: {
    singular: 'Proyecto',
    plural: 'Proyectos',
  },
  defaultPopulate: {
    title: true,
    slug: true,
    projectType: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
admin: {
    defaultColumns: ['title', 'client', 'year', '_status'],
    group: 'Content',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'projects',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'projects',
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
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'coverImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
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
          ],
        },
        {
          label: 'Meta',
          fields: [
            {
              name: 'client',
              type: 'text',
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'year',
              type: 'number',
              index: true,
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'projectType',
              type: 'relationship',
              admin: {
                description: 'Formato del proyecto. Es un eje aparte de la categoría.',
                position: 'sidebar',
              },
              index: true,
              relationTo: 'project-types',
              required: true,
            },
{
              name: 'categories',
              type: 'relationship',
              admin: {
                description: 'Categoría raíz o subcategoría (una sola por proyecto).',
                position: 'sidebar',
              },
              index: true,
              relationTo: 'project-categories',
            },
            {
              name: 'tags',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              index: true,
              relationTo: 'tags',
            },
            {
              name: 'websiteUrl',
              type: 'text',
              admin: {
                position: 'sidebar',
                description: 'URL del proyecto en vivo (botón "Ver sitio en vivo").',
              },
            },
            {
              name: 'sourceUrl',
              type: 'text',
              admin: {
                position: 'sidebar',
                description: 'URL del código fuente (botón "Ver código fuente").',
              },
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
      index: true,
    },
    tocField(),
    slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateFrontend],
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
