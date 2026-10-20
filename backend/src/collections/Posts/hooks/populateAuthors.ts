import type { CollectionAfterReadHook } from 'payload'
import { User } from '@/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req: { payload } }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const authorIds = doc.authors
      .map((author: unknown) => (typeof author === 'object' && author !== null && 'id' in author ? (author as User).id : author))
      .filter((id: unknown): id is number | string => id !== undefined && id !== null)

    if (authorIds.length > 0) {
      try {
        const { docs: authorDocs } = await payload.find({
          collection: 'users',
          where: {
            id: {
              in: authorIds,
            },
          },
          depth: 0,
          limit: authorIds.length,
          overrideAccess: true,
        })

        if (authorDocs.length > 0) {
          doc.populatedAuthors = authorDocs.map((authorDoc) => ({
            id: authorDoc.id,
            name: authorDoc.name,
          }))
        }
      } catch {
        // swallow error
      }
    }
  }

  return doc
}
