# Plugins

Configuración de plugins en `src/plugins/index.ts`.

## SEO Plugin (`@payloadcms/plugin-seo`)

Aplica a: `pages`, `posts`, `projects`, `services`.

**Configuración**:

```typescript
seo({
  collections: ['pages', 'posts', 'projects', 'services'],
  uploadsCollection: 'media',
  generateTitle: ({ doc }) => `Viptel — ${doc?.title || 'Viptel Comunicaciones'}`,
  generateURL: ({ doc, collectionSlug, locale }) => {
    const base = collectionSlug === 'services'
      ? `${FRONTEND_URL}/services/${doc?.slug}`
      : `${FRONTEND_URL}/${doc?.slug}`
    // Añade prefijo /en/ para locale no default
    return base
  },
})
```

**Campos del tab SEO**:
- `meta.title` — MetaTitleField con generación automática
- `meta.image` — MetaImageField
- `meta.description` — MetaDescriptionField
- OverviewField + PreviewField para vista previa en redes sociales

---

## Nested Docs Plugin (`@payloadcms/plugin-nested-docs`)

Aplica a: `pages` solamente.

Permite jerarquía padre/hijo con breadcrumbs automáticos.

**Configuración**:

```typescript
nestedDocs({
  collections: ['pages'],
  generateLabel: (_, doc) => doc.title as string,
  generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
})
```

Ejemplo de breadcrumb: `Home > Servicios > VoIP`

---

## Redirects Plugin (`@payloadcms/plugin-redirects`)

Aplica a: `pages`, `posts`.

Crea automáticamente una colección `redirects` en la base de datos.

```typescript
redirects({
  collections: ['pages', 'posts'],
})
```

El campo `from` tiene descripción personalizada: "The Astro website checks redirects on every request (SSR)".

**Cómo funciona**: El website, en su ruta catch-all `[...slug].astro`, consulta la colección `redirects` del backend antes de renderizar. Si encuentra un redirect, devuelve 301/302.
