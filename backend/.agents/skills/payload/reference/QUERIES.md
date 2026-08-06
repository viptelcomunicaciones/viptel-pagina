# Patrones de Query

Cómo el website consulta la API de Payload. Implementado en `website/src/lib/payload.ts`.

## Fetch wrapper

Todas las requests pasan por `fetchAPI<T>(endpoint, { locale, draft? })`:

```typescript
const fetchAPI = async <T>(endpoint: string, options?: FetchOptions) => {
  const url = new URL(`${PAYLOAD_URL}/api/${endpoint}`)
  url.searchParams.set('locale', locale)
  url.searchParams.set('depth', '2')

  const headers: HeadersInit = {}
  if (draft) {
    headers.Authorization = `users API-Key ${PAYLOAD_API_KEY}`
  }

  const res = await fetch(url.toString(), {
    headers,
    signal: AbortSignal.timeout(15000),
  })
  return res.json() as Promise<DocsResponse<T>>
}
```

**Características**:
- Timeout de 15 segundos
- `depth=2` en todas las requests (resuelve relaciones hasta 2 niveles)
- `locale` siempre presente
- `Authorization` header solo cuando `draft=true`

## Tipos de respuesta

```typescript
interface DocsResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
```

## Queries por colección

### Pages
```typescript
getPageBySlug(slug, locale, draft?)
// GET /api/pages?locale=es&depth=2&where[slug][equals]=home

getPages(locale)
// GET /api/pages?locale=es&depth=2
```

### Posts
```typescript
getPosts(locale, page, limit, draft?)
// GET /api/posts?locale=es&depth=2&sort=-publishedAt&page=1&limit=12
//      &where[_status][equals]=published

getAllPosts(locale)
// GET /api/posts?locale=es&depth=2&limit=100

getPostsByTag(tag, locale, page, limit)
// GET /api/posts?locale=es&depth=2&where[tags.tag][equals]=voip&page=1&limit=12

getPostBySlug(slug, locale, draft?)
// GET /api/posts?locale=es&depth=2&where[slug][equals]=pbx-en-la-nube
```

### Projects
```typescript
getProjects(locale, page, limit)
// GET /api/projects?locale=es&depth=2&sort=-year&page=1&limit=12

getAllProjects(locale)
// GET /api/projects?locale=es&depth=2&limit=100

getProjectsByTag(tag, locale, page, limit)
// GET /api/projects?locale=es&depth=2&where[tags.tag][equals]=redes

getProjectBySlug(slug, locale, draft?)
// GET /api/projects?locale=es&depth=2&where[slug][equals]=red-corporativa
```

### Services
```typescript
getServiceCategories(locale)
// GET /api/services?locale=es&depth=2&where[parent][exists]=false
// Devuelve solo servicios top-level (categorías)

getServicesByParent(parentId, locale)
// GET /api/services?locale=es&depth=2&where[parent][equals]=ID

getServiceBySlug(slug, locale, draft?)
// GET /api/services?locale=es&depth=2&where[slug][equals]=viptel-pbx

getAllServices(locale)
// GET /api/services?locale=es&depth=2&limit=100
```

### Redirects
```typescript
getRedirect(from)
// GET /api/redirects?where[from][equals]=/old-page
```

### Globals
```typescript
// Header y Footer se consultan directamente en los layouts:
fetch(`${PAYLOAD_URL}/api/globals/header?locale=${locale}`)
fetch(`${PAYLOAD_URL}/api/globals/footer?locale=${locale}`)
```

### Media
```typescript
resolveMediaUrl(url)
// Si es relativa → prepend PAYLOAD_URL
// Si es absoluta → devolver tal cual
```

## Filtros comunes

| Filtro | Sintaxis | Ejemplo |
|---|---|---|
| Igual | `where[field][equals]` | `where[slug][equals]=home` |
| No existe | `where[field][exists]` | `where[parent][exists]=false` |
| En array | `where[field][in]` | `where[id][in]=1,2,3` |
| Estado | `where[_status][equals]` | `where[_status][equals]=published` |
| Tag en array | `where[tags.tag][equals]` | `where[tags.tag][equals]=voip` |

## Draft mode

El website detecta drafts vía:
1. Cookie `__prv` (seteada por `/api/preview`)
2. Pasa `draft=true` a `fetchAPI`
3. `fetchAPI` añade header `Authorization: users API-Key {key}`
4. Backend ejecuta `authenticatedOrPublished` → user=true vía API key → devuelve draft
