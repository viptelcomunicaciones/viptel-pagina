import type { CollectionConfig } from 'payload'
import type { User as UserType } from '@/payload-types'

import { adminOnly, adminOnlyField } from '../../access/roleBased'
import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }): boolean => (user as UserType).roles?.includes('admin') ?? false,
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
        read: adminOnlyField,
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
      hooks: {
        beforeChange: [
          ({ operation, value }) => {
            if (operation === 'create' || operation === 'update') {
              return new Date()
            }
            return value
          },
        ],
      },
    },
  ],
  timestamps: true,
}