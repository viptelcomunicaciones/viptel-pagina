import type { GlobalConfig } from 'payload'

import { contentRoles } from '@/access/roleBased'
import { link } from '@/fields/link'
import { revalidateGlobal } from '@/hooks/revalidateFrontend'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: contentRoles,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'legalLinks',
      type: 'array',
      localized: true,
      label: 'Enlaces legales (Privacidad, Términos)',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
      },
    },
    {
      name: 'copyright',
      type: 'text',
      localized: true,
      label: 'Texto de Copyright / Créditos',
    },
  ],
}
