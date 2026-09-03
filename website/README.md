# Viptel Comunicaciones — Website

Sitio público de Viptel Comunicaciones construido con Astro 7 + Tailwind CSS v4 + React 19.

## Stack

- **Astro** 7.1 — framework de sitio web con SSR
- **Tailwind CSS** v4 — framework CSS con OKLCH
- **React** 19 — componentes interactivos (islands)
- **TypeScript** 5.7 — tipado estricto
- **Payload CMS** — backend headless (consumido vía REST API)

## Características

- SSR con adaptador Node standalone
- i18n: español (default) e inglés
- 57 componentes reutilizables
- 12 temas de color (OKLCH)
- SEO completo (meta tags, JSON-LD, sitemap)
- Búsqueda estática con Pagefind
- Blog con comentarios
- Portafolio de proyectos
- Formulario de contacto
- Modo oscuro/claro

## Requisitos

- Node.js 22+
- pnpm

## Desarrollo local

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con PAYLOAD_URL=http://localhost:3000

# Iniciar servidor de desarrollo
pnpm dev
# Abre http://localhost:4321

# Build de producción
pnpm build
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PAYLOAD_URL` | URL del backend Payload CMS | `http://localhost:3000` |
| `SITE_URL` | URL pública del sitio | `https://viptelcomunicaciones.com` |
| `RESEND_API_KEY` | API key de Resend (opcional) | `re_xxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Email remitente (opcional) | `noreply@viptelcomunicaciones.com` |
| `PUBLIC_GA_MEASUREMENT_ID` | Google Analytics (opcional) | `G-XXXXXXXXXX` |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps (opcional) | |

**Nunca commitear `.env` — usar `.env.example` como template.**

## i18n

- `es` (default, sin prefijo URL) y `en` (prefijo `/en/`) activos
- TODO el texto visible vive en `src/i18n/{locale}.json`
- Para traducir, copiar las keys de `es.json` a `en.json` y traducir valores
- Nunca editar texto directamente en archivos `.astro`

## Estructura del proyecto

```
src/
├── assets/              # Imágenes procesadas por Astro
├── components/
│   ├── blocks/          # Renderizadores de bloques CMS (9)
│   ├── effects/         # Efectos visuales (3)
│   ├── hero/            # Hero variants (2)
│   ├── landing/         # Componentes de landing (7)
│   ├── layout/          # Header, Footer, Theme, Search (6)
│   ├── pages/           # Page views (6)
│   ├── patterns/        # Formularios, Newsletter (11)
│   ├── projects/        # Display de proyectos (8)
│   ├── seo/             # SEO, JSON-LD, Breadcrumbs (3)
│   ├── services/        # Display de servicios (8)
│   └── ui/              # Design system (30+)
├── config/
│   ├── site.config.ts   # Nombre, URL, colores, social
│   ├── nav.config.ts    # Menús de navegación
│   ├── i18n.config.ts   # Locales activos
│   └── consent.config.ts # Cookie consent
├── content/             # Colecciones locales (MDX/JSON)
├── i18n/                # Textos del sitio
│   ├── index.ts         # Engine i18n
│   ├── es.json          # Español (default)
│   ├── en.json          # Inglés
│   └── nl.json          # Neerlandés (inactivo)
├── layouts/             # Layout shells (6)
├── lib/
│   ├── payload.ts       # Cliente REST de Payload
│   ├── payload-types.ts # Tipos del CMS
│   ├── schema.ts        # JSON-LD structured data
│   └── themes.ts        # 12 temas de color
├── pages/               # Rutas (es + en + API)
└── styles/              # Design system CSS
    ├── global.css       # Estilos principales
    ├── tokens/          # Design tokens
    └── themes/          # 13 archivos de tema (OKLCH)
```

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo (puerto 4321) |
| `pnpm build` | Build de producción (astro check + build) |
| `pnpm check` | TypeScript + ESLint + Prettier |
| `pnpm test` | Tests (Vitest) |
| `pnpm fix` | Aplicar fixes de ESLint + Prettier |

## Componentes

Ver `component-registry.json` para el catálogo completo de 57 componentes con sus props y categorías.

## Deployment con Dokploy

### Archivos Docker

| Archivo | Función |
|---|---|
| `Dockerfile` | Build del website (Node 22 Alpine) |
| `scripts/start.sh` | Ejecuta `node ./dist/server/entry.mjs` |
| `.dockerignore` | Excluye .env, node_modules, dist, .astro |

### scripts/start.sh

```sh
#!/bin/sh
node ./dist/server/entry.mjs
```

Inicia el servidor Node standalone de Astro.

### Variables para Dokploy

| Variable | Fuente | Ejemplo |
|---|---|---|
| `PAYLOAD_URL` | URL del backend | `https://cms.viptelcomunicaciones.com` |
| `SITE_URL` | URL del website | `https://viptelcomunicaciones.com` |
| `PREVIEW_SECRET` | Compartir con backend | `tu-preview-secret` |

## Temas de color

El sitio soporta 12 temas de color vía CSS custom properties:
orange, amber, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, magenta

Tema por defecto: `blue` (`#0055aa`)

Para cambiar el tema, modificar `src/config/site.config.ts`.

## Fuentes

- **Display**: Outfit
- **Body**: Manrope
- **Code**: JetBrains Mono
