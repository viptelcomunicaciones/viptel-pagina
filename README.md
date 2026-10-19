# Viptel Comunicaciones

Monorepo de Viptel Comunicaciones — empresa colombiana de telecomunicaciones, desarrollo web y marketing digital.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| CMS | Payload CMS 3.86 + Lexical editor |
| Frontend CMS | Next.js 16.2 + React 19 |
| Frontend público | Astro 7.1 + Tailwind CSS v4 + React 19 |
| Base de datos | PostgreSQL + Drizzle ORM |
| Paquetería | pnpm workspaces |
| Contenedores | Docker (Node 22 Alpine) |

## Arquitectura

```
PostgreSQL ←→ Backend (Payload CMS) ←→ Website (Astro SSR) → Usuarios
              Puerto 3000               Puerto 4321
              /admin                    /
              /api/*                    /es/*, /en/*
```

El website consume contenido del backend vía REST API en tiempo de ejecución (SSR). No hay acceso directo a base de datos desde el website.

## Desarrollo local

### Requisitos

- Node.js 22+
- pnpm
- PostgreSQL

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/viptelcomunicaciones.git
cd viptelcomunicaciones

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp website/.env.example website/.env
# Editar .env con tus credenciales reales

# Iniciar en modo desarrollo
pnpm dev
```

### URLs de desarrollo

| Servicio | URL |
|---|---|
| Backend (Payload CMS) | http://localhost:3000/admin |
| Website (Astro) | http://localhost:4321 |

### Sembrar datos demo

```bash
# Sembrar todo (admin + servicios + contenido)
cd backend
pnpm seed

# Solo sembrar servicios
pnpm seed:services
```

## Estructura del proyecto

```
viptelcomunicaciones/
├── backend/                # Payload CMS 3 + Next.js 16
│   ├── src/
│   │   ├── collections/    # 7 colecciones (Users, Media, Pages, Posts, Projects, Categories, Services)
│   │   ├── blocks/         # 11 bloques de contenido
│   │   ├── scripts/        # seed.ts, seed-services.ts
│   │   └── payload.config.ts
│   ├── Dockerfile          # Docker build para Dokploy
│   ├── scripts/start.sh    # migrate + start
│   └── .env.example
├── website/                # Astro 7 + Tailwind CSS v4
│   ├── src/
│   │   ├── components/     # 57 componentes
│   │   ├── pages/          # Rutas (es + en + API)
│   │   ├── i18n/           # Textos (es.json, en.json)
│   │   ├── lib/            # payload.ts (cliente REST)
│   │   └── config/         # site.config.ts, nav.config.ts, i18n.config.ts
│   ├── Dockerfile          # Docker build para Dokploy
│   ├── scripts/start.sh    # node ./dist/server/entry.mjs
│   └── .env.example
└── docs/                   # Especificaciones y planes
```

## i18n

- `es` (default, sin prefijo URL) y `en` (prefijo `/en/`) activos
- TODO el texto visible vive en `website/src/i18n/{locale}.json`
- El backend también tiene localización (es/en)

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

## Deployment con Dokploy

### Arquitectura en Dokploy

```
Dokploy
├── PostgreSQL (addon)
│   └── Base de datos: payload_viptel
├── Backend (servicio Docker)
│   ├── Dockerfile: backend/Dockerfile
│   ├── Puerto: 3000
│   ├── Dominio: cms.viptelcomunicaciones.com
│   ├── Healthcheck: /api/health
│   └── Start: scripts/start.sh (pnpm payload migrate && pnpm start)
└── Website (servicio Docker)
    ├── Dockerfile: website/Dockerfile
    ├── Puerto: 4321
    ├── Dominio: viptelcomunicaciones.com
    ├── Healthcheck: /api/health
    └── Start: scripts/start.sh (node ./dist/server/entry.mjs)
```

### Variables de entorno para Dokploy

#### Backend

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de PostgreSQL (del addon Dokploy) | `postgres://user:pass@postgres:5432/payload_viptel` |
| `PAYLOAD_SECRET` | Secreto para tokens JWT | `cadena-secreta-larga-min-32-chars` |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública del backend | `https://cms.viptelcomunicaciones.com` |
| `FRONTEND_URL` | URL pública del website | `https://viptelcomunicaciones.com` |
| `INTERNAL_FRONTEND_URL` | URL interna Docker para revalidación SSR | `http://website:4321` |
| `PREVIEW_SECRET` | Secreto para modo preview | `tu-preview-secret` |
| `R2_BUCKET` | Nombre del bucket R2 | `viptelcomunicaciones-web` |
| `R2_ACCESS_KEY_ID` | Access key ID Cloudflare R2 | `f4a8edd...` |
| `R2_SECRET_ACCESS_KEY` | Secret access key Cloudflare R2 | `a09b73a...` |
| `R2_ENDPOINT` | Endpoint S3 Cloudflare R2 | `https://<id>.r2.cloudflarestorage.com` |
| `R2_PUBLIC_DOMAIN` | Dominio público R2 / Cloudflare CDN | `https://cdn.viptelcomunicaciones.com` |
| `RESEND_API_KEY` | API Key de Resend (emails transaccionales) | `re_...` |

#### Website

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PAYLOAD_URL` | URL pública de Payload (media del navegador) | `https://cms.viptelcomunicaciones.com` |
| `INTERNAL_PAYLOAD_URL` | URL interna Docker para SSR ultra-rápido | `http://backend:3000` |
| `SITE_URL` | Dominio público del website | `https://viptelcomunicaciones.com` |
| `PREVIEW_SECRET` | Mismo que el backend | `tu-preview-secret` |
| `REDIS_URL` | (Opcional) URL de Redis para caché L2 compartida | `redis://redis:6379` |
| `RESEND_API_KEY` | (Opcional) Notificaciones directas de formularios | `re_...` |

## Comandos

### Desde la raíz

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Inicia backend y website en paralelo |
| `pnpm dev:backend` | Solo backend (puerto 3000) |
| `pnpm dev:website` | Solo website (puerto 4321) |
| `pnpm build` | Build de ambos paquetes |
| `pnpm build:backend` | Build solo backend |
| `pnpm build:website` | Build solo website |

### Backend

| Comando | Qué hace |
|---|---|
| `pnpm seed` | Sembrar datos demo completos |
| `pnpm seed:services` | Sembrar solo servicios |
| `pnpm payload migrate` | Ejecutar migraciones |
| `pnpm generate:types` | Generar tipos TypeScript |

### Website

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm check` | TypeScript + ESLint + Prettier |

## Documentación

| Archivo | Contenido |
|---|---|
| `AGENTS.md` | Instrucciones para agentes de IA |
| `PROJECT-KNOWLEDGE.md` | Conocimiento completo del proyecto |
| `backend/README.md` | Setup y arquitectura del backend |
| `website/README.md` | Setup y arquitectura del website |
| `backend/.agents/skills/payload/` | Skill de Payload CMS (13 archivos) |
| `docs/superpowers/` | Especificaciones y planes de features |

## Licencia

Proyecto privado — Viptel Comunicaciones.
