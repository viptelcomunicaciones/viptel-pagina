import type { Access } from 'payload'

import type { User } from '@/payload-types'

type TimeLimitedOptions = {
  days?: number
  startField?: string
  endField?: string
  allowAdmin?: boolean
}

export function createTimeLimitedAccess(options: TimeLimitedOptions = {}): Access {
  const {
    days = 30,
    startField = 'publishDate',
    endField = 'unpublishDate',
    allowAdmin = true,
  } = options

  return ({ req: { user } }) => {
    if (!user) return false
    if (allowAdmin && (user as User).roles?.includes('admin')) return true

    const now = new Date()
    now.setDate(now.getDate() - days)

    return {
      and: [
        { [startField]: { greater_than: now.toISOString() } },
        {
          or: [
            { [endField]: { exists: false } },
            { [endField]: { greater_than: new Date().toISOString() } },
          ],
        },
      ],
    }
  }
}