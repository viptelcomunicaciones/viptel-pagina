# Backend — Payload CMS

Este directorio contiene el backend de Viptel Comunicaciones: un headless CMS construido con Payload CMS 3 + Next.js 16 + PostgreSQL.

## Skill de Payload CMS

Para desarrollo con Payload, usar el skill en `.agents/skills/payload/`:
- `SKILL.md` — Referencia rápida
- `reference/` — 11 documentos detallados (collections, fields, hooks, access control, etc.)

## Arquitectura

```
PostgreSQL ←→ Payload CMS (Next.js 16) ←→ Website (Astro SSR)
             Puerto 3000                  Puerto 4321
             /admin                       /es/*, /en/*
             /api/*
```

## Colecciones

| Slug | Localizada | Versiones | Acceso lectura |
|---|---|---|---|
| `users` | — | — | Autenticado |
| `categories` | Sí | — | Público |
| `media` | — | — | Público (lectura), admin (escritura) |
| `pages` | Sí | Drafts | Autenticado o publicado |
| `posts` | Sí | Drafts | Autenticado o publicado |
| `projects` | Sí | Drafts | Autenticado o publicado |
| `services` | Sí | Drafts | Autenticado o publicado |

## Variables de entorno

| Variable | Descripción | Ejemplo local |
|---|---|---|
| `DATABASE_URL` | URL de PostgreSQL | `postgres://postgres:CHANGE_ME@localhost:5432/payload_viptel` |
| `PAYLOAD_SECRET` | Secreto para tokens JWT | `change-me-generate-a-long-random-string` |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública del backend | `http://localhost:3000` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:4321` |
| `PREVIEW_SECRET` | Secreto para modo preview | `change-me-shared-with-website` |
| `CRON_SECRET` | Secreto para cron jobs | `change-me-cron-secret` |

**Nunca commitear `.env` — usar `.env.example` como template.**

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar servidor de desarrollo
pnpm dev
# Abre http://localhost:3000/admin

# Build de producción
pnpm build
```

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Next.js) |
| `pnpm build` | Build de producción con type-check |
| `pnpm start` | Iniciar servidor de producción |
| `pnpm seed` | Sembrar datos demo (admin + servicios + contenido) |
| `pnpm seed:services` | Sembrar solo servicios |
| `pnpm payload migrate` | Ejecutar migraciones |
| `pnpm payload migrate:create --name "desc"` | Crear nueva migración |
| `pnpm generate:types` | Generar tipos TypeScript |
| `pnpm test` | Tests (Vitest) |

## Migraciones

```bash
# Crear migración tras cambiar colecciones
pnpm payload migrate:create --name "descripcion_del_cambio"

# Ejecutar migraciones pendientes
pnpm payload migrate

# Ver estado
pnpm payload migrate:status
```

## Docker (Dokploy)

### Dockerfile

- Base: Node 22 Alpine
- HEALTHCHECK: `curl -f http://localhost:3000/api/health`
- CMD: `scripts/start.sh` (migrate + start)

### scripts/start.sh

```sh
#!/bin/sh
pnpm payload migrate
pnpm start
```

Ejecuta migraciones automáticamente al iniciar, luego levanta el servidor.

### Variables para Dokploy

| Variable | Fuente |
|---|---|
| `DATABASE_URL` | Del addon PostgreSQL en Dokploy |
| `PAYLOAD_SECRET` | Generar string aleatorio largo |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://cms.viptelcomunicaciones.com` |
| `FRONTEND_URL` | `https://viptelcomunicaciones.com` |
| `PREVIEW_SECRET` | Generar y compartir con website |

## Estructura

```
src/
├── access/              # Control de acceso (anyone, authenticated, authenticatedOrPublished)
├── app/
│   ├── (payload)/       # Layout del admin
│   └── api/             # REST + GraphQL endpoints
├── blocks/              # 11 bloques de contenido
├── collections/         # 7 colecciones
├── hooks/               # Hooks como setAuthor
├── migrations/          # Migraciones Drizzle
├── scripts/             # seed.ts, seed-services.ts
└── payload.config.ts    # Configuración principal
```
