import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  const data = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    depth: 1,
    limit: 10,
  })

  return Response.json({
    message: 'Custom API route',
    posts: data.docs,
  })
}
