# Task 2: Backend — Register collection, update plugins and link field

## Files
- Modify: `backend/src/payload.config.ts:11,63`
- Modify: `backend/src/plugins/index.ts:7,11,15`
- Modify: `backend/src/fields/link.ts:78`

## Requirements

### 1. payload.config.ts

Add import after Projects import (line 12):
```ts
import { Services } from './collections/Services'
```

Change line 63 from:
```ts
collections: [Pages, Posts, Projects, Media, Categories, Users],
```
to:
```ts
collections: [Pages, Posts, Projects, Services, Media, Categories, Users],
```

### 2. plugins/index.ts

Change line 7 type import from:
```ts
import type { Page, Post, Project } from '@/payload-types'
```
to:
```ts
import type { Page, Post, Project, Service } from '@/payload-types'
```
NOTE: If `Service` is not yet in payload-types (types haven't been regenerated yet), skip this import update — only update generateURL. The types will be regenerated in Task 3.

Change the generateURL function (line 15) from:
```ts
const generateURL: GenerateURL<Post | Page | Project> = ({ doc }) => {
  const url = getFrontendURL()
  return doc?.slug ? `${url}/${doc.slug}` : url
}
```
to:
```ts
const generateURL: GenerateURL<Post | Page | Project> = ({ doc, collection }) => {
  const url = getFrontendURL()
  if (collection === 'services') return doc?.slug ? `${url}/services/${doc.slug}` : url
  return doc?.slug ? `${url}/${doc.slug}` : url
}
```

### 3. fields/link.ts

Change line 78 from:
```ts
relationTo: ['pages', 'posts'],
```
to:
```ts
relationTo: ['pages', 'posts', 'services'],
```

## Verification
Run: `pnpm --filter ./backend run build`
Expected: Compiles successfully. `pnpm --filter ./backend run test:int` — 5/5 pass.
