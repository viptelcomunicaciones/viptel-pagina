import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('finds the seeded home page in the default locale', async () => {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'home' } },
    })

    expect(docs).toHaveLength(1)
    expect(docs[0].title).toBe('Inicio')
    expect(docs[0].layout?.length).toBeGreaterThan(0)
  })

  it('finds published posts with populated authors', async () => {
    const { docs } = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
    })

    expect(docs.length).toBeGreaterThanOrEqual(2)
    expect(docs[0].populatedAuthors?.[0]?.name).toBeTruthy()
  })

  it('finds published projects', async () => {
    const { docs } = await payload.find({
      collection: 'projects',
      where: { _status: { equals: 'published' } },
    })

    expect(docs.length).toBeGreaterThanOrEqual(2)
    expect(docs[0].tags?.length).toBeGreaterThan(0)
  })

  it('reads header and footer globals', async () => {
    const header = await payload.findGlobal({ slug: 'header' })
    const footer = await payload.findGlobal({ slug: 'footer' })

    expect(header.navItems?.length).toBeGreaterThan(0)
    expect(footer.navItems?.length).toBeGreaterThan(0)
  })

  it('serves localized content in english', async () => {
    const { docs } = await payload.find({
      collection: 'posts',
      locale: 'en',
      where: { slug: { equals: 'pbx-en-la-nube' } },
    })

    expect(docs).toHaveLength(1)
    expect(docs[0].title).toBe('Why your company needs a cloud PBX')
  })
})
