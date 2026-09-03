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

| Colección | Slug | Localizada | Versiones | Auth |
|---|---|---|---|---|
| Users | `users` | — | — | Email/ password |
| Categories | `categories` | Sí | Drafts | Admin CRUD |
| Media | `media` | — | — | Admin write, public read |
| Pages | `pages` | Sí | Drafts | Admin write, public read (published) |
| Posts | `posts` | Sí | Drafts | Admin write, public read (published) |
| Projects | `projects` | Sí | Drafts | Admin write, public read (published) |

Pages usa nested-docs plugin (jerarquía padre/hijo con breadcrumbs).
SEO plugin activo en pages, posts, projects.

## Plugins del CMS

- `@payloadcms/plugin-nested-docs` — páginas jerárquicas
- `@payloadcms/plugin-seo` — meta títulos/descripciones generados automáticamente
- `@payloadcms/email-resend` — emails transaccionales vía Resend
- `@payloadcms/richtext-lexical` — editor de contenido rico

## Cómo se comunican backend y website

1. Backend corre en `http://localhost:3000` (dev)
2. Website corre en `http://localhost:4321` (dev)
3. Website usa `PAYLOAD_URL` (env) para apuntar al backend
4. Website obtiene el payload client via `src/lib/payload.ts` (REST API)
5. CORS configurado en backend para permitir ambos orígenes

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
