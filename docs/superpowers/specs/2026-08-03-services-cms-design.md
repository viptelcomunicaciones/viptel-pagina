# Services CMS + Dropdown Nav + Tienda Externa — Design Spec

**Fecha:** 2026-08-03
**Proyecto:** Viptel Comunicaciones
**Estado:** Aprobado

---

## 1. Objetivo

Implementar la estructura completa del sitio según el árbol definido:

```
Home
├── Portfolio  → /projects (existente, sin cambios)
├── About us   → /about (estático i18n, sin cambios)
├── Contact us → /contact (estático i18n, sin cambios)
├── Services   → /services (NUEVO desde CMS)
│   ├── Viptel-PBX → Básica, Avanzada
│   ├── Viptel-Voip → Minutos, DID
│   ├── Viptel-Web → Sitio Informativo, Sitio Corporativo, Tienda Básica, Tienda Avanzada
│   ├── Viptel-Marketing → Email Masivo, Whatsapp Masivo, SMS Masivo, Audio Masivo
│   └── Viptel-Software → ERP, CRM
├── Blog → /blog (existente, sin cambios)
└── Shopping → enlace externo a tienda (NUEVO)
```

---

## 2. Backend — Colección `services`

### 2.1 Archivo
`backend/src/collections/Services/index.ts`

### 2.2 Campos

| Nombre | Tipo | Localizado | Obligatorio | Descripción |
|---|---|---|---|---|
| `title` | text | ✅ | ✅ | Nombre del servicio |
| `slug` | text | ✅ | — | autogenerado desde title, validado único por locale |
| `parent` | relationship (services) | — | — | Servicio padre. null=categoría, valor=sub-servicio |
| `shortDescription` | textarea | ✅ | — | 1-2 frases para cards y listados |
| `description` | richText | ✅ | — | Descripción completa (editor Lexical) |
| `icon` | upload (Media) | — | — | Icono representativo |
| `features` | array | ✅ | — | `{ title, description, icon? (upload) }` |
| `pricing` | array | ✅ | — | `{ planName, price (number), currency, period, features[], highlighted (bool), ctaLabel }` |
| `faq` | array | ✅ | — | `{ question, answer (richText) }` |
| `gallery` | array (upload) | — | — | Imágenes del servicio |
| `layout` | blocks | — | — | Page builder opcional. Bloques: CTA, FAQ, Gallery, Pricing, Cards, MediaContent, Content |
| `meta` | group (SEO tab) | ✅ | — | `{ title, description, image }` |

### 2.3 Configuración de la colección
- `slug: 'services'`, `admin.group: 'Content'`, `admin.useAsTitle: 'title'`
- `versions: { drafts: { autosave: true }, maxPerDoc: 20 }`
- Acceso: `read: authenticatedOrPublished`, `create/update/delete: authenticated`
- Hook `populatePublishedAt`
- `admin.livePreview` URL: `${FRONTEND_URL}/api/preview?path=/services/{slug}&secret=...`
- Plugin SEO activo: `generateURL` → `FRONTEND_URL/services/{slug}`, `generateTitle` → `{title} — Viptel`
- Admin UI: filtro por parent en vista de lista, columna parent visible

### 2.4 Cambios en otros archivos backend

| Archivo | Cambio |
|---|---|
| `payload.config.ts` | `collections: [..., Services]`, `plugins: [..., seo({ collections: ['pages','posts','projects','services'] })]` |
| `fields/link.ts` | `relationTo: ['pages', 'posts', 'services']` |
| `scripts/seed.ts` | Agregar seed de services (5 categorías + 14 sub-servicios es+en) |

---

## 3. Website — Capa de datos

### 3.1 Nuevas funciones en `website/src/lib/payload.ts`

```ts
getServiceCategories(locale = 'es')     // where[parent][exists]=false
getServicesByParent(parentId, locale)   // where[parent][equals]=parentId
getServiceBySlug(slug, locale, draft?)  // where[slug][equals]=slug
getAllServices(locale = 'es')           // todos, sin filtro de parent
```

