# Viptel Comunicaciones — Conocimiento del Proyecto

Documento de referencia completo para entender el monorepo Viptel Comunicaciones.

---

## 1. Identidad del proyecto

**Viptel Comunicaciones** — empresa colombiana de telecomunicaciones con tres líneas de negocio:
- **Telecomunicaciones**: PBX, VoIP, redes, conectividad empresarial
- **Desarrollo web**: sitios corporativos, aplicaciones web, e-commerce
- **Marketing digital**: SEO, publicidad digital, redes sociales

Ubicación: Bogotá, Colombia — atiende clientes en toda Latinoamérica.

---

## 2. Arquitectura

```
┌──────────────┐     ┌─────────────────────────┐     ┌──────────────────────┐
│  PostgreSQL  │ ←─→ │  Backend (Payload CMS)   │ ←─→ │  Website (Astro SSR)  │
│  :5432       │     │  Next.js 16  :3000       │     │  Astro 7    :4321     │
└──────────────┘     └─────────────────────────┘     └──────────────────────┘
                             ↑                                ↑
                      Admin Panel                      Usuarios finales
                      (CMS editor)                     (sitio público)
```

### Flujo de datos completo

1. **Editorial**: Contenido se crea/edita en Payload CMS admin panel (`localhost:3000/admin`)
2. **Almacenamiento**: Payload persiste en PostgreSQL (`payload_viptel`)
3. **API**: Payload expone REST API en `/api/{collection}` y GraphQL en `/api/graphql`
4. **Consumo**: Website (Astro SSR) consume la REST API en cada request vía `src/lib/payload.ts`
5. **Renderizado**: Astro renderiza HTML en servidor con datos frescos del CMS
6. **Entrega**: HTML se envía al navegador del usuario final

---

## 3. Estructura del monorepo

