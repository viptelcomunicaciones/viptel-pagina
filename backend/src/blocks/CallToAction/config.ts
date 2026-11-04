import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const CallToAction: Block = {
  slug: 'cta',
  interfaceName: 'CallToActionBlock',
  fields: [
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'default',
      label: 'Variante de diseño',
      options: [
        {
          label: 'Default (Estándar centrado con resplandor glow)',
          value: 'default',
        },
        {
          label: 'Invert (Alto contraste, fondo oscuro permanente)',
          value: 'invert',
        },
        {
          label: 'Glitch (Banda Matrix animada LetterGlitch)',
          value: 'glitch',
        },
        {
          label: 'Banner (Tarjeta horizontal con botones alineados)',
          value: 'banner',
        },
      ],
    },
    {
      name: 'badge',
      type: 'text',
      localized: true,
      label: 'Badge / Etiqueta superior opcional',
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      label: 'Heading / Título principal de la llamada a la acción',
    },
    {
      name: 'richText',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    linkGroup({
      appearances: ['default', 'outline'],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
  labels: {
    plural: 'Calls to Action',
    singular: 'Call to Action',
  },
}
