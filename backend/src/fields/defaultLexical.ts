import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  IndentFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  ParagraphFeature,
  UploadFeature,
  UnderlineFeature,
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: ({ rootFeatures }) => {
    return [
      ...rootFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      ParagraphFeature(),
      UnderlineFeature(),
      BoldFeature(),
      ItalicFeature(),
      IndentFeature(),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
      LinkFeature({
        enabledCollections: ['pages', 'posts', 'projects', 'services'],
        fields: ({ defaultFields }) => {
          const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
            if ('name' in field && field.name === 'url') return false
            return true
          })

          return [
            ...defaultFieldsWithoutUrl,
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
              },
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: ((value, options) => {
                if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                  return true // no validation needed, as no url should exist for internal links
                }
                return value ? true : 'URL is required'
              }) as TextFieldSingleValidation,
            },
          ]
        },
      }),
      UploadFeature({
        enabledCollections: ['media'],
      }),
      // EXPERIMENTAL_TableFeature: opt-in via FEATURE_RICH_TEXT_TABLES env var.
      // Sigue marcado como EXPERIMENTAL en Payload 3.86 — no habilitar en producción
      // sin validar contra el contenido existente. Ver Fase 4 del plan.
      ...(process.env.FEATURE_RICH_TEXT_TABLES === 'true'
        ? [EXPERIMENTAL_TableFeature()]
        : []),
    ]
  },
})