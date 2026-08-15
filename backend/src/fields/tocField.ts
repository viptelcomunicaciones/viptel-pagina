import type { Field } from 'payload'

/**
 * Per-document Table of Contents override. When `inherit`, the site-wide
 * `articleFeatures.toc` config decides whether the TOC renders; `enabled`
 * forces it on and `disabled` hides it for this document.
 */
export const tocField = (): Field => ({
  name: 'toc',
  type: 'select',
  defaultValue: 'inherit',
  options: [
    { label: 'Heredar configuración del sitio', value: 'inherit' },
    { label: 'Mostrar siempre', value: 'enabled' },
    { label: 'Ocultar', value: 'disabled' },
  ],
  admin: {
    position: 'sidebar',
    description: 'Controla la tabla de contenidos "En esta página" de este artículo.',
  },
})
