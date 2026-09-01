import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

export function createRoleBasedAccess(...allowedRoles: User['roles']): Access {
  return ({ req: { user } }) => {
    if (!user) return false
    const roles = (user as User).roles ?? []
    return allowedRoles.some((role) => roles.includes(role))
  }
}

export function createFieldRoleBasedAccess(...allowedRoles: User['roles']): FieldAccess {
  return ({ req: { user } }): boolean => {
    if (!user) return false
    const roles = (user as User).roles ?? []
    return allowedRoles.some((role) => roles.includes(role))
  }
}

export const adminOnly = createRoleBasedAccess('admin')
export const adminOrEditor = createRoleBasedAccess('admin', 'editor')
export const contentRoles = createRoleBasedAccess('admin', 'editor', 'marketing')
export const allAuthenticated: Access = ({ req: { user } }) => Boolean(user)

export const adminOnlyField = createFieldRoleBasedAccess('admin')
export const contentRolesField = createFieldRoleBasedAccess('admin', 'editor', 'marketing')