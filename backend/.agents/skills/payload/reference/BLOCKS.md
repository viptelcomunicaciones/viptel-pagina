# Bloques de Contenido

11 bloques reutilizables disponibles en el CMS.

## Archive (`archive`)

**Usado en**: Pages (layout)
**Campos**:
- `introContent` — richText
- `populateBy` — select: collection / selection
- `relationTo` — select: posts / projects
- `categories` — relationship (condicional)
- `limit` — number
- `selectedDocs` — relationship (condicional, cuando populateBy = selection)

---

## Banner (`banner`)

**Usado en**: Posts (content, vía BlocksFeature en Lexical)
**Campos**:
- `style` — radio: info / warning / error / success
- `content` — richText, required

---

## CallToAction (`cta`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `richText` — Lexical
- `links` — linkGroup con appearances (max 2)

---

## Cards (`cards`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `heading` — text, localized
- `cards` — array de:
  - `icon` — upload/media
  - `title` — text, localized
  - `description` — textarea, localized
  - `linkUrl` — text

---

## Code (`code`)

**Usado en**: Posts (content, vía BlocksFeature en Lexical)
**Campos**:
- `language` — select: typescript / javascript / css
- `code` — code field, required

---

## Content (`content`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `columns` — array de:
  - `size` — select: oneThird / half / twoThirds / full
  - `richText` — Lexical
  - `enableLink` — checkbox
  - `link` — link field (condicional)

---

## FAQ (`faq`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `heading` — text, localized
- `items` — array de:
  - `question` — text, localized
  - `answer` — richText, localized

---

## Gallery (`gallery`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `heading` — text, localized
- `images` — array de:
  - `image` — upload/media
  - `alt` — text
  - `caption` — text, localized

---

## MediaBlock (`mediaBlock`)

**Usado en**: Pages (layout), Posts (content)
**Campos**:
- `media` — upload/media, required

---

## MediaContent (`media-content`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `heading` — text, localized
- `body` — richText, localized
- `image` — upload/media
- `imagePosition` — radio: left / right

---

## Pricing (`pricing`)

**Usado en**: Pages (layout), Services (layout)
**Campos**:
- `name` — text, localized
- `price` — number
- `currency` — text (COP)
- `interval` — radio: one-time / monthly
- `features` — array de strings
- `linkText` — text
- `linkUrl` — text
