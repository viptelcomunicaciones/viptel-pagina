# Payload Template Rebase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Backend Payload re-construido sobre el template oficial `website` 3.x (adaptado a PostgreSQL + i18n es/en + Projects + bloques Viptel), website Astro consumiendo el 100% del contenido desde Payload con todas las rutas funcionales (incl. preview de borradores), y personalización de marca como fase final.

**Architecture:** CMS headless en `:3000` con la estructura del template oficial (access/, blocks/, heros/, fields/, globals/, plugins/) menos lo que no aplica (frontend Next, live-preview-react, revalidate hooks, form-builder, searchPlugin). Astro SSR en `:4321` como única capa de presentación, pagefind para búsqueda, SEO híbrido (meta por documento en CMS, render + site-level SEO en Astro).

**Tech Stack:** Payload 3.86 / Next 16.2 / PostgreSQL+Drizzle / Astro 7.1 / Tailwind v4 / TS 5.7 / pnpm workspaces.

## Global Constraints

- PostgreSQL se conserva (`postgresAdapter`), NO mongo
- i18n es/en en backend (default `es`, fallback `true`) y website (`es` default, sin `nl`)
- Bloques Viptel (Cards, Pricing, FAQ, Gallery, MediaContent) se conservan — el website ya los renderiza
- Sin `@payloadcms/plugin-form-builder` (API propia `/api/contact`) ni `@payloadcms/plugin-search` (pagefind)
- Sin hooks `revalidate*` (Astro es SSR runtime, no hay ISR que invalidar)
- `nested-docs` solo en `pages`
- SEO híbrido: seoPlugin en CMS (tab explícita, `generateURL` → FRONTEND_URL) + SEO.astro renderiza + site-level (schema.org, sitemap, robots, hreflang)
- Preview: `admin.preview` + `admin.livePreview.url` → `${FRONTEND_URL}/api/preview?...&secret=PREVIEW_SECRET`; Astro fetchea drafts con `?draft=true` + `Authorization: users API-Key ${PAYLOAD_API_KEY}` (`useAPIKey: true` en Users); near-live via postMessage→reload (autosave 100ms)
- Personalización de marca = Fase 5, nunca antes que funcionalidad
- Verificación por fase: `pnpm build` en verde

## Decisiones aprobadas (2026-08-01)

1. Backend: re-scaffold desde template oficial (no refactor in-place)
2. Formularios: mantener API propia de Astro (sin form-builder)
3. DB local: reset + seed
4. Búsqueda: pagefind de Astro Rocket (sin searchPlugin)
5. Preview/drafts: incluir TODAS las funcionalidades del template (preview + drafts completos; live preview como near-live)
6. SEO: híbrido (recomendación aceptada)

## Fuente de verdad del template

Sparse checkout local: `%TEMP%\opencode\payload-repo\templates\website` (rama 3.x)

---

## Fase 0 — Higiene del repositorio ✅

- [x] Task 0.1: git init raíz, consolidar repos anidados (backend/.git, website/.git), .gitignore, commit snapshot

## Fase 1 — Backend: re-scaffold desde template

- [ ] Task 1.1: Importar estructura CMS del template (access, collections, blocks, heros, fields, utilities, Header/Footer, plugins) adaptando: sin revalidate*, sin form-builder/search, nested-docs→pages
- [ ] Task 1.2: Port Viptel — Projects (estilo template), bloques extra (Cards/Pricing/FAQ/Gallery/MediaContent), Media 6 tamaños + focalPoint, Posts + campo tags
- [ ] Task 1.3: payload.config.ts final (postgresAdapter, localization es/en, CORS, Resend condicional, globals, plugins, admin.meta Viptel)
- [ ] Task 1.4: Preview backend — Users `useAPIKey: true`, utilities/generatePreviewPath (paths: pages `/{slug}`, posts `/blog/{slug}`, projects `/projects/{slug}`, locale prefix), admin.preview + livePreview + breakpoints
- [ ] Task 1.5: `payload migrate:create initial` (DB reseteada) + `src/scripts/seed.ts` (admin, usuario servicio website con API key, categorías, home es+en, 2 posts, 2 proyectos, Header/Footer navItems) + script `"seed": "tsx src/scripts/seed.ts"`
- [ ] Task 1.6: .env.example sin secretos, rotar password DB, compose env_file, eliminar frontend.e2e.spec.ts roto, int tests reales, `pnpm generate:types`, `pnpm build` verde

## Fase 2 — Website: integración

- [ ] Task 2.1: `src/lib/payload-types.ts` = tipos generados del backend; quitar dep `payload-app`; rewrite `payload.ts` (where[slug][equals] server-side, try/catch fallback→null, sort=-publishedAt, paginación { docs, totalPages }, opción draft, getRedirect)
- [ ] Task 2.2: Bloques sincronizados con blockTypes nuevos (hero highImpact/mediumImpact/lowImpact, archive populateBy); SEO.astro consume `doc.meta.{title,description,image}`

## Fase 3 — Website: fuente única + rutas funcionales

- [ ] Task 3.1: Eliminar colecciones locales (blog/en 20, projects/en 7, stack, authors, faqs) + limpiar content.config.ts; home desde Payload
- [ ] Task 3.2: Reparar SSR — `[locale]/blog/page/[page]`, `[locale]/blog/tag/[tag]`, `[locale]/projects/page/[page]`, `[locale]/projects/tag/[tag]` con Astro.params + paginación server-side; OG svg desde Payload; rss.xml desde Payload (es); [...slug] chequea getRedirect antes de 404; quitar locale="es" hardcodeado
- [ ] Task 3.3: Preview mode Astro — `api/preview.ts` (valida secret, cookie __prv, redirect), `api/exit-preview.ts`, payload.ts draft+API key header, páginas SSR detectan cookie, script near-live (postMessage→reload), env schema PREVIEW_SECRET + PAYLOAD_API_KEY

## Fase 4 — Tests y build

- [ ] Actualizar 19 tests a config Viptel (es default, sin nl, nav Viptel, marca dinámica); eliminar tests de colecciones borradas; `pnpm check` + `pnpm test` + `pnpm build` verdes; `pnpm build` raíz verde

## Fase 5 — Personalización de marca (AL FINAL)

- [ ] CTAs tema (hero GitHub, Contáctanos 404, About GitHub, footer ES, astro.build)
- [ ] consent.config.ts español + páginas legales (/privacy, legalLinks)
- [ ] schema.ts → Colombia/Bogotá/Latam; título home duplicado
- [ ] Limpieza: /components, theme selector, adapters muertos (cloudflare/netlify/vercel + configs), nl.json bundle, .github del tema
- [ ] package.json ambos paquetes; datos contacto (teléfono/calle); email dominio
- [ ] Docs: component-registry.json, website/AGENTS.md, backend/README.md, raíz AGENTS.md

## Nuevas variables de entorno

| Var | Dónde | Uso |
|---|---|---|
| `PREVIEW_SECRET` | backend + website | Validar requests de preview |
| `PAYLOAD_API_KEY` | website | Fetch de drafts (usuario servicio) |
| `FRONTEND_URL` | backend | URLs preview + SEO generateURL |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Template 3.x cambia | Sparse checkout fijado localmente en %TEMP% |
| payload-types website desincronizado | Re-copiar generado al final de Fase 1; build valida |
| Contenido local borrado rompe imports | grep getCollection/blog.ts/projects.ts tras Task 3.1 |
| Password DB rotada rompe entorno | Solo en .env local, no commiteado |
