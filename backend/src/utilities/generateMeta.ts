import type { Metadata } from 'next'

import { mergeOpenGraph } from './mergeOpenGraph'

/**
 * Generates page-level Metadata (title, description, OpenGraph) from a Payload document.
 */
export const generateMeta = async (args: { doc: any }): Promise<Metadata> => {
  const { doc } = args || {}

  const ogImage =
    typeof doc?.meta?.image === 'object' && doc.meta.image !== null
      ? doc.meta.image
      : undefined

  const title = doc?.meta?.title
    ? doc.meta.title
    : doc?.title
      ? `Viptel — ${doc.title}`
      : 'Viptel Comunicaciones'

  const description = doc?.meta?.description
    ? doc.meta.description
    : 'Soluciones empresariales de telecomunicaciones: PBX, VoIP, desarrollo web, marketing digital y software empresarial.'

  return {
    title,
    description,
    openGraph: mergeOpenGraph({
      title,
      description,
      images: ogImage ? [{ url: ogImage?.url || ogImage?.sizes?.og?.url }] : undefined,
    }),
  }
}
