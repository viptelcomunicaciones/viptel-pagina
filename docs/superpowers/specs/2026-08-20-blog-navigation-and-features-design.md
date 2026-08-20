# Blog: navegación lateral + funcionalidad + sección home — Diseño

Fecha: 2026-08-20
Estado: Aprobado (pendiente plan de implementación)

## Contexto

El blog de Viptel es 100% CMS-driven: los posts, tipos, categorías y etiquetas
vienen del backend Payload CMS vía REST (SSR). Hoy las páginas de listado del
blog amontonan en la parte superior las pestañas de tipos de post (`BlogTypeTabs`)
y la nube de etiquetas (`TagList`), lo que resulta desordenado.

**Decisión clave del cliente:** NO se toca el backend ni el esquema de Payload.
Solo se rediseña la presentación en el frontend.

## Alcance

1. **Estructura y navegación**: reemplazar pestañas + nube de tags del top por un
   **menú lateral izquierdo** (sticky, colapsable en móvil) presente en todas las
   páginas de listado del blog. NO en el detalle del post.
2. **Funcionalidad**:
   - Botones de compartir: añadir WhatsApp, Facebook y Telegram (mantener X,
     LinkedIn, Bluesky, copiar enlace).
   - Activar comentarios Giscus (proveedor ya configurado; placeholders para que
     el cliente rellene repo/IDs luego).
   - Feed RSS: límite de posts, items enriquecidos (imagen + categorías), feed por
     idioma, y formulario de suscripción por email **solo UI**.
3. **Sección blog del home**: tarjetas con el mismo estilo que el blog, respetando
   selección/cantidad de Payload, enlace "Ver todos" → `/blog`, textos del
   encabezado siguen editándose en Payload.

## Fuera de alcance

- Backend Payload (colecciones, esquema, bloques, campo `featured`) — intacto.
- Diseño visual general del blog (se deja para una iteración posterior).
- Rutas/URLs del blog (se conservan).

## Arquitectura

Enfoque A aprobado: layout compartido + componente reutilizable, interacción
100% HTML nativa sin JS para la interacción (acordeones `<details>`).

### 1. Menú lateral (estructura y navegación)

**Nuevo componente `src/components/blog/BlogSidebar.astro`**

- Columna izquierda sticky (`w-64` aprox.).
- Contenido:
  1. **Navegación global**: enlace "Blog" (raíz, `/blog`) y "Todos los posts"
     (`/blog`). Estado activo según la página.
  2. **Tipos como acordeón** (`<details>`/`<summary>`): cabecera con icono +
     título + chevron. Al expandirse: categorías raíz del tipo y sus
     subcategorías indentadas. Se marca el tipo/categoría/subcategoría activo.
  3. **Etiquetas con contador**: lista de tags con badge del número de posts.
- **Móvil**: colapsado por defecto; toggle (checkbox + label) abre el menú como
  panel desplegable sobre el contenido.
- Props: `locale`, `activeTypeSlug`, `activeCategorySlug`, `activeSubcategorySlug`,
  `activeTag`.

**Nuevo layout `src/layouts/BlogListLayout.astro`**

- Envuelve `PageLayout`.
- Layout de 2 columnas en escritorio (sidebar + slot de contenido), 1 columna en
  móvil con el sidebar colapsable.
- Fetches (una sola vez por request):
  - `payload.postTypes().getAll(locale)`
  - `payload.categories().getRoots(locale)` + categorías hijas
  - `getPublishedPosts(locale)` (para contadores)

**Helpers nuevos en `src/lib/blog.ts`**

- Construcción del árbol tipos→categorías→subcategorías con conteos
  (`postsPerType`, `postsPerCategory`, `postsPerSubcategory`, `postsPerTag`)
  calculados en memoria desde `allPosts` y la estructura de categorías.

**Vistas refactorizadas** (usar `BlogListLayout`, quitar pestañas + nube del top):

- `src/components/blog/views/BlogIndexView.astro`
- `src/components/blog/views/BlogPageView.astro`
- `src/components/blog/views/BlogArchiveView.astro`
- `src/components/blog/views/BlogTagView.astro`

