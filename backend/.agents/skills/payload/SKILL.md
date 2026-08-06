# Payload CMS Skill — Viptel Comunicaciones

Referencia rápida para trabajar con el backend Payload CMS de este proyecto.

## Estructura del backend

```
backend/
├── src/
│   ├── access/           # Funciones de control de acceso
│   ├── app/(payload)/    # Rutas Next.js (admin SPA, REST API, GraphQL)
│   ├── blocks/           # Bloques de contenido reutilizables (11 tipos)
│   ├── collections/      # Colecciones (Users, Media, Categories, Pages, Posts, Projects, Services)
│   ├── fields/           # Campos personalizados (defaultLexical, link, linkGroup, seoTab)
│   ├── Footer/           # Global Footer
│   ├── Header/           # Global Header
│   ├── heros/            # Configuración de héroe
│   ├── hooks/            # Hooks (populatePublishedAt)
│   ├── migrations/       # Migraciones Drizzle
│   ├── plugins/          # Configuración de plugins (SEO, nested-docs, redirects)
│   ├── scripts/          # seed.ts, clean-versions.ts
│   ├── utilities/        # deepMerge, generatePreviewPath, getURL, toKebabCase
│   ├── payload-types.ts  # Tipos TypeScript auto-generados
│   └── payload.config.ts # Configuración principal
└── tests/                # Vitest (int) + Playwright (e2e)
```

## Colecciones

| Colección | Slug | Localizada | Versiones | Auth | Acceso lectura |
|---|---|---|---|---|---|
| Users | `users` | No | No | Email/password + API key | authenticated |
| Media | `media` | No | No | — | anyone |
| Categories | `categories` | Sí (title) | No | — | anyone |
| Pages | `pages` | Sí | Drafts | — | authenticatedOrPublished |
| Posts | `posts` | Sí | Drafts | — | authenticatedOrPublished |
| Projects | `projects` | Sí | Drafts | — | authenticatedOrPublished |
| Services | `services` | Sí | Drafts | — | authenticatedOrPublished |

## Access Control

- `anyone`: Siempre `true` — usado en Media read
- `authenticated`: `Boolean(user)` — requiere login
- `authenticatedOrPublished`: Si hay user → `true`, sino → `{ _status: { equals: 'published' } }`

Ver `reference/ACCESS-CONTROL.md` para detalles.

## Plugins

- `@payloadcms/plugin-seo` — Meta títulos, descripciones, OG images en pages, posts, projects, services
- `@payloadcms/plugin-nested-docs` — Jerarquía padre/hijo en pages
- `@payloadcms/plugin-redirects` — Redirecciones para pages y posts

Ver `reference/PLUGINS.md` para configuración completa.

## Bloques

11 bloques disponibles: Archive, Banner, CallToAction, Cards, Code, Content, FAQ, Gallery, MediaBlock, MediaContent, Pricing.

Ver `reference/BLOCKS.md` para slugs y campos de cada uno.

## Comandos

```bash
pnpm dev          # Servidor de desarrollo (puerto 3000)
pnpm build        # Build de producción
pnpm seed         # Sembrar datos de demo
pnpm clean-versions  # Eliminar versiones draft
pnpm generate:types   # Regenerar payload-types.ts
pnpm migrate:create   # Crear nueva migración
pnpm test:int     # Tests de integración
pnpm test:e2e     # Tests E2E
```

## Cómo la API sirve contenido al website

1. REST API en `/api/{collection}` con `?locale=`, `?depth=`, `?where=`, `?draft=`
2. GraphQL en `/api/graphql`
3. CORS permite `FRONTEND_URL` y `PAYLOAD_PUBLIC_SERVER_URL`
4. Service account con API key para acceso a drafts desde el website
5. Media files en `/api/media/file/{filename}`

Ver `reference/ENDPOINTS.md` para todos los endpoints.

## i18n

- Locales: `es` (default), `en`
- Fallback activado — si falta traducción, usa default locale
- Prefijo en preview URLs para non-default locales

Ver `reference/I18N.md`.
