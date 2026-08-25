# Project Knowledge — Viptel Comunicaciones

Skill de conocimiento completo del monorepo Viptel Comunicaciones.

## Identidad del proyecto

**Viptel Comunicaciones** — empresa colombiana de telecomunicaciones con tres líneas de negocio:
1. **Telecomunicaciones**: PBX, VoIP, redes, conectividad empresarial
2. **Desarrollo web**: sitios corporativos, aplicaciones web, e-commerce
3. **Marketing digital**: SEO, publicidad digital, redes sociales

Ubicación: Bogotá, Colombia. Atiende clientes en toda Latinoamérica.

## Arquitectura general

```
┌──────────────┐     ┌─────────────────────────┐     ┌──────────────────────┐
│  PostgreSQL  │ ←─→ │  Backend (Payload CMS)   │ ←─→ │  Website (Astro SSR)  │
│  :5432       │     │  Next.js 16  :3000       │     │  Astro 7    :4321     │
└──────────────┘     └─────────────────────────┘     └──────────────────────┘
                             ↑                                ↑
                      Admin Panel                  Usuarios finales
                      (CMS editor)                 (sitio público)
```

**Flujo de datos**:
1. Contenido se crea/edita en Payload CMS (admin panel en `:3000/admin`)
2. Payload almacena en PostgreSQL
3. Website (Astro SSR) consume REST API de Payload en cada request
4. HTML se renderiza en servidor y se envía al navegador

## Estructura del monorepo

```
viptelcomunicaciones/
├── AGENTS.md                       # Doc raíz para agentes
├── package.json                    # Scripts del workspace
├── pnpm-workspace.yaml             # Define backend + website
├── PROJECT-KNOWLEDGE.md            # Este documento (ref. humana)
├── project-knowledge/              # Skill para agentes
│   └── SKILL.md                    # Este archivo
├── backend/                        # Payload CMS + Next.js
│   ├── AGENTS.md
│   ├── .agents/skills/payload/     # Skill de Payload CMS (13 archivos)
│   ├── src/
│   │   ├── access/                 # anyone, authenticated, authenticatedOrPublished
│   │   ├── app/(payload)/          # Rutas Next.js (admin, api)
│   │   ├── blocks/                 # 11 bloques de contenido
│   │   ├── collections/            # 7 colecciones
│   │   ├── fields/                 # Campos personalizados
│   │   ├── Footer/, Header/        # Globals
│   │   ├── hooks/                  # populatePublishedAt
│   │   ├── migrations/             # Migraciones Drizzle
│   │   ├── plugins/                # SEO, nested-docs, redirects
│   │   ├── scripts/                # seed.ts, clean-versions.ts
│   │   └── payload.config.ts       # Config principal
│   ├── Dockerfile
│   └── docker-compose.yml
├── website/                        # Astro 7 + Tailwind v4
│   ├── AGENTS.md
│   ├── src/
│   │   ├── components/             # 57 componentes (bloques, UI, layout, patterns)
│   │   ├── config/                 # site, nav, i18n, consent
│   │   ├── i18n/                   # es.json, en.json (textos del sitio)
│   │   ├── layouts/                # BaseLayout, BlogLayout, etc.
│   │   ├── lib/                    # payload.ts, blog.ts, projects.ts, schema.ts
│   │   ├── pages/                  # 42 rutas (es + en)
│   │   └── styles/                 # Tokens + 13 themes OKLCH
│   └── astro.config.mjs
└── docs/                           # Specs y planes de implementación
    └── superpowers/
        ├── specs/
        └── plans/
```

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| CMS | Payload CMS | 3.86 |
| Frontend CMS | Next.js | 16.2 |
| Frontend público | Astro | 7.1 |
| UI framework | React | 19.2 |
| CSS | Tailwind CSS | v4 (Vite-native) |
| Base de datos | PostgreSQL + Drizzle ORM | — |
| ORM interno | Drizzle (vía @payloadcms/db-postgres) | — |
| Lenguaje | TypeScript | 5.7 |
| Paquetería | pnpm workspaces | — |
| Contenedores | Docker (Node 22 Alpine) | — |
| Email | Resend | — |
| Búsqueda | Pagefind (static index) | — |

## i18n

| Locale | Código | Estado | URL prefix |
|---|---|---|---|
| Español | `es` | Default, activo | Sin prefijo |
| Inglés | `en` | Activo | `/en/` |
| Neerlandés | `nl` | Desactivado | — |

- TODO el texto visible del website vive en `website/src/i18n/{locale}.json`
- Backend: colecciones y globals localizados con fallback al default
- Navegación por locale: `swapLocaleInPath()` en el engine de i18n

## Colecciones del backend

