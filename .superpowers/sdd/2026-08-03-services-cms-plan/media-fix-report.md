# Media URL Fix Report — 2026-08-03

## Resumen

Fix completado. Se agregó helper `resolveMediaUrl()` a `payload.ts` y se aplicó en todos los archivos que referencian `url` de media de Payload CMS.

## Cambios realizados

### Helper agregado
- `website/src/lib/payload.ts` — export `resolveMediaUrl(url)` que antepone `API_URL` (`http://localhost:3000`) a URLs relativas (`/api/media/file/...`)

### Archivos modificados (9 files, +27/-15)

| Archivo | Cambio |
|---|---|
| `src/lib/payload.ts` | Agregada exportación `resolveMediaUrl` |
| `src/pages/blog/[...slug].astro` | `coverImage.url` → `resolveMediaUrl(coverImage.url)` |
| `src/pages/blog/index.astro` | `coverImage.url` → `resolveMediaUrl(coverImage.url)` |
| `src/pages/projects/[slug].astro` | 2 cambios: `coverImage.url` + `image.url` |
| `src/components/blocks/HeroBlock.astro` | `image.url` → `resolveMediaUrl(image.url)` |
| `src/components/blocks/GalleryBlock.astro` | `image?.url` → `resolveMediaUrl(image?.url)` |
| `src/components/blocks/MediaContentBlock.astro` | 2 cambios: `mediaUrl` ambos lados |
| `src/components/blocks/ArchiveBlock.astro` | `coverImage.url` → `resolveMediaUrl(coverImage.url)` |
| `src/components/services/ServiceGallery.astro` | Reescritura de `getImageUrl()` para usar `resolveMediaUrl` |

Nota: Los archivos `[locale]` (items 4-6 del plan) no existen en el repositorio — el routing se maneja con rutas dinámicas `[locale]` en otros paths, pero no hay archivos específicos para blog/projects bajo `[locale]`.

## Resultado del build

```
pnpm --filter ./website run build → ✓ Completed (sin errores)
Commit: 1d7467a — fix(website): resolve Payload media URLs with API_URL prefix
```

## Estado: ✅ Completado
