import type { CollectionConfig } from 'payload'
import type { User as UserType } from '@/payload-types'

import { adminOnly, adminOnlyField } from '../../access/roleBased'
import { authenticated } from '../../access/authenticated'

const ADMIN_PANEL_ROLES: NonNullable<UserType['roles']>[number][] = [
  'admin',
  'editor',
  'marketing',
  'sales',
]

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }): boolean =>
      Boolean(
        (user as UserType | null)?.roles?.some((role) => ADMIN_PANEL_ROLES.includes(role)),
      ),
    create: adminOnly,
    delete: adminOnly,
    read: authenticated,
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if ((user as UserType).roles?.includes('admin')) return true
      return user.id === id
    },
  },
  labels: {
    singular: 'Usuario',
    plural: 'Usuarios',
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles', 'lastLogin'],
    useAsTitle: 'name',
    group: 'Admin',
  },
  auth: {
    // API keys allow the Astro website to fetch drafts for preview mode
    useAPIKey: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Ventas', value: 'sales' },
      ],
      defaultValue: ['editor'],
      required: true,
      saveToJWT: true,
      access: {
        update: adminOnlyField,
      },
    },
    {
      name: 'lastLogin',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    afterLogin: [
      async ({ req, user }) => {
        try {
          await req.payload.update({
            collection: 'users',
            id: user.id,
            data: {
              lastLogin: new Date().toISOString(),
            },
            overrideAccess: true,
            req,
            context: {
              disableRevalidate: true,
            },
          })
        } catch (err) {
          req.payload.logger.warn(
            `Failed to update lastLogin for user ${user.id}: ${err instanceof Error ? err.message : String(err)}`,
          )
        }
        return user
      },
    ],
  },
  timestamps: true,
}