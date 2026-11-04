import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { iconField } from '@/fields/iconField'

export const hero: Field = {
  name: 'hero',
  localized: true,
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact (Pantalla completa / Fondo oscuro o imagen)',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact (Centrado con imagen debajo)',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact (Compacto centrado)',
          value: 'lowImpact',
        },
        {
          label: 'Split (2 Columnas: texto a la izquierda, imagen al lado)',
          value: 'split',
        },
        {
          label: 'Centered Halo (Centrado con Grid arquitectónico y Halo brillante)',
          value: 'centeredHalo',
        },
      ],
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'badge',
          type: 'text',
          localized: true,
          label: 'Badge / Etiqueta superior',
          admin: {
            width: '50%',
            placeholder: 'Ej: Nuevas Soluciones',
          },
        },
        iconField({
          name: 'badgeIcon',
          label: 'Icono del Badge',
          admin: {
            width: '50%',
            components: {
              Field: '@/components/IconPicker/IconPickerField#IconPickerField',
            },
            description: 'Selecciona un icono para el badge.',
          },
        }),
      ],
    },
    {
      name: 'richText',
      type: 'richText',
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
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'split'].includes(type),
      },
      relationTo: 'media',
      required: false,
    },
  ],
  label: false,
}
