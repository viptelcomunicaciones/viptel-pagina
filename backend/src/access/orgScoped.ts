import type { Access } from 'payload'

import type { User } from '@/payload-types'

type OrgScopedOptions = {
  orgField?: string
  userOrgField?: string
  allowAdmin?: boolean
}

export function createOrgScopedAccess(options: OrgScopedOptions = {}): Access {
  const { orgField = 'organization', userOrgField = 'organization', allowAdmin = true } = options

  return ({ req: { user } }) => {
    if (!user) return false
    if (allowAdmin && (user as User).roles?.includes('admin')) return true

    const userOrgs = (user as User)[userOrgField as keyof User]
    if (!userOrgs) return false

    const orgIds = Array.isArray(userOrgs) ? userOrgs : [userOrgs]
    return { [orgField]: { in: orgIds } }
  }
}