```
viptelcomunicaciones/
├── AGENTS.md                       # Instrucciones raíz para agentes
├── package.json                    # Scripts del workspace (pnpm)
├── pnpm-workspace.yaml             # Define paquetes: backend, website
├── PROJECT-KNOWLEDGE.md            # Este documento
├── project-knowledge/              # Skill para agentes de IA
│   └── SKILL.md
├── backend/                        # Payload CMS 3 + Next.js 16
│   ├── AGENTS.md
│   ├── README.md
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .agents/skills/payload/     # Skill de Payload (13 archivos)
│   │   ├── SKILL.md
│   │   └── reference/
│   │       ├── ACCESS-CONTROL.md
│   │       ├── BLOCKS.md
│   │       ├── COLLECTIONS.md
│   │       ├── ENDPOINTS.md
│   │       ├── FIELDS.md
│   │       ├── GLOBALS.md
│   │       ├── HOOKS.md
│   │       ├── I18N.md
│   │       ├── MIGRATIONS.md
│   │       ├── PLUGINS.md
│   │       ├── QUERIES.md
│   │       └── SEED-DATA.md
│   ├── src/
│   │   ├── access/                 # Control de acceso
│   │   │   ├── anyone.ts           # Siempre true
│   │   │   ├── authenticated.ts    # Requiere login
│   │   │   └── authenticatedOrPublished.ts  # Login o documento publicado
│   │   ├── app/(payload)/          # App router de Next.js
│   │   │   ├── admin/              # Panel de administración SPA
│   │   │   ├── api/                # REST + GraphQL endpoints
│   │   │   └── layout.tsx          # Root layout
│   │   ├── blocks/                 # 11 bloques de contenido reutilizables
│   │   │   ├── ArchiveBlock/config.ts
│   │   │   ├── Banner/config.ts
│   │   │   ├── CallToAction/config.ts
│   │   │   ├── Cards/config.ts
│   │   │   ├── Code/config.ts
│   │   │   ├── Content/config.ts
│   │   │   ├── FAQ/config.ts
│   │   │   ├── Gallery/config.ts
│   │   │   ├── MediaBlock/config.ts
│   │   │   ├── MediaContent/config.ts
│   │   │   └── Pricing/config.ts
│   │   ├── collections/            # 7 colecciones
│   │   │   ├── Categories.ts
│   │   │   ├── Media.ts
│   │   │   ├── Pages/index.ts
│   │   │   ├── Posts/index.ts + hooks/populateAuthors.ts
│   │   │   ├── Projects/index.ts
│   │   │   ├── Services/index.ts
│   │   │   └── Users/index.ts
│   │   ├── fields/                 # Campos personalizados
│   │   │   ├── defaultLexical.ts
│   │   │   ├── link.ts
│   │   │   ├── linkGroup.ts
│   │   │   └── seoTab.ts
│   │   ├── Footer/                 # Global: Footer
│   │   │   ├── config.ts
│   │   │   └── RowLabel.tsx
│   │   ├── Header/                 # Global: Header
│   │   │   ├── config.ts
│   │   │   └── RowLabel.tsx
│   │   ├── heros/                  # Configuración de héroe
│   │   │   └── config.ts
│   │   ├── hooks/                  # Hooks globales
│   │   │   └── populatePublishedAt.ts
│   │   ├── migrations/             # Migraciones Drizzle
│   │   │   ├── index.ts
│   │   │   ├── 20260801_232755_initial.ts + .json
│   │   │   └── 20260803_155526.ts + .json
│   │   ├── plugins/                # Configuración de plugins
│   │   │   └── index.ts
│   │   ├── scripts/                # Scripts de utilidad
│   │   │   ├── seed.ts
│   │   │   └── clean-versions.ts
│   │   ├── utilities/              # Utilidades
│   │   │   ├── deepMerge.ts
│   │   │   ├── generatePreviewPath.ts
│   │   │   ├── getURL.ts
│   │   │   └── toKebabCase.ts
│   │   ├── payload.config.ts       # Configuración principal
│   │   ├── payload-types.ts        # Tipos TS auto-generados
│   │   └── index.ts
│   └── tests/                      # Tests
│       ├── e2e/admin.e2e.spec.ts
│       ├── int/api.int.spec.ts
│       └── helpers/
├── website/                        # Astro 7 + Tailwind CSS v4
│   ├── AGENTS.md
│   ├── README.md
│   ├── astro.config.mjs
│   ├── component-registry.json     # Catálogo de 57 componentes
│   ├── src/
│   │   ├── assets/                 # Imágenes locales (blog, projects)
│   │   ├── components/
│   │   │   ├── blocks/             # Renderizadores de bloques CMS (9)
│   │   │   ├── effects/            # Efectos visuales (3)
│   │   │   ├── hero/               # Hero variants (2)
│   │   │   ├── landing/            # Landing components (7)
│   │   │   ├── layout/             # Header, Footer, Theme, Search (6)
│   │   │   ├── pages/              # Page views (6)
│   │   │   ├── patterns/           # Formularios, Newsletter (11)
│   │   │   ├── projects/           # Project display (8)
│   │   │   ├── seo/                # SEO, JSON-LD, Breadcrumbs (3)
│   │   │   ├── services/           # Service display (8)
│   │   │   └── ui/                 # Design system (30+)
│   │   ├── config/                 # Configuración del sitio
│   │   │   ├── site.config.ts      # Nombre, URL, colores, social
│   │   │   ├── nav.config.ts       # Menús de navegación
│   │   │   ├── i18n.config.ts      # Locales activos
│   │   │   └── consent.config.ts   # Cookie consent
│   │   ├── content/                # Colecciones locales (MDX/JSON)
│   │   ├── i18n/                   # Textos del sitio
│   │   │   ├── index.ts            # Engine i18n
│   │   │   ├── es.json             # Español (default, 559 líneas)
│   │   │   ├── en.json             # Inglés (523 líneas)
│   │   │   └── nl.json             # Neerlandés (inactivo)
│   │   ├── layouts/                # Layout shells (6)
│   │   ├── lib/                    # Utilidades (15 archivos)
│   │   │   ├── payload.ts          # Cliente REST de Payload
│   │   │   ├── payload-types.ts    # Tipos del CMS
│   │   │   ├── blog.ts, projects.ts  # Helpers de contenido
│   │   │   ├── schema.ts           # JSON-LD structured data
│   │   │   ├── cn.ts               # clsx + tailwind-merge
│   │   │   ├── utils.ts            # formatDate, readingTime, etc.
│   │   │   ├── tags.ts             # Utilidades de tags
│   │   │   └── themes.ts           # 12 temas de color
│   │   ├── pages/                  # 42 rutas (es + en + API)
│   │   └── styles/                 # Design system CSS
│   │       ├── global.css          # Estilos principales (1453 líneas)
│   │       ├── tokens/             # Primitives, colors, typography, spacing
│   │       └── themes/             # 13 archivos de tema (OKLCH)
│   └── public/                     # Assets estáticos
└── docs/                           # Documentación de features
    └── superpowers/
        ├── specs/2026-08-03-services-cms-design.md
        ├── plans/2026-08-03-services-cms-plan.md
        └── plans/2026-08-01-payload-template-rebase.md
```