Uso de `fetchAPI()` con `depth=2`, timeout 15s, try/catch fallback, soporte draft.

### 3.2 Tipos
`website/src/lib/payload-types.ts` — copiado del backend tras regenerar.

### 3.3 Sin cambios
`blog.ts`, `projects.ts`, `stack.ts`.

---

## 4. Website — Rutas

### 4.1 Archivos

| Archivo | Acción | URL resultante |
|---|---|---|
| `services.astro` (raíz) | Renombrar a `.astro.bak`, crear nuevo | `GET /services` |
| `[locale]/services.astro` | Renombrar a `.astro.bak`, crear nuevo | `GET /en/services` |
| `services/[...slug].astro` | NUEVO | `GET /services/viptel-pbx/basica` |
| `[locale]/services/[...slug].astro` | NUEVO | `GET /en/services/viptel-pbx/basica` |
| `components/pages/views/ServicesView.astro` | Renombrar a `.astro.bak` | — |

### 4.2 Lógica de rutas

- `services.astro` → `getServiceCategories(locale)` → renderiza `ServicesOverviewView`
- `services/[...slug].astro` → extrae slug (1 o 2 segmentos) → `getServiceBySlug(slug, locale)`:
  - Si `parent === null` → es categoría. Busca `getServicesByParent(id, locale)` y renderiza con lista de hijos
  - Si `parent !== null` → es sub-servicio. Renderiza detalle completo
- Devuelve 404 si no encuentra el servicio
- Las rutas usan `export const prerender = false` (SSR dinámico)

---

## 5. Website — Componentes nuevos

```
src/components/services/
├── ServiceCard.astro            Card individual (icono, título, descripción, link)
├── ServiceGrid.astro            Grid responsive de ServiceCard (2-3 cols)
├── ServiceFeatures.astro        Lista features con icono + título + descripción
├── ServicePricing.astro         Tabla de planes con highlight del destacado
├── ServiceFAQ.astro             Acordeón FAQ
├── ServiceGallery.astro         Galería de imágenes (grilla responsive)
├── ServiceBreadcrumb.astro      Migas: Servicios > Categoría > Sub-servicio
└── ServiceDetailLayout.astro    Layout wrapper con breadcrumb + secciones ordenadas

src/components/pages/views/
├── ServicesView.astro            → ServicesView.astro.bak (backup)
├── ServicesOverviewView.astro    NUEVO — overview /services con grid de categorías + CTA
└── ServiceView.astro             NUEVO — categoría o sub-servicio según parent
```

### 5.1 Jerarquía de renderizado de `ServiceView.astro`

```
ServiceDetailLayout
├── ServiceBreadcrumb
├── Hero (título + shortDescription)
├── ServiceFeatures (si features no vacío)
├── ServicePricing (si pricing no vacío)
├── ServiceFAQ (si faq no vacío)
├── ServiceGallery (si gallery no vacío)
├── BlockRenderer (si layout no vacío)
├── Si es categoría: ServiceGrid con sub-servicios hijos
└── CTA "Solicitar cotización" → /contact
```

---

## 6. Website — Navegación

### 6.1 `nav.config.ts`

- `NavItem` gana campo opcional `children?: NavItem[]`
- Item "Servicios" gana `children` con las 5 categorías
- Nuevo item "Tienda" con `external: true`, `href: 'https://tienda.viptelcomunicaciones.com'`

```ts
export const navItems: NavItem[] = [
  { label: 'Inicio',     href: '/',            order: 0 },
  { label: 'Servicios',  href: '/services',    order: 1, children: [
      { label: 'Viptel-PBX', href: '/services/viptel-pbx', order: 0 },
      { label: 'Viptel-Voip', href: '/services/viptel-voip', order: 1 },
      { label: 'Viptel-Web', href: '/services/viptel-web', order: 2 },
      { label: 'Viptel-Marketing', href: '/services/viptel-marketing', order: 3 },
      { label: 'Viptel-Software', href: '/services/viptel-software', order: 4 },
  ]},
  { label: 'Portafolio', href: '/projects',     order: 2 },
  { label: 'Blog',       href: '/blog',         order: 3 },
  { label: 'Nosotros',   href: '/about',        order: 4 },
  { label: 'Contacto',   href: '/contact',      order: 5 },
  { label: 'Tienda',     href: 'https://tienda.viptelcomunicaciones.com', external: true, order: 6 },
];
```