| Colección | Slug | Localizada | Versiones | Acceso lectura |
|---|---|---|---|---|
| Users | `users` | No | No | authenticated |
| Media | `media` | No | No | anyone |
| Categories | `categories` | Sí (title) | No | anyone |
| Pages | `pages` | Sí | Drafts | authenticatedOrPublished |
| Posts | `posts` | Sí | Drafts | authenticatedOrPublished |
| Projects | `projects` | Sí | Drafts | authenticatedOrPublished |
| Services | `services` | Sí | Drafts | authenticatedOrPublished |

## Plugins del CMS

| Plugin | Aplica a | Función |
|---|---|---|
| `@payloadcms/plugin-seo` | pages, posts, projects, services | Meta títulos, OG images, preview |
| `@payloadcms/plugin-nested-docs` | pages | Jerarquía padre/hijo, breadcrumbs |
| `@payloadcms/plugin-redirects` | pages, posts | Redirecciones 301/302 |
| `@payloadcms/richtext-lexical` | Todos los richText | Editor de contenido |
| `@payloadcms/email-resend` | Sistema | Emails transaccionales |

## Bloques de contenido (11)

Archive, Banner, CallToAction, Cards, Code, Content, FAQ, Gallery, MediaBlock, MediaContent, Pricing.

Ver `backend/.agents/skills/payload/reference/BLOCKS.md`.

## Website — Rutas principales

| Ruta (es) | Ruta (en) | Descripción |
|---|---|---|
| `/` | `/en` | Homepage |
| `/services` | `/en/services` | Servicios overview |
| `/services/{slug}` | `/en/services/{slug}` | Detalle de servicio |
| `/blog` | `/en/blog` | Blog listing |
| `/blog/{slug}` | `/en/blog/{slug}` | Blog post |
| `/projects` | `/en/projects` | Portafolio |
| `/projects/{slug}` | `/en/projects/{slug}` | Proyecto |
| `/about` | `/en/about` | Nosotros |
| `/contact` | `/en/contact` | Contacto |
| `/{slug}` | `/en/{slug}` | Páginas CMS (catch-all) |

## Website — API routes

| Ruta | Método | Función |
|---|---|---|
| `/api/contact` | POST | Formulario de contacto → Resend |
| `/api/newsletter` | POST | Suscripción newsletter → Resend |
| `/api/preview` | GET | Activar modo preview (setea cookie) |
| `/api/exit-preview` | GET | Desactivar preview |

## Website — Componentes clave (57 total)

Ver `website/component-registry.json` para el catálogo completo.

**Categorías**:
- `ui/` (30+) — Primitivos de diseño (Button, Card, Badge, Dialog, Tabs, Accordion, etc.)
- `layout/` (6) — Header, Footer, Analytics, LanguageSwitcher, SearchModal, Theme*
- `blocks/` (9) — Renderizadores de bloques CMS (ContentBlock, CTABlock, FAQBlock, etc.)
- `patterns/` (11) — Formularios, Newsletter, YouTube, StatCard
- `hero/` (2) — Hero variants (highImpact, mediumImpact, lowImpact)
- `seo/` (3) — SEO meta, JSON-LD, Breadcrumbs
- `services/` (8) — ServiceCard, ServiceGrid, ServiceFeatures, etc.
- `projects/` (8) — ProjectCard, ProjectHero, ProjectGallery, etc.
- `landing/` (7) — CTA, FeatureTabs, StackMarquee, etc.

## Design System

- **13 temas de color** (OKLCH): orange, amber, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, magenta
- **Tema por defecto**: `blue` (`#0055aa` brand color)
- **Modo**: system (prefers-color-scheme) + toggle manual
- **Fuentes**: Outfit (display), Manrope (body), JetBrains Mono (code)
- **Tokens CSS**: `--primary`, `--background`, `--foreground`, `--border`, `--card`, `--muted`, etc.
- **Sin PostCSS**: Tailwind v4 via Vite plugin nativo

## Comunicación Backend ↔ Website

### Fetch wrapper (`website/src/lib/payload.ts`)

```typescript
fetchAPI<T>(endpoint, { locale, draft? })
// → GET {PAYLOAD_URL}/api/{endpoint}?locale=es&depth=2
// → Timeout 15s
// → Authorization header si draft=true
```

### Modo preview

```
Payload Admin "Preview" →
  abre /api/preview?secret={PREVIEW_SECRET}&path=/slug →
  Astro valida, setea cookie __prv →
  Página detecta cookie →
  fetchAPI con draft=true + API key →
  Payload devuelve draft
```

### Media

- Backend sirve archivos en `/api/media/file/{filename}`
- `resolveMediaUrl()` en el website convierte paths relativos a absolutos

## Comandos

### Desde raíz

