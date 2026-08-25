import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  labels: {
    singular: 'Categoría de contenido',
    plural: 'Categorías de contenidos',
  },
  admin: {
    description:
      'Jerarquía de dos niveles: categoría raíz y subcategoría. Crear una subcategoría solo si agrupa 10+ posts (regla de volumen).',
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
      relationTo: 'categories',
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
