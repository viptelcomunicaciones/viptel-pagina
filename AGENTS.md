# Viptel Comunicaciones — Monorepo

pnpm workspace con dos paquetes:

- **`backend/`** — Headless CMS (Payload CMS 3 + Next.js 16 + PostgreSQL)
- **`website/`** — Sitio público (Astro 7 + Tailwind CSS v4 + React)

## Arquitectura

```
PostgreSQL (local) ←→ backend (Payload CMS, puerto 3000) ←→ website (Astro SSR, puerto 4321) → Usuarios
```

El website consume contenido del backend vía REST API de Payload en tiempo de ejecución (SSR). No hay acceso directo a base de datos desde el website.

## Comandos rápidos

### Desde raíz
| Comando | Qué hace |
|---|---|
| `pnpm dev` | Inicia backend y website en paralelo |
| `pnpm dev:backend` | Solo backend (puerto 3000) |
| `pnpm dev:website` | Solo website (puerto 4321) |
| `pnpm build` | Build de ambos paquetes |
| `pnpm build:backend` | Build solo backend |
| `pnpm build:website` | Build solo website |

### Dentro de cada paquete
Ver los AGENTS.md respectivos:
- `backend/AGENTS.md` — Skill de Payload CMS, colecciones, migraciones
- `website/AGENTS.md` — Tema Astro Rocket, componentes, contenido

## Contexto del negocio

**Viptel Comunicaciones** — empresa colombiana de telecomunicaciones:
- **Telecomunicaciones**: PBX, VoIP, redes, conectividad empresarial
- **Desarrollo web**: sitios corporativos, aplicaciones web, e-commerce
- **Marketing digital**: SEO, publicidad digital, redes sociales
- Bogotá, Colombia — atiende clientes en toda Latinoamérica

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| CMS | Payload CMS 3.86, Lexical editor |
| Frontend CMS | Next.js 16.2, React 19 |
| Frontend público | Astro 7.1, Tailwind CSS v4, React 19 |
| Base de datos | PostgreSQL + Drizzle ORM |
| Lenguajes | TypeScript 5.7 |
| Paquetería | pnpm workspaces |
| Contenedores | Docker, Node 22 Alpine |

## i18n

- `es` (default) y `en` activos
- `nl` está en los archivos de idioma pero desactivado en `i18n.config.ts`
- TODO el texto visible vive en `website/src/i18n/{locale}.json`
- `backend` también tiene localización (es/en, default es)

## Colecciones del backend

| Colección | Slug | Localizada | Versiones | Auth / Acceso |
|---|---|---|---|---|
| Users | `users` | — | — | Email/password + API key (`admin`, `editor`, `marketing`, `sales`) |
| Media | `media` | Sí (`alt`, `caption`) | — | Escritura `contentRoles`, lectura pública (WebP quality 82 + R2 S3) |
| Categories | `categories` | Sí | — | Escritura `contentRoles`, lectura pública |
| ProjectCategories | `project-categories` | Sí | — | Escritura `contentRoles`, lectura pública |
| Tags | `tags` | — | — | Escritura `contentRoles`, lectura pública |
| PostTypes | `post-types` | Sí | — | Escritura `contentRoles`, lectura pública |
| ProjectTypes | `project-types` | Sí | — | Escritura `contentRoles`, lectura pública |
| Pages | `pages` | Sí | Drafts | Escritura `contentRoles`, lectura pública (`published`) |
| Posts | `posts` | Sí | Drafts | Escritura `contentRoles`, lectura pública (`published`) |
| Projects | `projects` | Sí | Drafts | Escritura `contentRoles`, lectura pública (`published`) |
| Services | `services` | Sí | Drafts | Escritura `contentRoles`, lectura pública (`published`) |
| Forms | `forms` | Sí | — | Plugin Form Builder (`contentRoles` write, public read) |
| FormSubmissions | `form-submissions` | — | — | CRM Leads (`anyone` create, `crmRoles` read, `adminOnly` update/delete) |
| Search | `search` | Sí | — | Índice FTS (`@payloadcms/plugin-search`) para Pages, Posts, Projects y Services |
| Redirects | `redirects` | — | — | Redirecciones 301/302 (`contentRoles` write, public read) |

`Pages` y `Services` usan nested-docs plugin (jerarquía padre/hijo con breadcrumbs).
SEO plugin activo en `pages`, `posts`, `projects` y `services`.

