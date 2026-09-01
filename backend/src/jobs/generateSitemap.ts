import type { TaskConfig } from 'payload'

export const generateSitemapTask: TaskConfig<'generateSitemap'> = {
  slug: 'generateSitemap',
  inputSchema: [
    { name: 'trigger', type: 'select', options: ['manual', 'scheduled'], defaultValue: 'scheduled' },
  ],
  retries: 0,
  handler: async ({ input, req }) => {
    const { trigger } = input as { trigger?: string }
    req.payload.logger.warn(
      `generateSitemap (${trigger ?? 'manual'}): requires a frontend sitemap regeneration endpoint — deferred to infra plan`,
    )
    return { output: { triggered: false, reason: 'sitemap endpoint not available' } }
  },
}