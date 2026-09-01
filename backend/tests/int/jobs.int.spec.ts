import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

describe('Jobs Queue', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    if (payload) {
      await payload.destroy()
    }
  })

  it('runs the generateSitemap task successfully', async () => {
    const job = await payload.jobs.queue({
      task: 'generateSitemap',
      input: { trigger: 'manual' },
    })

    const result = await payload.jobs.runByID({ id: job.id })
    expect(result.jobStatus?.[String(job.id)]?.status).toBe('success')
  })

  it('runs the cleanupVersions task in dry run mode', async () => {
    const job = await payload.jobs.queue({
      task: 'cleanupVersions',
      input: { dryRun: true },
    })

    const result = await payload.jobs.runByID({ id: job.id })
    expect(result.jobStatus?.[String(job.id)]?.status).toBe('success')
  })

  it('rejects webhookDelivery without a url', async () => {
    const job = await payload.jobs.queue({
      task: 'webhookDelivery',
      input: {},
    })

    const result = await payload.jobs.runByID({ id: job.id })
    const status = result.jobStatus?.[String(job.id)]?.status
    expect(['error', 'error-reached-max-retries']).toContain(status)
  })
})