## Plugins del CMS

- `@payloadcms/plugin-nested-docs` — páginas y servicios jerárquicos
- `@payloadcms/plugin-seo` — meta títulos/descripciones generados automáticamente
- `@payloadcms/plugin-search` — índice de búsqueda en tiempo real localizado (`es`/`en`)
- `@payloadcms/plugin-form-builder` — formularios dinámicos y CRM de leads (`forms`, `form-submissions`)
- `@payloadcms/plugin-redirects` — gestión de redirecciones 301/302
- `@payloadcms/storage-s3` — almacenamiento en Cloudflare R2 (con conversión automática a WebP)
- `@payloadcms/email-resend` — emails transaccionales vía Resend
- `@payloadcms/richtext-lexical` — editor de contenido rico

## Cómo se comunican backend y website

1. Backend corre en `http://localhost:3000` (dev) / `http://backend:3000` (red interna Docker)
2. Website corre en `http://localhost:4321` (dev) / `http://website:4321` (red interna Docker)
3. Website usa `INTERNAL_PAYLOAD_URL` (SSR fetch interno) y `PAYLOAD_URL` (URLs públicas de media)
4. Website obtiene el cliente tipado via `src/lib/payload-client.ts` con caché híbrida L1 LRU + SWR (`src/lib/cache.ts`, soporte opcional Redis L2 con `REDIS_URL`)
5. Al publicar/editar en Payload CMS, el hook `revalidateFrontend` notifica a `POST /api/revalidate` en el website para invalidar selectivamente la caché SSR
6. CORS configurado en backend para permitir ambos orígenes

## Deployment con Dokploy

### Arquitectura

```
Dokploy
├── PostgreSQL (addon)
├── Backend (Dockerfile en backend/)
│   ├── Puerto: 3000
│   ├── Healthcheck: /api/health
│   └── Start script: scripts/start.sh (migrate + start)
└── Website (Dockerfile en website/)
    ├── Puerto: 4321
    ├── Healthcheck: /api/health
    └── Start script: scripts/start.sh (node ./dist/server/entry.mjs)
```

### Archivos Docker

| Archivo | Función |
|---|---|
| `backend/Dockerfile` | Build del backend (Node 22 Alpine) |
| `backend/scripts/start.sh` | Ejecuta `pnpm payload migrate` luego `pnpm start` |
| `website/Dockerfile` | Build del website (Node 22 Alpine) |
| `website/scripts/start.sh` | Ejecuta `node ./dist/server/entry.mjs` |
| `website/.dockerignore` | Excluye .env, node_modules, dist, .astro |

### Variables de entorno (ver .env.example de cada paquete)

**Backend**: `DATABASE_URL`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL`, `PREVIEW_SECRET`
**Website**: `PAYLOAD_URL`, `SITE_URL`, `PREVIEW_SECRET`

### Flujo de deployment

1. Subir código a GitHub
2. Crear PostgreSQL en Dokploy (addon)
3. Crear servicio backend (Dockerfile, variables de entorno)
4. Crear servicio website (Dockerfile, variables de entorno)
5. Configurar dominios
6. Ejecutar seeds: `pnpm seed && pnpm seed:services` (terminal del backend)

## Documentación para agentes

| Ubicación | Contenido |
|---|---|
| `.opencode/opencode.json` | Configuración del agente |
| `backend/AGENTS.md` | → `backend/.agents/skills/payload/` |
| `backend/.agents/skills/payload/SKILL.md` | Referencia rápida de Payload CMS |
| `backend/.agents/skills/payload/reference/*.md` | 11 documentos detallados de Payload |
| `website/AGENTS.md` | Estructura y convenciones del tema Astro Rocket |
| `backend/README.md` | Setup y arquitectura del backend |
| `website/README.md` | Documentación completa del tema Astro Rocket |
| `docs/superpowers/specs/` | Especificaciones de features (design specs) |
| `docs/superpowers/plans/` | Planes de implementación |
| `.superpowers/sdd/` | Spec-Driven Development task breakdowns |
| `project-knowledge/SKILL.md` | Conocimiento completo del proyecto (skill) |

## Antes de finalizar

Siempre ejecutar `pnpm build` desde la raíz para verificar que ambos paquetes compilan sin errores.