---

## 4. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| CMS | Payload CMS | 3.86 |
| Frontend CMS | Next.js (App Router) | 16.2 |
| Frontend público | Astro (SSR mode) | 7.1 |
| UI framework | React | 19.2 |
| CSS framework | Tailwind CSS | v4 (Vite-native) |
| Base de datos | PostgreSQL | — |
| ORM | Drizzle (vía @payloadcms/db-postgres) | — |
| Rich text | Lexical | — |
| Lenguaje | TypeScript | 5.7 |
| Paquetería | pnpm workspaces | — |
| Contenedores | Docker (Node 22 Alpine) | — |
| Email transaccional | Resend | — |
| Búsqueda | Pagefind (post-build index) | — |
| Testing | Vitest + Playwright | — |
| Linting | ESLint + Prettier | — |

---

## 5. Backend — Payload CMS

### 5.1 Colecciones

| Colección | Slug | Localizada | Versiones | Auth | Acceso lectura |
|---|---|---|---|---|---|
| Users | `users` | No | No | Email/password + API key | authenticated |
| Media | `media` | No | No | — | anyone |
| Categories | `categories` | Sí | No | — | anyone |
| Pages | `pages` | Sí | Drafts | — | authenticatedOrPublished |
| Posts | `posts` | Sí | Drafts | — | authenticatedOrPublished |
| Projects | `projects` | Sí | Drafts | — | authenticatedOrPublished |
| Services | `services` | Sí | Drafts | — | authenticatedOrPublished |

### 5.2 Access Control

| Función | Lógica | Uso |
|---|---|---|
| `anyone` | Siempre `true` | Media read |
| `authenticated` | `Boolean(user)` | Users, Media write, contenido write |
| `authenticatedOrPublished` | user → `true`, no user → `{ _status: { equals: 'published' } }` | Pages, Posts, Projects, Services read |

### 5.3 Bloques de contenido

| Bloque | Slug | Usado en |
|---|---|---|
| Archive | `archive` | Pages |
| Banner | `banner` | Posts |
| CallToAction | `cta` | Pages, Services |
| Cards | `cards` | Pages, Services |
| Code | `code` | Posts |
| Content | `content` | Pages, Services |
| FAQ | `faq` | Pages, Services |
| Gallery | `gallery` | Pages, Services |
| MediaBlock | `mediaBlock` | Pages, Posts |
| MediaContent | `media-content` | Pages, Services |
| Pricing | `pricing` | Pages, Services |

### 5.4 Plugins

- **SEO**: Meta títulos, descripciones, OG images en pages/posts/projects/services
- **Nested Docs**: Jerarquía padre/hijo en pages con breadcrumbs
- **Redirects**: Redirecciones 301/302 para pages y posts
- **Lexical**: Editor de texto rico
- **Resend**: Emails transaccionales

### 5.5 Services — Jerarquía

