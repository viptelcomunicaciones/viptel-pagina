import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { adminOnly, contentRoles } from '../access/roleBased'
import { revalidateTaxonomy } from '../hooks/revalidateFrontend'
import { iconField } from '../fields/iconField'
import { slugify } from './Tags'

export const PostTypes: CollectionConfig = {
  slug: 'post-types',
  access: {
    create: contentRoles,
    delete: adminOnly,
    read: anyone,
    update: contentRoles,
  },
  labels: {
    singular: 'Tipo de contenido',
    plural: 'Tipos de contenido',
  },
  admin: {
    defaultColumns: ['title', 'slug', 'position'],
    description:
      'Formato del contenido del blog (guías, casos de éxito, noticias…). Es un eje aparte de la categoría: no crees un tipo por cada tema.',
    group: 'Content',
    useAsTitle: 'title',
  },
  hooks: {
    ...revalidateTaxonomy(['/blog']),
    beforeDelete: [
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'posts',
          where: {
            postType: { equals: id },
          },
        })
        if (totalDocs > 0) {
          throw new Error(
            `No se puede eliminar este tipo de contenido: tiene ${totalDocs} post(s) asignado(s).`,
          )
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField({
      position: undefined,
      useAsSlug: 'title',
      slugify: ({ valueToSlugify }) => slugify(String(valueToSlugify ?? '')),
    }),
    {
      name: 'description',
      type: 'textarea',
      localized: true,
    },
    iconField(),
    {
      name: 'position',
      type: 'number',
      admin: {
        description: 'Orden en el que aparece en las pestañas del blog.',
      },
      defaultValue: 0,
    },
  ],
}