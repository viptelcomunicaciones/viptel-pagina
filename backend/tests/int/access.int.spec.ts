import { describe, it, expect } from 'vitest'

import {
  adminOnly,
  adminOrEditor,
  contentRoles,
  createRoleBasedAccess,
  createFieldRoleBasedAccess,
} from '@/access/roleBased'
import { createOrgScopedAccess } from '@/access/orgScoped'
import { createTimeLimitedAccess } from '@/access/timeLimited'

describe('createRoleBasedAccess', () => {
  it('allows admin when role matches', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: { roles: ['admin'] } } as any
    expect(access({ req })).toBe(true)
  })

  it('denies when role missing', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: { roles: ['editor'] } } as any
    expect(access({ req })).toBe(false)
  })

  it('denies when no user', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: null } as any
    expect(access({ req })).toBe(false)
  })

  it('denies when user has no roles', () => {
    const access = createRoleBasedAccess('admin')
    const req = { user: {} } as any
    expect(access({ req })).toBe(false)
  })
})

describe('pre-built role access', () => {
  it('adminOnly allows only admin', () => {
    expect(adminOnly({ req: { user: { roles: ['admin'] } } } as any)).toBe(true)
    expect(adminOnly({ req: { user: { roles: ['editor'] } } } as any)).toBe(false)
  })

  it('adminOrEditor allows admin and editor', () => {
    expect(adminOrEditor({ req: { user: { roles: ['admin'] } } } as any)).toBe(true)
    expect(adminOrEditor({ req: { user: { roles: ['editor'] } } } as any)).toBe(true)
    expect(adminOrEditor({ req: { user: { roles: ['sales'] } } } as any)).toBe(false)
  })

  it('contentRoles allows admin, editor, marketing', () => {
    expect(contentRoles({ req: { user: { roles: ['marketing'] } } } as any)).toBe(true)
    expect(contentRoles({ req: { user: { roles: ['sales'] } } } as any)).toBe(false)
  })
})

describe('createFieldRoleBasedAccess', () => {
  it('returns boolean for field access', () => {
    const access = createFieldRoleBasedAccess('admin')
    expect(access({ req: { user: { roles: ['admin'] } } } as any)).toBe(true)
    expect(access({ req: { user: { roles: ['editor'] } } } as any)).toBe(false)
  })
})

describe('createOrgScopedAccess', () => {
  it('allows admin by default', () => {
    const access = createOrgScopedAccess()
    const req = { user: { roles: ['admin'] } } as any
    expect(access({ req })).toBe(true)
  })

  it('scopes non-admin users to their orgs', () => {
    const access = createOrgScopedAccess()
    const req = { user: { roles: ['editor'], organization: ['org-1'] } } as any
    expect(access({ req })).toEqual({ organization: { in: ['org-1'] } })
  })

  it('handles single org value', () => {
    const access = createOrgScopedAccess()
    const req = { user: { roles: ['editor'], organization: 'org-2' } } as any
    expect(access({ req })).toEqual({ organization: { in: ['org-2'] } })
  })

  it('denies users without orgs', () => {
    const access = createOrgScopedAccess()
    const req = { user: { roles: ['editor'] } } as any
    expect(access({ req })).toBe(false)
  })

  it('uses custom field names', () => {
    const access = createOrgScopedAccess({ orgField: 'tenant', userOrgField: 'orgIds' })
    const req = { user: { roles: ['editor'], orgIds: ['t-1'] } } as any
    expect(access({ req })).toEqual({ tenant: { in: ['t-1'] } })
  })
})

describe('createTimeLimitedAccess', () => {
  it('allows admin by default', () => {
    const access = createTimeLimitedAccess()
    const req = { user: { roles: ['admin'] } } as any
    expect(access({ req })).toBe(true)
  })

  it('returns date window query for non-admin users', () => {
    const access = createTimeLimitedAccess()
    const req = { user: { roles: ['editor'] } } as any
    const result = access({ req }) as any

    expect(result.and).toHaveLength(2)
    expect(result.and[0].publishDate.greater_than).toBeTruthy()
    expect(result.and[1].or).toHaveLength(2)
  })
})