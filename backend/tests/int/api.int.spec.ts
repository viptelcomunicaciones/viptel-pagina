import { getPayload, Payload } from 'payload'
import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'
import config from '@/payload.config'
import { migrations } from '@/migrations'

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

  it('reads header and footer globals with dropdown children, CTA, legalLinks, and copyright', async () => {
    const header = await payload.findGlobal({ slug: 'header', locale: 'es' })
    const footer = await payload.findGlobal({ slug: 'footer', locale: 'es' })

    expect(header.navItems?.length).toBeGreaterThan(0)
    const servicesItem = header.navItems?.find((item) => item.link?.url === '/services')
    expect(servicesItem?.children?.length).toBeGreaterThan(0)
    expect(header.cta?.showCta).toBe(true)
    expect(header.cta?.link?.label).toBe('Comenzar')

    expect(footer.navItems?.length).toBeGreaterThan(0)
    expect(footer.legalLinks?.length).toBeGreaterThan(0)
    expect(footer.copyright).toContain('Viptel Comunicaciones')
  })

  it('serves localized content in english', async () => {
    const { docs } = await payload.find({
      collection: 'posts',
      locale: 'en',
      where: { slug: { equals: 'voip-pymes-2026' } },
    })

    expect(docs).toHaveLength(1)
    expect(docs[0].title).toBe('The definitive VoIP guide for SMBs')
  })

  it('finds the seeded Contacto Web form in es and en', async () => {
    const esForms = await payload.find({
      collection: 'forms',
      locale: 'es',
      where: { title: { equals: 'Contacto Web' } },
    })
    expect(esForms.docs).toHaveLength(1)
    expect(esForms.docs[0].fields?.length).toBeGreaterThanOrEqual(4)

    const enForms = await payload.find({
      collection: 'forms',
      locale: 'en',
      where: { id: { equals: esForms.docs[0].id } },
    })
    expect(enForms.docs[0]?.title).toBe('Web Contact')
  })

  it('indexes pages, posts, projects, and services in the search collection', async () => {
    const searchResults = await payload.find({
      collection: 'search',
      locale: 'es',
      where: {
        or: [
          { title: { like: 'VoIP' } },
          { slug: { like: 'voip' } },
        ],
      },
    })

    expect(searchResults.docs.length).toBeGreaterThan(0)
    expect(searchResults.docs[0].doc?.relationTo).toBeTruthy()
    expect(searchResults.docs[0].url).toBeTruthy()
  })

  it('converts uploaded media images to WebP format', async () => {
    const mediaDocs = await payload.find({
      collection: 'media',
      limit: 5,
    })

    expect(mediaDocs.docs.length).toBeGreaterThan(0)
    for (const doc of mediaDocs.docs) {
      expect(doc.mimeType).toBe('image/webp')
    }
  })

  it('executes v1_1_audit_improvements migration down() and up() cleanly against PostgreSQL', async () => {
    const migration = migrations.find(
      (m) => m.name === '20261019_174809_v1_1_audit_improvements',
    )
    expect(migration).toBeDefined()

    const db = (payload.db as unknown as { drizzle: MigrateUpArgs['db'] }).drizzle
    const req = {} as unknown as MigrateUpArgs['req']
    await db.execute(sql`BEGIN`)
    try {
      await migration!.down({ db, payload, req })
      await migration!.up({ db, payload, req })
      // Verify idempotency when up() is run a second time
      await migration!.up({ db, payload, req })
    } finally {
      await db.execute(sql`ROLLBACK`)
    }
  })

  it('updates lastLogin timestamp when user logs in and completes cleanly', async () => {
    const testEmail = `login-test-${Date.now()}@viptel.com`
    const testPassword = 'Password123!'

    const createdUser = await payload.create({
      collection: 'users',
      data: {
        name: 'Login Test User',
        email: testEmail,
        password: testPassword,
        roles: ['editor'],
      },
    })

    try {
      expect(createdUser.lastLogin).toBeFalsy()

      const loginResult = await payload.login({
        collection: 'users',
        data: {
          email: testEmail,
          password: testPassword,
        },
      })

      expect(loginResult.token).toBeTruthy()
      expect(loginResult.user.id).toBe(createdUser.id)

      const updatedUser = await payload.findByID({
        collection: 'users',
        id: createdUser.id,
      })

      expect(updatedUser.lastLogin).toBeTruthy()
      const loginTime = new Date(updatedUser.lastLogin as string).getTime()
      expect(Number.isNaN(loginTime)).toBe(false)
      expect(Date.now() - loginTime).toBeLessThan(10000)
    } finally {
      await payload.delete({
        collection: 'users',
        id: createdUser.id,
      })
    }
  })
})


