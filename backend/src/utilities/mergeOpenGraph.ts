import type { Metadata } from 'next'

/**
 * Merges OpenGraph metadata with defaults.
 */
export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    siteName: 'Viptel Comunicaciones',
    locale: 'es_CO',
    type: 'website',
    ...og,
  } as Metadata['openGraph']
}
