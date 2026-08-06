# Campos Personalizados

Campos reutilizables definidos en `src/fields/`.

## `defaultLexical`

**Archivo**: `src/fields/defaultLexical.ts`

Configuración por defecto del editor Lexical:
- HeadingFeature: h1, h2, h3, h4
- BlocksFeature: Banner, Code, MediaBlock
- FixedToolbar
- InlineToolbar
- HorizontalRule

Usado en la mayoría de campos richText del proyecto.

---

## `link`

**Archivo**: `src/fields/link.ts`

Campo de enlace con dos opciones:
- **reference**: Seleccionar una página/servicio existente
- **custom**: URL personalizada con opción de nueva pestaña

```typescript
{
  type: 'row',
  fields: [
    {
      name: 'type',
      type: 'radio',
      options: [
        { label: 'Enlace interno', value: 'reference' },
        { label: 'URL personalizada', value: 'custom' },
      ],
    },
    // ... reference field (pages, services) o custom URL field
  ],
}
```

---

## `linkGroup`

**Archivo**: `src/fields/linkGroup.ts`

Grupo de enlaces con configuraciones adicionales:
- `appearance` — select: default, primary, secondary, outline
- Array de `link` fields

Usado en: Header navItems, Footer navItems, Hero links, CallToAction links.

---

## `seoTab`

**Archivo**: `src/fields/seoTab.ts`

Tab de SEO con:
- `meta.title` — MetaTitleField con generateFn: `Viptel — {doc.title}`
- `meta.image` — MetaImageField
- `meta.description` — MetaDescriptionField
- OverviewField + PreviewField

Usado en: Pages, Posts, Projects, Services.