`BlogTypeTabs` deja de usarse en listados. `TagList` ya no se usa como nube en el
top (el sidebar lleva su propia lista con contador).

### 2. Funcionalidad

**Compartir — `src/components/blog/ShareButtons.astro`**

- Añadir:
  - WhatsApp: `https://wa.me/?text=<título>%20<url>`
  - Facebook: `https://www.facebook.com/sharer/sharer.php?u=<url>`
  - Telegram: `https://t.me/share/url?url=<url>&text=<título>`
- Mantener X, LinkedIn, Bluesky y copiar enlace. Iconos SVG inline como los
  actuales.

**Comentarios Giscus**

- `site.config.ts` → `articleFeatures.comments.enabled: true`.
- Mantener proveedor `giscus` y los placeholders actuales
  (`repo: 'owner/repo'`, `repoId`, `categoryId`) para que el cliente los rellene.
- `CommentsGiscus.astro` ya está listo y falla blando si la config está
  incompleta, así que la activación no rompe nada mientras no haya IDs.

**Feed RSS — `src/pages/rss.xml.ts`**

- Límite de posts: nueva constante `RSS_MAX_ITEMS` (por defecto 20), en
  `site.config.ts` (`blog.rssMaxItems`) con fallback.
- Items enriquecidos:
  - `<enclosure url length type>` con la imagen del post (`heroImage`) cuando exista.
  - `<category>` con postType, categoría y tags.
- **Feed por idioma**: nueva ruta `src/pages/[locale]/rss.xml.ts`. El `rss.xml`
  actual (default locale `es`) se mantiene. El feed localizado usa el locale del
  segmento.

**Suscripción por email — solo UI**

- Nuevo `src/components/blog/EmailSubscribeForm.astro`: input email + botón,
  `preventDefault`, sin backend. Se integra en las secciones CTA de los listados
  del blog (junto al RSS/social) y opcionalmente en el detalle.

### 3. Sección blog del home

- `src/components/blocks/ArchiveBlock.astro`: cuando `block.relationTo === 'posts'`,
  renderizar con `BlogCard` (estilo del blog) en lugar del `<a>` simple.
- Respetar `limit`, categorías y selección que configure el editor en Payload
  (sin cambios de esquema).
- Botón "Ver todos los artículos" (clave `home.blog.viewAll`) bajo la grilla,
  enlazando a `/blog`, solo cuando `relationTo === 'posts'`.
- Encabezado de la sección: sin cambios (sigue viniendo de `introContent` en
  Payload).

### 4. i18n

- Nuevas claves en `es.json`, `en.json` y `nl.json` (paridad):
  - sidebar: "Etiquetas", "Todos los posts"
  - suscripción email: label, placeholder, botón, confirmación
- Claves existentes del blog se conservan; `home.blog.viewAll` se reutiliza para
  el botón del home.

## Decisiones de implementación

- Interacción del sidebar sin JS: `<details>`/`<summary>` para acordeones y
  checkbox + label para el toggle móvil. Se respeta `prefers-reduced-motion`.
- Se reutilizan los design tokens y componentes UI del tema (Badge, Icon, etc.).
- El fetch de contadores usa `getPublishedPosts` ya existente; el sidebar se
  calcula en el servidor (SSR) — sin datos en cliente.

## Pruebas / verificación

- `pnpm build` en `website/` (astro check + schemas + link validation).
- Verificación manual SSR:
  - Landing `/blog`, `/blog/page/2`, un archivo de tipo, de categoría, de
    subcategoría y un tag: menú lateral presente, estados activos correctos.
  - Detalle `/blog/<slug>`: sin menú lateral (layout actual intacto).
  - Móvil: menú colapsado, toggle funcional.
  - Home: tarjetas estilo blog, botón "Ver todos" → `/blog`.
  - `/rss.xml` y `/en/rss.xml` (o `/<locale>/rss.xml`): límite y categorías.
  - Compartir: URLs de WhatsApp/Facebook/Telegram correctas.