```bash
pnpm dev            # Backend + Website en paralelo
pnpm dev:backend    # Solo backend (:3000)
pnpm dev:website    # Solo website (:4321)
pnpm build          # Build de ambos paquetes
pnpm build:backend  # Build solo backend
pnpm build:website  # Build solo website
```

### Backend

```bash
pnpm dev            # Dev server
pnpm build          # Production build
pnpm seed           # Sembrar datos demo
pnpm clean-versions # Limpiar versiones draft
pnpm migrate:create # Crear migración
pnpm test:int       # Tests integración
pnpm test:e2e       # Tests E2E
```

### Website

```bash
pnpm dev            # Dev server
pnpm build          # Production build
pnpm check          # astro check + TypeScript + ESLint + Prettier
pnpm test           # Vitest
pnpm fix            # ESLint + Prettier fixes
```

## Variables de entorno

### Backend (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL |
| `PAYLOAD_SECRET` | Secreto de encriptación |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública del backend |
| `FRONTEND_URL` | URL del website (para CORS y preview) |
| `RESEND_API_KEY` | API key de Resend |
| `RESEND_FROM_EMAIL` | Email remitente |
| `RESEND_AUDIENCE_ID` | ID de audiencia en Resend |
| `CRON_SECRET` | Secreto para jobs |
| `PREVIEW_SECRET` | Secreto para preview mode |
| `MEDIA_PATH` | Ruta de uploads (default: public/media) |

### Website (`.env`)

| Variable | Descripción |
|---|---|
| `PAYLOAD_URL` | URL del backend |
| `PAYLOAD_API_KEY` | API key del service account |
| `PREVIEW_SECRET` | Mismo secreto que el backend |
| `SITE_URL` | URL pública del sitio |
| `RESEND_API_KEY` | API key de Resend |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics |

## Migraciones

Dos migraciones en `backend/src/migrations/`:
1. `20260801_232755_initial` — Todas las tablas base
2. `20260803_155526` — Colección services

## Documentación relacionada

| Archivo | Contenido |
|---|---|
| `AGENTS.md` | Doc raíz para agentes |
| `backend/AGENTS.md` | Referencia al skill de Payload |
| `website/AGENTS.md` | Convenciones del tema Astro Rocket |
| `backend/.agents/skills/payload/SKILL.md` | Quick reference de Payload |
| `backend/.agents/skills/payload/reference/*.md` | 12 docs detallados de Payload |
| `backend/README.md` | Setup del backend |
| `website/README.md` | Documentación del tema Astro Rocket |
| `docs/superpowers/specs/` | Especificaciones de features (design specs) |
| `docs/superpowers/plans/` | Planes de implementación (implementation plans) |
| `.superpowers/sdd/` | Spec-Driven Development tasks breakdown |
| `.opencode/opencode.json` | Configuración de agentes OpenCode |

## Payload CMS Features — Plan de Mejora (2026-08-24)

**Estado**: Planificado — Ver documentos detallados abajo.

| Documento | Ubicación | Propósito |
|---|---|---|
| **Spec (Diseño)** | `docs/superpowers/specs/2026-08-24-payload-cms-features-design.md` | Arquitectura, flujos, código de referencia para cada feature |
| **Plan (Implementación)** | `docs/superpowers/plans/2026-08-24-payload-cms-features-implementation.md` | Fases, tareas, estimación, rollout, métricas |
| **SDD Tasks** | `.superpowers/sdd/2026-08-24-payload-cms-features/TASKS.md` | Desglose granular de 80+ tareas con dependencias |

### Resumen de Fases (8 fases, ~70h, 6 semanas)

| Fase | Enfoque | Features Clave |
|---|---|---|
| 1 | Fundamentos Críticos | Roles en Users, Revalidation hooks, Trash, Índices DB, Transaction safety |
| 2 | Access Control Avanzado | Factory functions (role/org/time), Field-level access, Matriz de permisos |
| 3 | Jobs Queue | 5 tasks: revalidate, syncSearch, sitemap, cleanup, webhook + cron |
| 4 | Cloud Storage | Cloudflare R2 para Media, migración zero-downtime |
| 5 | Search + Observabilidad | Meilisearch plugin, Sentry, Health checks, Structured logging |
| 6 | Rich Text + UX | Tables, inline images, Dashboard widget (My Drafts), Custom views |
| 7 | Admin Polish | Query Presets por colección, Collapsible en Services, Help text |
| 8 | Email | Templates (contact, newsletter, welcome), Preview, Tests |

### Feature Flags para Rollout Gradual

```bash
FEATURE_ROLES=true
FEATURE_JOBS=true
FEATURE_SEARCH=true
FEATURE_R2=true
FEATURE_SENTRY=true
FEATURE_RICH_TEXT_TABLES=true
FEATURE_DASHBOARD_WIDGETS=true
FEATURE_QUERY_PRESETS=true
```
