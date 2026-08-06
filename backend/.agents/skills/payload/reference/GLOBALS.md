# Globals

Dos globals configurados en el CMS.

## Header (`header`)

**Archivo**: `src/Header/config.ts`
**Acceso**: Público (`() => true`)

### Campos

| Campo | Tipo | Localizado |
|---|---|---|
| `navItems` | array (max 6 rows) | Sí |

Cada `navItem` es un `link` field (reference o custom URL) con:
- `type` — radio: internal link / custom URL
- `label` — text
- `newTab` — checkbox (solo custom URL)
- `url` — text (solo custom URL)

**Row label**: "Nav item {N}: {label}"

---

## Footer (`footer`)

**Archivo**: `src/Footer/config.ts`
**Acceso**: Público

### Campos

| Campo | Tipo | Localizado |
|---|---|---|
| `navItems` | array (max 6) | Sí |

Idéntica estructura al Header.

**Row label**: Mismo formato que Header.

---

## Cómo se consumen en el website

Los layouts del website (`BaseLayout.astro`) obtienen Header y Footer en cada request:

```typescript
const headerRes = await fetch(`${PAYLOAD_URL}/api/globals/header?locale=${locale}`)
const header = await headerRes.json()

const footerRes = await fetch(`${PAYLOAD_URL}/api/globals/footer?locale=${locale}`)
const footer = await footerRes.json()
```

Esto permite que los menús de navegación sean editables desde el CMS sin tocar código.

---

## Añadir un nuevo global

```typescript
// En payload.config.ts, dentro de globals: []
{
  slug: 'settings',
  access: { read: () => true },
  fields: [
    { name: 'siteTitle', type: 'text' },
    { name: 'siteDescription', type: 'textarea' },
  ],
}
```

El endpoint será `GET /api/globals/settings`.
