import type { GlobalConfig } from 'payload'

import { contentRoles } from '@/access/roleBased'
import { link } from '@/fields/link'
import { revalidateGlobal } from '@/hooks/revalidateFrontend'

export const Header: GlobalConfig = {
  slug: 'header',
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
        {
          name: 'children',
          type: 'array',
          label: 'Sub-items (Dropdown)',
          fields: [
            link({
              appearances: false,
            }),
          ],
          admin: {
            initCollapsed: true,
          },
        },
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'cta',
      type: 'group',
      localized: true,
      label: 'CTA Button',
      fields: [
        {
          name: 'showCta',
          type: 'checkbox',
          defaultValue: false,
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_, siblingData) => Boolean(siblingData?.showCta),
            },
          },
        }),
      ],
    },
  ],
}
