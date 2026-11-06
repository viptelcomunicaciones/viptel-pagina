# Plan de Implementacion: SiteSettings, Footer y Subvariantes de Header

> Para agentes: Usar `subagent-driven-development` o `executing-plans` para ejecutar este plan tarea por tarea. Cada paso usa sintaxis de casillas (`- [ ]`).

## Resumen del proyecto

Este plan centraliza la configuracion del sitio en Payload CMS, conecta los estilos del header y footer con el frontend de Astro, y genera la migracion requerida para PostgreSQL en Dokploy.

Componentes involucrados:
1. Global `SiteSettings`: nombre del sitio, descripcion, telefonos, email, direccion y redes sociales.
2. Global `Footer`: selector de layout (`centered`, `columns`, `simple`, `stacked`, `minimal`), selector de fondo (`default`, `secondary`, `invert`), columnas y grupos de enlaces.
3. Coleccion `Pages`: campo condicional `floatingVariant` para el header cuando `headerStyle` es `floating`.
4. Layouts de Astro: lectura de estas propiedades desde `payload-client`.
5. Migracion en Postgres: generacion del archivo de migracion antes de fusionar a produccion.

---

## Archivos afectados

| Archivo | Accion | Proposito |
|---|---|---|
| `backend/src/SiteSettings/config.ts` | Crear | Definicion de la configuracion global del sitio en Payload CMS |
| `backend/src/Footer/config.ts` | Modificar | Agregar selectores de layout, background, columnas y linkGroups |
| `backend/src/collections/Pages/index.ts` | Modificar | Agregar el selector condicional `floatingVariant` |
| `backend/src/payload.config.ts` | Modificar | Registrar la global `SiteSettings` en el array `globals` |
| `website/src/lib/payload-types.ts` | Modificar | Actualizar interfaces de TypeScript (`Page`, `Footer`, `SiteSettings`) |
| `website/src/lib/payload-client.ts` | Modificar | Agregar metodo para consultar `payload.globals().getSiteSettings()` |
| `website/src/components/layout/Header.astro` | Modificar | Recibir y aplicar `floatingVariant` |
| `website/src/components/layout/Footer.astro` | Modificar | Leer `layout`, `background`, `columns` y `linkGroups` desde el CMS |
| `website/src/layouts/LandingLayout.astro` | Modificar | Pasar `floatingVariant` y fondo de footer a los componentes |
| `website/src/layouts/PageLayout.astro` | Modificar | Pasar `floatingVariant` y fondo de footer a los componentes |
| `backend/src/migrations/` | Crear archivo | Migracion generada con el comando de Payload |

---

## Tareas de implementacion

### Tarea 1: Crear Global SiteSettings en el Backend

- [ ] Paso 1.1: Crear el archivo `backend/src/SiteSettings/config.ts` con campos:
  - `name`: texto localizado requerido.
  - `description`: textarea localizado.
  - `email`: email de contacto general.
  - `phone`: telefono de contacto.
  - `socialLinks`: array con `platform` (select) y `url` (text).
- [ ] Paso 1.2: En `backend/src/payload.config.ts`, importar `SiteSettings` y agregarlo al array `globals: [Header, Footer, SiteSettings]`.
- [ ] Paso 1.3: Probar compilacion del backend con `pnpm --filter ./backend build`.

### Tarea 2: Actualizar Global Footer en el Backend

- [ ] Paso 2.1: En `backend/src/Footer/config.ts`, agregar pestañas:
  - Pestaña Layout: campo `layout` (select: `centered`, `columns`, `simple`, `stacked`, `minimal`), campo `background` (select: `default`, `secondary`, `invert`), campo `columns` (select: `2`, `3`, `4`, visible solo cuando `layout === 'columns'`), campo `tagline` (texto localizado).
  - Pestaña Content: campo `navItems` (array de links), campo `linkGroups` (array con `title` y `links`, visible solo cuando `layout === 'columns'`).
  - Pestaña Legal: campo `showCopyright` (checkbox), campo `copyright` (texto localizado), campo `legalLinks` (array de links).