```
Viptel-PBX (viptel-pbx)
├── Básica (viptel-pbx-basica)
└── Avanzada (viptel-pbx-avanzada)

Viptel-VoIP (viptel-voip)
├── Minutos VoIP (viptel-voip-minutos)
└── DID (viptel-voip-did)

Viptel-Web (viptel-web)
├── Sitio Informativo (viptel-web-sitio-informativo)
├── Sitio Corporativo (viptel-web-sitio-corporativo)
├── Tienda Básica (viptel-web-tienda-basica)
└── Tienda Avanzada (viptel-web-tienda-avanzada)

Viptel-Marketing (viptel-marketing)
├── Email Masivo (viptel-marketing-email)
├── WhatsApp Masivo (viptel-marketing-whatsapp)
├── SMS Masivo (viptel-marketing-sms)
└── Audio Masivo (viptel-marketing-audio)

Viptel-Software (viptel-software)
├── ERP (viptel-software-erp)
└── CRM (viptel-software-crm)
```

### 5.6 Migraciones

1. `20260801_232755_initial` — Creación de todas las tablas base
2. `20260803_155526` — Agrega colección services

### 5.7 Comandos

```bash
pnpm dev              # Dev server (:3000)
pnpm build            # Production build
pnpm seed             # Sembrar datos demo
pnpm migrate:create   # Crear nueva migración
pnpm test:int         # Tests de integración (Vitest)
pnpm test:e2e         # Tests E2E (Playwright)
```

---

## 6. Website — Astro

### 6.1 i18n

- `es` (default, sin prefijo URL) y `en` (prefijo `/en/`) activos
- `nl` existe en archivos pero está desactivado en `i18n.config.ts`
- TODO el texto visible vive en `src/i18n/{locale}.json`
- El engine (`src/i18n/index.ts`) provee `t()`, `tData()`, `localizedPath()`, `swapLocaleInPath()`

### 6.2 Rutas

| Ruta (es) | Ruta (en) | Tipo |
|---|---|---|
| `/` | `/en` | Homepage |
| `/services` | `/en/services` | SSR — lista de servicios |
| `/services/{slug}` | `/en/services/{slug}` | SSR — detalle de servicio |
| `/blog` | `/en/blog` | SSR — listado de blog |
| `/blog/{slug}` | `/en/blog/{slug}` | SSR — post individual |
| `/blog/page/{page}` | `/en/blog/page/{page}` | SSR — paginación |
| `/blog/tag/{tag}` | `/en/blog/tag/{tag}` | SSR — posts por tag |
| `/projects` | `/en/projects` | SSR — portafolio |
| `/projects/{slug}` | `/en/projects/{slug}` | SSR — proyecto |
| `/projects/page/{page}` | `/en/projects/page/{page}` | SSR — paginación |
| `/projects/tag/{tag}` | `/en/projects/tag/{tag}` | SSR — proyectos por tag |
| `/about` | `/en/about` | Página estática |
| `/contact` | `/en/contact` | Página con formulario |
| `/{slug}` | `/en/{slug}` | Catch-all CMS pages |
| `/api/contact` | — | POST — formulario contacto |
| `/api/newsletter` | — | POST — suscripción |
| `/api/preview` | — | GET — activar preview |
| `/api/exit-preview` | — | GET — desactivar preview |

### 6.3 Cliente de Payload (`src/lib/payload.ts`)

Funciones exportadas:
- `getPageBySlug()`, `getPages()`
- `getPostBySlug()`, `getPosts()`, `getAllPosts()`, `getPostsByTag()`
- `getProjectBySlug()`, `getProjects()`, `getAllProjects()`, `getProjectsByTag()`
- `getServiceCategories()`, `getServicesByParent()`, `getServiceBySlug()`, `getAllServices()`
- `getRedirect()`, `resolveMediaUrl()`

Wrapper `fetchAPI<T>()`:
- Timeout 15s
- `?locale=` y `?depth=2` en todas las requests
- `Authorization` header con API key cuando `draft=true`

### 6.4 Design System

- **13 temas de color** (OKLCH): orange, amber, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, magenta
- **Tema por defecto**: `blue` (`#0055aa`)
- **Modo**: system (prefers-color-scheme) con toggle manual
- **Fuentes**: Outfit (display), Manrope (body), JetBrains Mono (code)
- **Tokens CSS**: `--primary`, `--background`, `--foreground`, `--border`, `--card`, `--muted`, etc.

### 6.5 Componentes principales

Ver `website/component-registry.json` para el catálogo completo de 57 componentes.

### 6.6 Comandos

