# Hooks

## `populatePublishedAt`

**Archivo**: `src/hooks/populatePublishedAt.ts`

Hook `beforeChange` que auto-asigna `publishedAt` cuando un documento cambia a estado `published`.

```typescript
export const populatePublishedAt = ({ data, operation }) => {
  if (operation === 'create' || operation === 'update') {
    if (data._status === 'published' && !data.publishedAt) {
      return { ...data, publishedAt: new Date() }
    }
  }
  return data
}
```

**Usado en**: Pages, Posts, Projects, Services.

---

## `populateAuthors`

**Archivo**: `src/collections/Posts/hooks/populateAuthors.ts`

Hook `afterRead` que copia los nombres de los autores a `populatedAuthors` para exponerlos públicamente sin exponer datos completos de usuario.

```typescript
export const populateAuthors = async ({ doc, req: { payload } }) => {
  if (doc?.authors) {
    const authorDocs = await payload.find({
      collection: 'users',
      where: { id: { in: doc.authors } },
    })
    // Copia name a populatedAuthors
  }
  return doc
}
```

**Usado en**: Posts (afterRead).

**Motivo**: `authors` es una relación a Users pero los datos de usuario no son públicos. `populatedAuthors` es un array plano de `{ name: string }` que se expone en la API pública.
