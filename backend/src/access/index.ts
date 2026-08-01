import type { Access } from 'payload'
import type { User } from '@/payload-types'

export const adminOnly: Access = ({ req }) => {
  const user = req.user as User | null
  return Boolean(user?.email)
}

export const adminOrPublishedOnly: Access = ({ req }) => {
  const user = req.user as User | null
  if (user?.email) return true
  return { _status: { equals: 'published' } }
}

export const everyone: Access = () => true

export const noone: Access = () => false

export const adminAuth: Access = ({ req }) => {
  const user = req.user as User | null
  return Boolean(user?.email)
}
