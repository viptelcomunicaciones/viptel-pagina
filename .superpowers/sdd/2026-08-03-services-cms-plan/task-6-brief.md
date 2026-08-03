# Task 6: Website — Service data functions in payload.ts

## Files
- Modify: `website/src/lib/payload.ts`

## Requirements

### 1. Add Service import
Change line 1 from:
```ts
import type { Page, Post, Project, Redirect } from './payload-types'
```
to:
```ts
import type { Page, Post, Project, Redirect, Service } from './payload-types'
```

### 2. Add service functions
Add this block before the `// ── Redirects ──` section:

```ts
// ── Services ───────────────────────────────────────────

export async function getServiceCategories(
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[parent][exists]=false&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getServicesByParent(
  parentId: string,
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[parent][equals]=${encodeURIComponent(parentId)}&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}

export async function getServiceBySlug(
  slug: string,
  locale = defaultLocale,
  draft = false,
): Promise<Service | null> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?where[slug][equals]=${encodeURIComponent(slug)}`,
    { locale, draft },
  )
  return data.docs?.[0] ?? null
}

export async function getAllServices(
  locale = defaultLocale,
): Promise<Service[]> {
  const data = await fetchAPI<DocsResponse<Service>>(
    `services?limit=100&where[_status][equals]=published`,
    { locale },
  )
  return data.docs ?? []
}
```

### 3. Update exports line
Change:
```ts
export type { DocsResponse, Page, Post, Project }
```
to:
```ts
export type { DocsResponse, Page, Post, Project, Service }
```

## Verification
Build: `pnpm --filter ./website run build` (must pass)
