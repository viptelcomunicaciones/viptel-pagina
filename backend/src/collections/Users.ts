import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access'

const adminAccess = ({ req: { user } }: { req: { user?: unknown } }) => {
  return Boolean((user as { email?: string })?.email)
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
    admin: adminAccess,
  },
  fields: [],
}