- Footer: misma lista (sin children — plano)
- `resolveNavItem` se extiende para manejar `children` recursivamente

### 6.2 `Header.astro`

Lógica de renderizado (reemplaza loop de nav actual en línea ~262):

```
Si item.children existe:
  → <button> con flecha ▼ + panel dropdown con <a> hijos
  → Click en botón: navega a item.href (/services overview)
  → Hover: abre dropdown
  → Accesibilidad: aria-haspopup="true", aria-expanded, teclado Enter/Escape
  → Mobile: sección expandible dentro del menú móvil existente

Si item.external:
  → <a> con target="_blank", rel="noopener noreferrer", icono arrow-up-right

Si item normal:
  → <a> igual que ahora
```

---

## 7. Website — i18n

### 7.1 Nuevas claves en `es.json` y `en.json`

```json
{
  "nav": { "items": { "shop": "Tienda" } },
  "services": {
    "breadcrumb": {
      "home": "Inicio",
      "services": "Servicios"
    },
    "overview": {
      "hero": {
        "badge": "Servicios",
        "title": "Soluciones empresariales",
        "description": "Telecomunicaciones, desarrollo web, marketing digital y software a la medida."
      },
      "cta": {
        "title": "¿Listo para empezar?",
        "description": "Cuéntanos tu proyecto y te ayudamos a encontrar la solución ideal.",
        "button": "Contáctanos"
      }
    },
    "detail": {
      "features": "Características",
      "pricing": "Planes y precios",
      "faq": "Preguntas frecuentes",
      "gallery": "Galería",
      "cta": "Solicitar cotización",
      "subServices": "Servicios incluidos"
    },
    "pricing": {
      "currency": "COP",
      "period": "/mes",
      "highlighted": "Recomendado",
      "cta": "Contratar"
    }
  }
}
```

---

## 8. Orden de ejecución

| Fase | Paso | Archivos |
|---|---|---|
| 1 | Crear colección `Services` en backend | `collections/Services/index.ts`, `payload.config.ts` |
| 2 | Actualizar `link.ts` + regenerar tipos + seed | `fields/link.ts`, `seed.ts`, `pnpm payload generate:types` |
| 3 | Copiar payload-types al website | `website/src/lib/payload-types.ts` |
| 4 | Funciones de datos en payload.ts | `website/src/lib/payload.ts` |
| 5 | Componentes de servicio (8 archivos) | `src/components/services/*.astro` |
| 6 | Vistas ServicesOverviewView + ServiceView | `src/components/pages/views/` |
| 7 | Rutas services.astro + services/[...slug].astro | `src/pages/services*`, `src/pages/[locale]/services*` |
| 8 | Dropdown en Header.astro | `src/components/layout/Header.astro` |
| 9 | nav.config.ts + i18n es.json/en.json | `src/config/nav.config.ts`, `src/i18n/*.json` |
| 10 | Backup de archivos viejos (.bak) | `ServicesView.astro`, rutas services viejas |
| 11 | Verificación: `pnpm build` + tests + browser | — |

---

## 9. No se toca

- Colección `pages` (Pages, nested-docs) — intacta
- Colección `posts` (Blog) — intacta
- Colección `projects` (Portfolio) — intacta
- Colección `categories` — intacta
- Pages `/about`, `/contact` — estáticas i18n, intactas
- Componentes de blog, proyectos, layout (salvo Header) — intactos
- `site.config.ts`, `consent.config.ts`, `schema.ts` — intactos
