# Working in this codebase

Este sitio es **Viptel Comunicaciones**, una empresa colombiana de
telecomunicaciones. Está construido sobre el tema Astro Rocket.

**IMPORTANTE**: TODO el texto visible está en `src/i18n/` — no en los archivos
`.astro`. Editar un texto significa editar JSON, no templates.

## Contexto Viptel

| Aspecto   | Detalle                                               |
| --------- | ----------------------------------------------------- |
| Empresa   | Telecomunicaciones, desarrollo web, marketing digital |
| Ubicación | Bogotá, Colombia — atiende Latinoamérica              |
| i18n      | `es` (default) y `en` activos; `nl` inactivo          |
| CMS       | Backend Payload CMS en `http://localhost:3000`        |
| API       | Se consume REST API vía `src/lib/payload.ts`          |

### Configuraciones personalizadas para Viptel

- `src/config/site.config.ts` — nombre, URL, dirección Bogotá, color #0055aa
- `src/config/nav.config.ts` — menús en español
- `src/config/i18n.config.ts` — solo es/en activos
- `src/config/consent.config.ts` — cookie consent en español
- `src/i18n/en.json` + `es.json` + `nl.json` — textos completos del sitio
- `src/lib/schema.ts` — schema.org tipo Organization (no Person)

## SSR Standalone Mode

El website corre en modo SSR con `output: 'server'` y adaptador Node standalone:

- `astro.config.mjs`: `output: 'server'`, `@astrojs/node` con `host: '0.0.0.0'` y `port: 4321`
- Build: `pnpm build` genera `dist/server/entry.mjs`
- Start: `node ./dist/server/entry.mjs`
- No usa `server.cjs` (descontinuado por Astro)

### Cómo consume el backend

1. Website usa `PAYLOAD_URL` (env) para apuntar al backend
2. Cliente REST en `src/lib/payload.ts` hace fetch a `/api/*`
3. Timeout 15s por request
4. Headers: `?locale=`, `?depth=2`, `Authorization` cuando `draft=true`

---

Astro Rocket is a starter theme. You are almost certainly here to help someone
build **their** website on top of it, not to develop the theme itself. This file
tells you where everything lives and which conventions to follow, so you can
make changes that fit rather than changes that merely work.

## Payload CMS Features — Plan de Mejora (2026-08-24)

El backend Payload CMS tiene un plan de mejora enterprise-ready documentado en:

| Documento | Ubicación |
|---|---|
| Spec (Diseño) | `docs/superpowers/specs/2026-08-24-payload-cms-features-design.md` |
| Plan (Implementación) | `docs/superpowers/plans/2026-08-24-payload-cms-features-implementation.md` |
| SDD Tasks | `.superpowers/sdd/2026-08-24-payload-cms-features/TASKS.md` |

**Fases clave que afectan al website**:
- **Fase 3**: Jobs Queue → endpoint `/api/revalidate` en Astro
- **Fase 4**: Cloud Storage → URLs de media desde R2
- **Fase 5**: Search → endpoint `/api/search` en Astro
- **Fase 5**: Health checks → endpoint `/api/health` en backend

## The shape of the project

```
src/config/          Site settings — start here for almost any request
src/content/         The site's content (Markdown/MDX/JSON collections)
src/i18n/            All user-facing interface text, per language
src/components/      57 components, grouped by purpose
src/pages/           Routes; a file here is a URL
src/layouts/         Page shells the routes render into
src/lib/             Helpers for blog, projects, tags, SEO, themes
src/styles/          Design tokens and the twelve colour themes
component-registry.json   Machine-readable catalogue of every component
```

**Read `component-registry.json` first.** It lists every component with its
category, purpose and props. It is the fastest way to find out whether the
thing you are about to build already exists — it usually does.

## Where to make a change

| The request                                    | The file                                               |
| ---------------------------------------------- | ------------------------------------------------------ |
| Site name, logo, social links, contact details | `src/config/site.config.ts`                            |
| Navigation menus                               | `src/config/nav.config.ts`                             |
| Languages                                      | `src/config/i18n.config.ts`                            |
| Cookie-consent behaviour                       | `src/config/consent.config.ts`                         |
| Any visible interface text                     | `src/i18n/en.json` (and other locales)                 |
| A blog post                                    | a new `.mdx` file in `src/content/blog/<locale>/`      |
| A project                                      | a new `.mdx` file in `src/content/projects/<locale>/`  |
| Colours                                        | `src/styles/themes/*.css` — twelve themes, tokens only |

**Page copy is not in the page files.** Text lives in `src/i18n/en.json` and is
read through `t()`. Editing a heading usually means editing JSON, not `.astro`.
If a page appears to have hard-coded text, check the locale file first.

## Conventions worth keeping

- **Use existing components.** Check the registry before writing a new one.
  Components share one design language; a bespoke element breaks it.
- **Use the design tokens.** Colours come from CSS custom properties defined in
  `src/styles/`. Never hard-code a hex value — it will not follow the colour
  theme, and it will fail the contrast checks.
- **Every locale file stays in step.** Adding a key to `en.json` means adding it
  to every other locale, or that language falls back mid-page.
- **Motion respects `prefers-reduced-motion`.** Anything animated must stop for
  visitors who ask it to.
- **Images go through `astro:assets`.** Use the `<Image>` component so sizes and
  formats are generated at build time.
- **Zero JavaScript unless it earns its place.** Astro ships none by default;
  reach for a `<script>` only when the interaction genuinely needs one.

## Commands

```bash
pnpm dev          # development server
pnpm build        # production build — run before declaring work finished
pnpm check        # astro check, TypeScript, ESLint and Prettier
pnpm test         # Vitest unit tests
pnpm fix          # apply ESLint and Prettier fixes
```

`pnpm build` is the real test. It runs `astro check`, the content-collection
schemas and the link validation, and it fails on problems a dev server hides.

## Things that are easy to get wrong

- **Content collections are schema-checked.** Frontmatter that does not match
  `src/content.config.ts` fails the build. Read the schema before adding fields.
- **Drafts are filtered in production only.** `draft: true` still renders in
  `pnpm dev`, so verify with a build.
- **A draft is unreachable.** Linking to a drafted post or project produces a
  404 in production. Check inbound links before drafting something.
- **The theme supports multiple languages.** Locale-prefixed routes are
  generated automatically; do not create `src/pages/<locale>/` files by hand.

## Before you finish

Run `pnpm build`. Then confirm what you changed is actually visible on the page
you changed it on — not merely that the command exited without an error.

## Deployment con Dokploy

### Archivos Docker

| Archivo | Función |
|---|---|
| `Dockerfile` | Build del website (Node 22 Alpine) |
| `scripts/start.sh` | Ejecuta `node ./dist/server/entry.mjs` |
| `.dockerignore` | Excluye .env, node_modules, dist, .astro |

### HEALTHCHECK

El Dockerfile incluye un healthcheck que verifica `/api/health` cada 30 segundos.

### scripts/start.sh

```sh
#!/bin/sh
node ./dist/server/entry.mjs
```

Inicia el servidor Node standalone de Astro.

### Variables de entorno para Dokploy

| Variable | Fuente | Ejemplo |
|---|---|---|
| `PAYLOAD_URL` | URL del backend | `https://cms.viptelcomunicaciones.com` |
| `SITE_URL` | URL del website | `https://viptelcomunicaciones.com` |
| `PREVIEW_SECRET` | Compartir con backend | `tu-preview-secret` |

### build.sh (si se usa)

```sh
#!/bin/sh
pnpm install --frozen-lockfile
pnpm build
```

Ejecuta install + build antes de iniciar el contenedor.
