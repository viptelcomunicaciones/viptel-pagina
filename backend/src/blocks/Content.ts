import type { Block } from 'payload'

export const Content: Block = {
  slug: 'content',
  fields: [
    { name: 'body', type: 'richText', localized: true, required: true },
  ],
}