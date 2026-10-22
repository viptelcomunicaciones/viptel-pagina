import type { CollectionConfig } from 'payload'

import { slugField } from 'payload'

import { anyone } from '../access/anyone'
import { adminOnly, contentRoles } from '../access/roleBased'
import { revalidateTaxonomy } from '../hooks/revalidateFrontend'
import { iconField } from '../fields/iconField'
import { slugify } from './Tags'

export const ProjectTypes: CollectionConfig = {
  slug: 'project-types',
  access: {
    create: contentRoles,
    delete: adminOnly,
    read: anyone,
    update: contentRoles,
  },
  labels: {
    singular: 'Tipo de proyecto',
    plural: 'Tipos de proyecto',
  },
  admin: {
    defaultColumns: ['title', 'slug', 'position'],
    description:
      'Formato del proyecto (web, telecomunicaciones, marketing…). Es un eje aparte de la categoría.',
    group: 'Content',
    useAsTitle: 'title',
  },
  hooks: {
    ...revalidateTaxonomy(['/projects']),
    beforeDelete: [
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'projects',
          where: {
            projectType: { equals: id },
          },
        })
        if (totalDocs > 0) {
          throw new Error(
            `No se puede eliminar este tipo de proyecto: tiene ${totalDocs} proyecto(s) asignado(s).`,
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
        description: 'Orden en el que aparece en las pestañas y la sidebar de proyectos.',
      },
      defaultValue: 0,
    },
  ],
}