# Colecciones

## Users (`users`)

**Archivo**: `src/collections/Users/index.ts`
**Admin group**: "Admin"
**Auth**: Email/password + API key (`useAPIKey: true`)

| Campo | Tipo | Requerido |
|---|---|---|
| `name` | text | No |
| `email` | email (auth) | Sí |

**Acceso**: Todas las operaciones requieren `authenticated`.
**Timestamps**: Activados.

La API key permite crear un service account que el website usa para acceder a drafts.

---

## Media (`media`)

**Archivo**: `src/collections/Media.ts`
**Acceso**: Create/delete/update → authenticated; Read → anyone

**Upload config**:
- Static dir: `public/media` (o `MEDIA_PATH` env)
- Focal point: enabled
- Folders: enabled

**Image sizes**:

| Nombre | Width | Height | Notas |
|---|---|---|---|
| thumbnail | 300 | — | Admin thumbnail |
| square | 500 | 500 | — |
| small | 600 | — | — |
| medium | 900 | — | — |
| large | 1400 | — | — |
| xlarge | 1920 | — | — |
| og | 1200 | 630 | crop: center |

**Campos**:
- `alt` — text, required
- `caption` — richText (Lexical)

---

## Categories (`categories`)

**Archivo**: `src/collections/Categories.ts`
**Admin group**: "Content"
**Acceso**: Create/delete/update → authenticated; Read → anyone

| Campo | Tipo | Localizado |
|---|---|---|
| `title` | text | Sí |
| `slug` | text (auto-generated) | No |

**Use as title**: `title`

---

## Pages (`pages`)

**Archivo**: `src/collections/Pages/index.ts`
**Admin group**: "Content"
**Acceso**: Read → `authenticatedOrPublished`; Write → authenticated
**Versiones**: Drafts (autosave 100ms, schedulePublish, max 50 versions)
**Live preview**: Apunta al frontend Astro
**Default populate**: `title`, `slug`

### Tabs

**Hero**:
- `type` — select: none, highImpact, mediumImpact, lowImpact
- `richText` — Lexical (condicional: highImpact/mediumImpact)
- `links` — linkGroup (max 2)
- `media` — upload (condicional: highImpact/mediumImpact)

**Content**:
- `layout` — blocks, localized, required
  - Bloques disponibles: CallToAction, Content, MediaBlock, Archive, Cards, Pricing, FAQ, Gallery, MediaContent

**SEO**:
- Meta title, image, description con overview/preview panels

### Sidebar
- `publishedAt` — date
- `slug` — auto-generated

**Hooks**: `beforeChange` → `populatePublishedAt`
**Plugin**: `nested-docs` — jerarquía padre/hijo con breadcrumbs

---

## Posts (`posts`)

**Archivo**: `src/collections/Posts/index.ts`
**Admin group**: "Content"
**Acceso**: Read → `authenticatedOrPublished`
**Versiones**: Drafts (autosave 100ms, schedulePublish, max 50)
**Default populate**: `title`, `slug`, `categories`, `meta.image`, `meta.description`

### Tabs

**Content**:
- `heroImage` — upload/media
- `content` — richText (Lexical), localized, required
  - Features: HeadingFeature (h1-h4), BlocksFeature (Banner, Code, MediaBlock), FixedToolbar, InlineToolbar, HorizontalRule

**Meta**:
- `excerpt` — textarea, localized
- `relatedPosts` — relationship a posts (hasMany, filtrado para excluir self)
- `categories` — relationship a categories (hasMany, sidebar)

**SEO**:
- Meta title, image, description

### Sidebar
- `publishedAt` — date con day+time picker, auto-set a `new Date()` al publicar
- `authors` — relationship a users (hasMany)
- `populatedAuthors` — array (disabled, readonly, hidden) — expone nombres de autores
- `tags` — array de `{ tag: text }`

**Hooks**: `afterRead` → `populateAuthors` (copia nombres de users a `populatedAuthors`)

---

## Projects (`projects`)

**Archivo**: `src/collections/Projects/index.ts`
**Admin group**: "Content"
**Acceso**: Read → `authenticatedOrPublished`
**Versiones**: Drafts (autosave 100ms, schedulePublish, max 50)
**Default columns**: title, client, year, _status
**Default populate**: `title`, `slug`

### Tabs

**Content**:
- `description` — textarea, localized
- `coverImage` — upload/media
- `content` — richText (Lexical), localized
- `gallery` — array de `{ image: upload/media, alt: text }`

**Meta**:
- `client` — text (sidebar)
- `year` — number (sidebar)
- `tags` — array de `{ tag: text }` (sidebar)

**SEO**:
- Meta title, image, description

### Sidebar
- `publishedAt` — date
- `slug` — auto-generated

**Hooks**: `beforeChange` → `populatePublishedAt`

---

## Services (`services`)

**Archivo**: `src/collections/Services/index.ts`
**Admin group**: "Content"
**Acceso**: Read → `authenticatedOrPublished`
**Versiones**: Drafts (autosave 100ms, schedulePublish, max 50)
**Default columns**: title, parent, _status
**Default populate**: `title`, `slug`

### Estructura jerárquica
- `parent` — relationship a services (self-referencing)
- Servicios sin `parent` son categorías (top-level)
- Servicios con `parent` son sub-servicios

Servicios de ejemplo: `viptel-pbx` → `basica`, `avanzada`

### Campos principales
- `title` — text, localized, required
- `slug` — auto-generated
- `shortDescription` — textarea, localized
- `icon` — upload/media

### Tabs

**Content**:
- `description` — richText, localized
- `features` — array, localized: `{ title (text, localized), description (textarea, localized), icon (upload/media) }`
- `pricing` — array, localized: `{ planName (text, localized), price (number), currency (text, default COP), period (text, default /mes), features (array de strings), highlighted (checkbox), ctaLabel (text, localized) }`
- `faq` — array, localized: `{ question (text, localized), answer (richText, localized) }`
- `gallery` — array: `{ image (upload/media), alt (text) }`
- `layout` — blocks, localized: CallToAction, Content, FAQ, Gallery, Pricing, Cards, MediaContent

**SEO**:
- Meta title, image, description

### Sidebar
- `publishedAt` — date
- `parent` — self-relationship

**Hooks**: `beforeChange` → `populatePublishedAt`