- [ ] Paso 2.2: Verificar tipos en backend con `pnpm --filter ./backend build`.

### Tarea 3: Agregar floatingVariant a Pages en el Backend

- [ ] Paso 3.1: En `backend/src/collections/Pages/index.ts`, ubicar el campo `headerStyle`.
- [ ] Paso 3.2: Justo debajo de `headerStyle`, agregar:
  ```typescript
  {
    name: 'floatingVariant',
    type: 'select',
    defaultValue: 'transparent',
    label: 'Variante de Capsula Flotante',
    options: [
      { label: 'Vidrio translucido (transparent)', value: 'transparent' },
      { label: 'Desenfoque suave (default)', value: 'default' },
      { label: 'Solida opaca (solid)', value: 'solid' },
    ],
    admin: {
      condition: (data) => data?.headerStyle === 'floating',
      description: 'Acabado visual de la capsula flotante.',
    },
  }
  ```
- [ ] Paso 3.3: Compilar backend con `pnpm --filter ./backend build`.

### Tarea 4: Generar la migracion de base de datos para Produccion

- [ ] Paso 4.1: Ejecutar el comando oficial de migracion de Payload:
  ```bash
  pnpm --filter ./backend payload migrate:create add_site_settings_footer_and_floating
  ```
- [ ] Paso 4.2: Confirmar que se creo el archivo `.ts` y `.json` en `backend/src/migrations/`.
- [ ] Paso 4.3: Revisar el archivo generado para verificar que las sentencias `ALTER TABLE` agreguen las columnas sin eliminar datos existentes.

### Tarea 5: Actualizar el cliente y tipos en el Website Frontend

- [ ] Paso 5.1: En `website/src/lib/payload-types.ts`, incorporar los tipos de `SiteSettings`, los nuevos campos de `Footer` y `floatingVariant` en `Page`.
- [ ] Paso 5.2: En `website/src/lib/payload-client.ts`, agregar el metodo `getSiteSettings()` dentro del cliente de globales.
- [ ] Paso 5.3: Probar que no existan errores de tipos con `pnpm --filter ./website check`.

### Tarea 6: Conectar Header, Footer y Layouts en el Website

- [ ] Paso 6.1: En `website/src/components/layout/Header.astro`:
  - Asegurar que la prop `variant` use `floatingVariant` cuando `shape === 'floating'`.
- [ ] Paso 6.2: En `website/src/components/layout/Footer.astro`:
  - Leer `cmsFooter?.layout` y aplicarlo cuando la prop `layout` no este presente.
  - Leer `cmsFooter?.background` y aplicarlo cuando la prop `background` no este presente.
  - Mapear `cmsFooter?.linkGroups` al layout `columns`.
- [ ] Paso 6.3: En `website/src/layouts/LandingLayout.astro` y `website/src/layouts/PageLayout.astro`:
  - Recibir `floatingVariant` de la pagina y reenviarlo a `<Header />`.
  - Recibir `footerBackground` y reenviarlo a `<Footer />`.

### Tarea 7: Verificacion y Pruebas

- [ ] Paso 7.1: Levantar entorno local con `pnpm dev`.
- [ ] Paso 7.2: Entrar al admin de Payload (`http://localhost:3000/admin`), verificar la nueva global `SiteSettings`, las pestañas del `Footer` y el selector condicional de `floatingVariant` en `Pages`.
- [ ] Paso 7.3: Cambiar entre las 3 variantes de header y los 5 layouts de footer para comprobar en el navegador que el frontend responde en tiempo real.
- [ ] Paso 7.4: Ejecutar la suite de tests y build completo:
  ```bash
  pnpm --filter ./website test -- --run
  pnpm build
  ```
- [ ] Paso 7.5: Seguir la regla de Git: subir a la rama `develop` y abrir Pull Request hacia `main` adjuntando la lista de migraciones.
