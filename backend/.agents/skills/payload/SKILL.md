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

| Colección | Slug | Localizada | Versiones | Auth | Acceso lectura | Acceso escritura |
|---|---|---|---|---|---|---|
| Users | `users` | No | No | Email/password + API key | authenticated | `adminOnly` |
| Media | `media` | Sí (`alt`, `caption`) | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| Categories | `categories` | Sí | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| ProjectCategories | `project-categories` | Sí | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| Tags | `tags` | No | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| PostTypes | `post-types` | Sí | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| ProjectTypes | `project-types` | Sí | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| Pages | `pages` | Sí | Drafts | — | authenticatedOrPublished | `contentRoles` (`adminOnly` delete) |
| Posts | `posts` | Sí | Drafts | — | authenticatedOrPublished | `contentRoles` (`adminOnly` delete) |
| Projects | `projects` | Sí | Drafts | — | authenticatedOrPublished | `contentRoles` (`adminOnly` delete) |
| Services | `services` | Sí | Drafts | — | authenticatedOrPublished | `contentRoles` (`adminOnly` delete) |
| Forms | `forms` | Sí | No | — | anyone | `contentRoles` (`adminOnly` delete) |
| FormSubmissions | `form-submissions` | No | No | — | `crmRoles` | `anyone` create, `adminOnly` update/delete |
| Search | `search` | Sí | No | — | anyone | Automático |

## Access Control (`src/access/roleBased.ts`)

- `anyone`: Siempre `true` — lectura pública en taxonomías, media, forms y search
- `authenticated`: `Boolean(user)` — requiere sesión activa
- `authenticatedOrPublished`: Si hay user → `true`, sino → `{ _status: { equals: 'published' } }`
- `adminOnly`: Solo usuarios con rol `admin`
- `contentRoles`: Usuarios con rol `admin`, `editor` o `marketing`
- `crmRoles`: Usuarios con rol `admin`, `sales` o `marketing` (lectura de leads en `form-submissions`)
- `allAdminRoles`: `admin`, `editor`, `marketing`, `sales` (acceso al panel `/admin`)

Ver `reference/ACCESS-CONTROL.md` para detalles.

## Plugins

- `@payloadcms/plugin-seo` — Meta títulos, descripciones, OG images en pages, posts, projects, services
- `@payloadcms/plugin-nested-docs` — Jerarquía padre/hijo en pages y services
- `@payloadcms/plugin-redirects` — Redirecciones 301/302 para pages, posts y services
- `@payloadcms/plugin-search` — Índice FTS localizado para pages, posts, projects y services
- `@payloadcms/plugin-form-builder` — Formularios dinámicos (`forms`) y CRM de leads (`form-submissions`)
- `@payloadcms/storage-s3` — Almacenamiento en Cloudflare R2 (con conversión WebP en `Media`)

Ver `reference/PLUGINS.md` para configuración completa.

## Bloques

12 bloques disponibles: Archive, Banner, CallToAction, Cards, Code, Content, FAQ, Form (`formBlock`), Gallery, MediaBlock, MediaContent, Pricing.

Ver `reference/BLOCKS.md` para slugs y campos de cada uno.

## Comandos

```bash
pnpm dev               # Servidor de desarrollo (puerto 3000)
pnpm build             # Build de producción
pnpm ci                # payload migrate + build (para CI/deploy a producción)
pnpm seed              # Sembrar datos de demo
pnpm clean-versions    # Eliminar versiones draft
pnpm generate:types    # Regenerar payload-types.ts
pnpm payload migrate:create <nombre>  # Crear nueva migración (genera .ts + snapshot .json)
pnpm payload migrate   # Aplicar migraciones pendientes
pnpm payload migrate:status  # Estado de migraciones
pnpm test:int          # Tests de integración
pnpm test:e2e          # Tests E2E
```

> Migraciones: dev usa push mode (no necesitas migrar localmente). Genera la migración
> con `migrate:create` al terminar cada feature y revísala. Ver
> `reference/MIGRATIONS.md` para el flujo completo y el checklist de producción.

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
