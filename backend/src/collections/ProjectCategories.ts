import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const ProjectCategories: CollectionConfig = {
  slug: 'project-categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
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