import type { CollectionBeforeChangeHook } from 'payload'

export const setAuthor: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if ((operation === 'create' || operation === 'update') && req.user) {
    data.author = req.user.id
  }
  return data
}
