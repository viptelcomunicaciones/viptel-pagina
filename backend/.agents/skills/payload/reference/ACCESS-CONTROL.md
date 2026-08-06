# Access Control

Tres funciones de control de acceso en `src/access/`.

## `anyone`

**Archivo**: `src/access/anyone.ts`

```typescript
export const anyone = () => true
```

Siempre permite acceso. Usado en:
- Media — read (las imágenes son públicas)

---

## `authenticated`

**Archivo**: `src/access/authenticated.ts`

```typescript
export const authenticated = ({ req: { user } }) => Boolean(user)
```

Solo permite acceso si hay un usuario autenticado. Usado en:
- Users — todas las operaciones
- Media — create, delete, update
- Todas las colecciones de contenido — create, delete, update

---

## `authenticatedOrPublished`

**Archivo**: `src/access/authenticatedOrPublished.ts`

```typescript
export const authenticatedOrPublished = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
```

- Si hay usuario autenticado → acceso total (incluye drafts)
- Si no hay usuario → solo documentos con `_status: 'published'`

Usado en:
- Pages — read
- Posts — read
- Projects — read
- Services — read

---

## Cómo funciona con el website

1. **Usuario público** (sin auth) → REST API solo devuelve documentos publicados
2. **Service account** (con API key) → REST API puede ver drafts con `?draft=true`
3. **Preview mode** → El website usa `PREVIEW_SECRET` cookie + API key para obtener drafts
4. **Admin** → Acceso total desde el panel de administración

### Flujo de preview

```
Payload Admin → Click "Preview" → Abre FRONTEND_URL/api/preview?secret=PREVIEW_SECRET&path=/slug
→ Astro valida secret → Setea cookie __prv
→ Página Astro detecta cookie → fetchAPI con draft=true + API key header
→ Payload devuelve el draft (authenticatedOrPublished: user=true vía API key)
```
