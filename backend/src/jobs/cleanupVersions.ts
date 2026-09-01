import type { TaskConfig } from 'payload'

import { cleanVersions } from '@/utilities/cleanVersions'

type CleanupVersionsInput = {
  dryRun?: boolean
}

export const cleanupVersionsTask: TaskConfig<'cleanupVersions'> = {
  slug: 'cleanupVersions',
  inputSchema: [
    { name: 'dryRun', type: 'checkbox', defaultValue: false },
  ],
  retries: 1,
  handler: async ({ input, req }) => {
    const { dryRun } = input as CleanupVersionsInput

    const result = await cleanVersions(req.payload, { dryRun: Boolean(dryRun) })
    return { output: { collections: result.collections, dryRun: Boolean(dryRun) } }
  },
}