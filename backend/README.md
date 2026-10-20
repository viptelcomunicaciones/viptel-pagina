# Viptel Comunicaciones — Backend (Payload CMS)

Headless CMS de Viptel Comunicaciones construido con Payload CMS 3 + Next.js 16 + PostgreSQL.

## Stack

- **Payload CMS** 3.86 — framework de CMS headless sobre Node.js
- **Next.js** 16.2 — servidor y panel de administración
- **PostgreSQL** — base de datos relacional vía Drizzle ORM
- **TypeScript** 5.7 — tipado estricto en todo el proyecto

## Colecciones
 
| Slug | Localizada | Versiones | Auth / Acceso | Descripción |
|---|---|---|---|---|
| `users` | — | — | Email/password + API key | Administradores, editores, marketing y ventas |
| `media` | Sí (`alt`, `caption`) | — | Escritura `contentRoles`, lectura pública | Imágenes (WebP auto q:82) en Cloudflare R2 |
| `categories` | Sí | — | Escritura `contentRoles`, lectura pública | Categorías de artículos del blog |
| `project-categories` | Sí | — | Escritura `contentRoles`, lectura pública | Categorías de proyectos y portafolio |
| `tags` | — | — | Escritura `contentRoles`, lectura pública | Etiquetas taxonómicas |
| `post-types` | Sí | — | Escritura `contentRoles`, lectura pública | Tipos de post (artículo, noticia, tutorial) |
| `project-types` | Sí | — | Escritura `contentRoles`, lectura pública | Tipos de proyecto |
| `pages` | Sí | Drafts | Escritura `contentRoles`, lectura pública | Páginas del sitio con bloques (nested-docs) |
| `posts` | Sí | Drafts | Escritura `contentRoles`, lectura pública | Artículos del blog |
| `projects` | Sí | Drafts | Escritura `contentRoles`, lectura pública | Casos de estudio y portafolio |
| `services` | Sí | Drafts | Escritura `contentRoles`, lectura pública | Servicios Viptel jerárquicos |
| `forms` | Sí | — | Escritura `contentRoles`, lectura pública | Plugin Form Builder |
| `form-submissions` | — | — | CRM (`crmRoles` read, `anyone` create) | Envíos de leads y contactos |
| `search` | Sí | — | Índice FTS | Índice de búsqueda en tiempo real |
| `redirects` | — | — | Escritura `contentRoles`, lectura pública | Redirecciones 301 y 302 |
 
### Pages — Bloques disponibles
 
Las páginas usan un builder de bloques con 11 tipos:
Content, MediaContent, Cards, Pricing, CTA, FAQ, Gallery, Archive, Banner, Code, Form
 
### Plugins activos
 
- `@payloadcms/plugin-nested-docs` — jerarquía padre/hijo para páginas y servicios
- `@payloadcms/plugin-seo` — generación automática de meta tags con deduplicación inteligente
- `@payloadcms/plugin-search` — índice de búsqueda en tiempo real localizado (`es`/`en`)
- `@payloadcms/plugin-form-builder` — formularios dinámicos y CRM de leads
- `@payloadcms/plugin-redirects` — gestión de redirecciones 301/302
- `@payloadcms/storage-s3` — almacenamiento en Cloudflare R2 con WebP automático
- `@payloadcms/email-resend` — emails transaccionales vía Resend
- `@payloadcms/richtext-lexical` — editor de contenido rico

## Requisitos

- Node.js 22+
- pnpm
- PostgreSQL (local, no Docker)

## Desarrollo local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con DATABASE_URL, PAYLOAD_SECRET, etc.

# 3. Iniciar servidor de desarrollo
pnpm dev
# Abre http://localhost:3000/admin

# 4. Build de producción
pnpm build
```

## Migraciones

```bash
# Crear una nueva migración tras cambiar colecciones
pnpm payload migrate:create --name "descripcion_del_cambio"

# Ejecutar migraciones pendientes
pnpm payload migrate

# Ver estado de migraciones
pnpm payload migrate:status

# Resetear base de datos (borra datos)
pnpm payload migrate:reset
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL (`postgres://user:pass@host:5432/db`) |
| `PAYLOAD_SECRET` | Secreto para tokens JWT |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública del backend (`http://localhost:3000`) |
| `FRONTEND_URL` | URL del frontend (`http://localhost:4321`) |
| `RESEND_API_KEY` | API key de Resend para emails |
| `RESEND_FROM_EMAIL` | Remitente de correos |
| `RESEND_AUDIENCE_ID` | ID de audiencia para newsletter |

## i18n

- Idiomas activos: `es` (default), `en`
- Traducciones en el propio Payload (no archivos .json)

## Docker (opcional)

```bash
docker-compose up --build
```

Usa host.docker.internal para conectar al PostgreSQL local.
Requiere `.env` configurado.

## Deployment con Dokploy

### Archivos Docker

| Archivo | Función |
|---|---|
| `Dockerfile` | Build del backend (Node 22 Alpine) |
| `scripts/start.sh` | Ejecuta `pnpm payload migrate` luego `pnpm start` |

### HEALTHCHECK

El Dockerfile incluye un healthcheck que verifica `/api/health` cada 30 segundos.

### scripts/start.sh

```sh
#!/bin/sh
pnpm payload migrate
pnpm start
```

Ejecuta migraciones automáticamente al iniciar el contenedor.

### Variables de entorno para Dokploy

| Variable | Fuente | Ejemplo |
|---|---|---|
| `DATABASE_URL` | addon PostgreSQL en Dokploy | `postgres://user:pass@host:5432/payload_viptel` |
| `PAYLOAD_SECRET` | Generar string aleatorio | `tu-secreto-aqui-muy-largo` |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL del dominio | `https://cms.viptelcomunicaciones.com` |
| `FRONTEND_URL` | URL del website | `https://viptelcomunicaciones.com` |
| `PREVIEW_SECRET` | Compartir con website | `tu-preview-secret` |

### Sembrar datos después del deploy

Una vez que el backend esté corriendo en Dokploy, ejecutar en la terminal:

```bash
pnpm seed && pnpm seed:services
```

Esto crea:
- Usuario admin: `viptelcomunicaciones@hotmail.com` / `Viptel3562/*-`
- Medios de demostración
- Posts de ejemplo
- Páginas de ejemplo
- Servicios Viptel (jerárquicos)

## Estructura del proyecto

```
src/
├── access/            # Funciones de control de acceso
│   └── index.ts       # adminOnly, adminOrPublishedOnly, everyone, noone
├── app/
│   ├── (payload)/     # Layout y estilos del admin de Payload
│   └── my-route/      # Ruta de ejemplo con Payload API
├── blocks/            # 10 bloques reutilizables (Content, CTA, FAQ, etc.)
├── collections/       # Definiciones de 6 colecciones
├── hooks/             # Hooks como setAuthor
├── migrations/        # Migraciones generadas por Payload
└── payload.config.ts  # Configuración principal del CMS
```

## Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Next.js) |
| `pnpm build` | Build de producción con type-check |
| `pnpm payload migrate` | Ejecutar migraciones |
| `pnpm payload migrate:create` | Crear nueva migración |
| `pnpm test` | Tests (Vitest) |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
