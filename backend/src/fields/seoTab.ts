import type { Tab } from 'payload'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

// Shared SEO tab used by Pages, Posts and Projects.
// generateTitle / generateURL functions are configured in src/plugins/index.ts (seoPlugin)
export const seoTab: Tab = {
  name: 'meta',
  label: 'SEO',
  fields: [
    OverviewField({
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
      imagePath: 'meta.image',
    }),
    MetaTitleField({
      hasGenerateFn: true,
    }),
    MetaImageField({
      relationTo: 'media',
    }),
    MetaDescriptionField({}),
    PreviewField({
      hasGenerateFn: true,
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
    }),
    {
      name: 'noindex',
      type: 'checkbox',
      defaultValue: false,
      label: 'No Index (noindex)',
      admin: {
        description: 'Indica a los motores de búsqueda que no indexen esta página.',
      },
    },
    {
      name: 'nofollow',
      type: 'checkbox',
      defaultValue: false,
      label: 'No Follow (nofollow)',
      admin: {
        description: 'Indica a los motores de búsqueda que no transfieran autoridad a enlaces de esta página.',
      },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      label: 'URL Canónica Personalizada',
      admin: {
        description: 'Opcional. Si se deja en blanco, se calculará automáticamente la URL canónica propia.',
      },
    },
  ],
}