```bash
pnpm dev          # Dev server (:4321)
pnpm build        # Production build (astro check + build)
pnpm check        # astro check + TypeScript + ESLint + Prettier
pnpm test         # Vitest
pnpm fix          # ESLint + Prettier fixes
```

---

## 7. Modo Preview

El flujo de preview permite ver drafts del CMS en el website:

1. Admin Panel → botón "Preview" en un documento
2. Abre `{FRONTEND_URL}/api/preview?secret={PREVIEW_SECRET}&path=/slug`
3. Endpoint Astro valida `PREVIEW_SECRET`, setea cookie `__prv`
4. Página Astro detecta la cookie en el request
5. `fetchAPI()` usa `draft=true` + header `Authorization: users API-Key {key}`
6. Payload devuelve el draft (el API key cuenta como usuario autenticado)

---

## 8. SEO y Schema.org

- **Plugin SEO de Payload**: Genera meta títulos (`Viptel — {title}`), descripciones, OG images
- **Componente SEO de Astro**: `<SEO />` renderiza meta tags, Open Graph, Twitter cards, hreflang
- **JSON-LD**: `src/lib/schema.ts` genera Organization, WebSite, ProfessionalService, BlogPosting, BreadcrumbList, FAQPage
- **OG Images**: Generación dinámica SVG en `src/lib/og.ts`

---

## 9. Variables de entorno clave

### Backend

| Variable | Ejemplo |
|---|---|
| `DATABASE_URL` | `postgres://postgres:viptel3562@127.0.0.1:5432/payload_viptel` |
| `PAYLOAD_SECRET` | Secreto de encriptación |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3000` |
| `FRONTEND_URL` | `http://localhost:4321` |
| `PREVIEW_SECRET` | `01798635fc2b4dae` |

### Website

| Variable | Ejemplo |
|---|---|
| `PAYLOAD_URL` | `http://localhost:3000` |
| `PAYLOAD_API_KEY` | API key del service account |
| `PREVIEW_SECRET` | Mismo que el backend |
| `SITE_URL` | `https://viptelcomunicaciones.com` |

---

## 10. Documentación relacionada

| Archivo | Propósito |
|---|---|
| `AGENTS.md` | Instrucciones raíz para agentes de IA |
| `backend/AGENTS.md` | Skill de Payload CMS |
| `website/AGENTS.md` | Convenciones del tema Astro Rocket |
| `backend/README.md` | Setup y arquitectura del backend |
| `website/README.md` | Documentación del tema Astro Rocket |
| `backend/.agents/skills/payload/` | Skill de Payload con 13 archivos |
| `project-knowledge/SKILL.md` | Skill de conocimiento del proyecto |
| `.opencode/opencode.json` | Configuración de agentes OpenCode |
| `docs/superpowers/specs/` | Especificaciones de features |
| `docs/superpowers/plans/` | Planes de implementación |
| `component-registry.json` | Catálogo de componentes del website |

---

## 11. Convenciones del proyecto

### Backend
- TypeScript ESM (`"type": "module"`)
- Path alias: `@/*` → `./src/*`
- Colecciones en `src/collections/{Nombre}/index.ts`
- Bloques en `src/blocks/{NombreBloque}/config.ts`
- Migraciones en `src/migrations/` con timestamp + nombre descriptivo
- Nunca editar `payload-types.ts` a mano — usar `pnpm generate:types`

### Website
- TODO el texto visible en `src/i18n/{locale}.json`, nunca en templates `.astro`
- Usar componentes existentes — ver `component-registry.json` antes de crear uno nuevo
- Colores vía tokens CSS, nunca hard-coded
- Imágenes vía `astro:assets` (`<Image />`)
- Cero JavaScript innecesario — Astro ships zero JS by default
- Animaciones respetan `prefers-reduced-motion`
- `pnpm build` es la prueba real — falla en problemas que `pnpm dev` oculta

### Ambos
- `pnpm build` desde raíz antes de finalizar cualquier cambio
- Los drafts son invisibles en producción — verificar con build, no con dev
- No crear archivos de ruta con prefijo de locale a mano — Astro i18n lo genera
