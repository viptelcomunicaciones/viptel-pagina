import { describe, it, expect } from 'vitest'
import type { AccessArgs, FieldAccessArgs, PayloadRequest } from 'payload'

import {
  adminOnly,
  adminOrEditor,
  contentRoles,
  crmRoles,
  allAdminRoles,
  createRoleBasedAccess,
  createFieldRoleBasedAccess,
} from '@/access/roleBased'
import { createOrgScopedAccess } from '@/access/orgScoped'
import { createTimeLimitedAccess } from '@/access/timeLimited'
import { Users } from '@/collections/Users'

const mockReq = (user: Record<string, unknown> | null): PayloadRequest =>
  ({ user }) as unknown as PayloadRequest

const mockAccess = (user: Record<string, unknown> | null): AccessArgs =>
  ({ req: mockReq(user) }) as unknown as AccessArgs

const mockFieldAccess = (user: Record<string, unknown> | null): FieldAccessArgs =>
  ({ req: mockReq(user) }) as unknown as FieldAccessArgs

describe('createRoleBasedAccess', () => {
  it('allows admin when role matches', () => {
    const access = createRoleBasedAccess('admin')
    expect(access(mockAccess({ roles: ['admin'] }))).toBe(true)
  })

  it('denies when role missing', () => {
    const access = createRoleBasedAccess('admin')
    expect(access(mockAccess({ roles: ['editor'] }))).toBe(false)
  })

  it('denies when no user', () => {
    const access = createRoleBasedAccess('admin')
    expect(access(mockAccess(null))).toBe(false)
  })

  it('denies when user has no roles', () => {
    const access = createRoleBasedAccess('admin')
    expect(access(mockAccess({}))).toBe(false)
  })
})

describe('pre-built role access', () => {
  it('adminOnly allows only admin', () => {
    expect(adminOnly(mockAccess({ roles: ['admin'] }))).toBe(true)
    expect(adminOnly(mockAccess({ roles: ['editor'] }))).toBe(false)
  })

  it('adminOrEditor allows admin and editor', () => {
    expect(adminOrEditor(mockAccess({ roles: ['admin'] }))).toBe(true)
    expect(adminOrEditor(mockAccess({ roles: ['editor'] }))).toBe(true)
    expect(adminOrEditor(mockAccess({ roles: ['sales'] }))).toBe(false)
  })

  it('contentRoles allows admin, editor, marketing', () => {
    expect(contentRoles(mockAccess({ roles: ['marketing'] }))).toBe(true)
    expect(contentRoles(mockAccess({ roles: ['sales'] }))).toBe(false)
  })

  it('crmRoles allows admin, marketing, sales and denies editor', () => {
    expect(crmRoles(mockAccess({ roles: ['admin'] }))).toBe(true)
    expect(crmRoles(mockAccess({ roles: ['marketing'] }))).toBe(true)
    expect(crmRoles(mockAccess({ roles: ['sales'] }))).toBe(true)
    expect(crmRoles(mockAccess({ roles: ['editor'] }))).toBe(false)
  })

  it('allAdminRoles allows all 4 staff roles and denies unauthenticated or empty-role users', () => {
    for (const role of ['admin', 'editor', 'marketing', 'sales']) {
      expect(allAdminRoles({ req: mockReq({ roles: [role] }) })).toBe(true)
    }
    expect(allAdminRoles({ req: mockReq({ roles: [] }) })).toBe(false)
    expect(allAdminRoles({ req: mockReq(null) })).toBe(false)
  })

  it('Users.access.admin enforces allAdminRoles', () => {
    const adminAccess = Users.access?.admin
    expect(adminAccess).toBeDefined()
    expect(adminAccess!({ req: mockReq({ roles: ['sales'] }) })).toBe(true)
    expect(adminAccess!({ req: mockReq({ roles: [] }) })).toBe(false)
  })
})

describe('createFieldRoleBasedAccess', () => {
  it('returns boolean for field access', () => {
    const access = createFieldRoleBasedAccess('admin')
    expect(access(mockFieldAccess({ roles: ['admin'] }))).toBe(true)
    expect(access(mockFieldAccess({ roles: ['editor'] }))).toBe(false)
  })
})

describe('createOrgScopedAccess', () => {
  it('allows admin by default', () => {
    const access = createOrgScopedAccess()
    expect(access(mockAccess({ roles: ['admin'] }))).toBe(true)
  })

  it('scopes non-admin users to their orgs', () => {
    const access = createOrgScopedAccess()
    expect(access(mockAccess({ roles: ['editor'], organization: ['org-1'] }))).toEqual({
      organization: { in: ['org-1'] },
    })
  })

  it('handles single org value', () => {
    const access = createOrgScopedAccess()
    expect(access(mockAccess({ roles: ['editor'], organization: 'org-2' }))).toEqual({
      organization: { in: ['org-2'] },
    })
  })

  it('denies users without orgs', () => {
    const access = createOrgScopedAccess()
    expect(access(mockAccess({ roles: ['editor'] }))).toBe(false)
  })

  it('uses custom field names', () => {
    const access = createOrgScopedAccess({ orgField: 'tenant', userOrgField: 'orgIds' })
    expect(access(mockAccess({ roles: ['editor'], orgIds: ['t-1'] }))).toEqual({
      tenant: { in: ['t-1'] },
    })
  })
})

describe('createTimeLimitedAccess', () => {
  it('allows admin by default', () => {
    const access = createTimeLimitedAccess()
    expect(access(mockAccess({ roles: ['admin'] }))).toBe(true)
  })

  it('returns date window query for non-admin users', () => {
    const access = createTimeLimitedAccess()
    const result = access(mockAccess({ roles: ['editor'] })) as {
      and: Array<{
        publishDate?: { greater_than: string }
        or?: Array<unknown>
      }>
    }

    expect(result.and).toHaveLength(2)
    expect(result.and[0].publishDate?.greater_than).toBeTruthy()
    expect(result.and[1].or).toHaveLength(2)
  })
})