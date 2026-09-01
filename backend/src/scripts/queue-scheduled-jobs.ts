import 'dotenv/config'
import { getPayload } from 'payload'

import config from '../payload.config'

/**
 * Queues recurring jobs for the next 24h.
 * Intended to be triggered by an external cron (systemd, GitHub Actions, etc.)
 * at a fixed time daily. Each invocation schedules the next run exactly 24h ahead.
 */
const payload = await getPayload({ config })

const now = new Date()

const tomorrowAt = (hours: number): Date => {
  const d = new Date(now)
  d.setDate(d.getDate() + 1)
  d.setHours(hours, 0, 0, 0)
  return d
}

const scheduled = [
  {
    task: 'cleanupVersions' as const,
    input: { dryRun: false },
    waitUntil: tomorrowAt(3), // Daily at 3AM
  },
  {
    task: 'generateSitemap' as const,
    input: { trigger: 'scheduled' },
    waitUntil: tomorrowAt(4), // Daily at 4AM
  },
]

for (const job of scheduled) {
  const queued = await payload.jobs.queue(job)
  payload.logger.info(`Queued ${job.task} → ${job.waitUntil.toISOString()} (${queued.id})`)
}

payload.logger.info('Scheduled jobs queued.')
process.exit(0)