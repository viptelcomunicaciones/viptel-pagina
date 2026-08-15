# CMS Post: Related Posts + "Síguenos" CTA

**Fecha:** 2026-08-15
**Estado:** Aprobado por el usuario

## Problema

Los posts del CMS (Payload) se renderizan con `PostLayout.astro`, que hoy
termina en el footer "Volver al Blog". A diferencia de los posts MDX
(`BlogLayout.astro`), no muestran una sección de artículos relacionados ni un
CTA de cierre. El usuario quiere que el post individual tenga: contenido →
**Artículos relacionados** → **CTA "Síguenos"**, como en el ejemplo de Astro
Rocket.

## Objetivo

Agregar a `PostLayout.astro`:

1. Una sección "Artículos relacionados" que usa el campo `relatedPosts` del
   backend (relación manual) como fuente primaria y los tags compartidos como
   respaldo, mostrando máximo 3 posts.
2. Un bloque CTA "Síguenos" (Feed RSS + redes sociales + correo) debajo de la
   sección de relacionados.

## Fuente de datos

- **Campo `relatedPosts`** (manual): ya existe en la colección `Posts` del
  backend (`hasMany → posts`, `filterOptions` excluye al propio post). El
  `defaultPopulate` del backend solo resuelve `title`, `slug`, `categories` y
  `meta` en los posts referenciados — por eso se hace un **re-fetch por slug**
  con `payload.posts().getBySlug(slug, locale)` para obtener campos completos
  (excerpt, heroImage, publishedAt, tags, author).
- **Respaldo por tags**: misma lógica del componente `RelatedPosts.astro`
  existente (excluir el post actual, ordenar por nº de tags en común y luego
  por fecha). Se obtiene con `payload.posts().getAll(locale)`. Esta lógica se
  extrae a un helper `getRelatedByTags(currentSlug, tags, locale, max)` en
  `src/lib/blog.ts` para que tanto `RelatedPosts.astro` como `PostLayout` la
  reutilicen sin duplicación.

## Lógica de la sección de relacionados

1. Si `post.relatedPosts` tiene entradas, resolverlas por slug
   (`payload.posts().getBySlug`), filtrando las que no existan.
2. Si quedan menos de 3 slots (o no hay manuales), completar con
   `getRelatedByTags(currentSlug, tags, locale, 3)`, excluyendo el post actual
   y los ya elegidos manualmente.
3. Recortar a máximo 3.
4. Si el resultado final está vacío, no renderizar la sección.
5. Renderizar con `BlogCard` (mismo diseño que el resto del blog), título de
   sección `t('blog.relatedPosts')`.

## CTA "Síguenos"

Reutilizar el bloque que ya usa `BlogLayout.astro` (heading
`t('blog.followAlong')`, descripción `t('blog.followAlongLead')`, acciones:
Feed RSS `/rss.xml`, redes sociales vía `resolveSocialLinks(siteConfig.socialLinks)`,
correo `mailto:`). Solo la variante simple de `CTA.astro`
(`variant="default"`, `glow={false}`), sin LetterGlitch, para mantener el
layout del post limpio.

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `website/src/lib/blog.ts` | Añadir helper `getRelatedByTags(currentSlug, tags, locale, max)` con la lógica tag-based, reutilizado por `RelatedPosts.astro` y `PostLayout` |
| `website/src/components/blog/RelatedPosts.astro` | Refactorizar para usar el helper extraído (sin cambio de comportamiento) |
| `website/src/layouts/PostLayout.astro` | Añadir sección de relacionados (manual + respaldo tag-based) + CTA "Síguenos" |
| `website/src/i18n/es.json` / `en.json` | Sin cambios (keys existentes: `blog.relatedPosts`, `blog.followAlong`, `blog.followAlongLead`, `blog.rssFeed`, `blog.emailLabel`) |

## No se modifica

- Backend (colección Posts, migraciones, seed).
- `BlogLayout.astro` (posts MDX).
- Contenido del CTA "Síguenos" en `BlogLayout` (queda como está).