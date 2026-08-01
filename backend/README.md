# Viptel Comunicaciones — Backend (Payload CMS)

Headless CMS de Viptel Comunicaciones construido con Payload CMS 3 + Next.js 16 + PostgreSQL.

## Stack

- **Payload CMS** 3.86 — framework de CMS headless sobre Node.js
- **Next.js** 16.2 — servidor y panel de administración
- **PostgreSQL** — base de datos relacional vía Drizzle ORM
- **TypeScript** 5.7 — tipado estricto en todo el proyecto

## Colecciones

| Slug | Localizada | Versiones | Descripción |
|---|---|---|---|
| `users` | — | — | Autenticación de administradores |
| `categories` | Sí | Drafts | Categorías para posts |
| `media` | — | — | Subida y redimensionado de imágenes |
| `pages` | Sí | Drafts | Páginas del sitio con bloques (nested-docs) |
| `posts` | Sí | Drafts | Artículos del blog |
| `projects` | Sí | Drafts | Casos de estudio y portafolio |

### Pages — Bloques disponibles

Las páginas usan un builder de bloques con 10 tipos:
Content, MediaContent, Cards, Pricing, CTA, FAQ, Gallery, Archive, Banner, Code

### Plugins activos

- `@payloadcms/plugin-nested-docs` — jerarquía padre/hijo para páginas
- `@payloadcms/plugin-seo` — generación automática de meta tags
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
