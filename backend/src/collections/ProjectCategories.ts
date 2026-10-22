import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { adminOnly, contentRoles } from '../access/roleBased'
import { revalidateTaxonomy } from '../hooks/revalidateFrontend'
import { slugField } from 'payload'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  access: {
    create: contentRoles,
    delete: adminOnly,
    read: anyone,
    update: contentRoles,
  },
  labels: {
    singular: 'Categoría de proyecto',
    plural: 'Categorías de proyecto',
  },
  admin: {
    description:
      'Jerarquía de dos niveles: categoría raíz y subcategoría. Crear una subcategoría solo si agrupa 10+ proyectos (regla de volumen).',
    useAsTitle: 'title',
    group: 'Content',
  },
  hooks: revalidateTaxonomy(['/projects']),
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
      relationTo: 'project-categories',
      index: true,
      admin: {
        description:
          'Dejar vacío si es una categoría raíz. Seleccionar un padre para crear una subcategoría.',
        position: 'sidebar',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}