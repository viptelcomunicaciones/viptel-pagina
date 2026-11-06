# Plan de Implementación: Subvariantes del Header Flotante (CMS ⟷ Frontend)

> **Para agentes:** REQUIRED SUB-SKILL: Usa `subagent-driven-development` o `executing-plans` para implementar este plan tarea por tarea. Cada paso usa sintaxis de casillas (`- [ ]`).

---

### Resumen del Proyecto

Actualmente, el componente de navegación del frontend (`website/src/components/layout/header.variants.ts`) cuenta con 3 subvariantes visuales para la cápsula flotante (`shape: 'floating'`):
1. **`transparent`**: Vidrio translúcido (Glassmorphism).
2. **`default`**: Fondo semitransparente con desenfoque alto (`backdrop-blur-xl`).
3. **`solid`**: Fondo opaco con borde perimetral nítido.

Sin embargo, en el backend (`backend/src/collections/Pages/index.ts`) solo existe el selector general `headerStyle` (`bar`, `floating`, `transparent`), lo que obliga al frontend a fijar por código siempre la opción `transparent`.

**Objetivo:** Permitir que el editor en Payload CMS elija libremente la subvariante de cápsula flotante por página, propagarla dinámicamente a través de los layouts de Astro y verificar su apariencia visual con Playwright.

---

### Mapeo de Archivos

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `backend/src/collections/Pages/index.ts` | Modificar | Agregar el campo condicional `floatingVariant` cuando `headerStyle === 'floating'`. |
| `website/src/lib/payload-types.ts` | Modificar / Regenerar | Actualizar las definiciones de TypeScript para la colección `Page`. |
| `website/src/layouts/LandingLayout.astro` | Modificar | Recibir `floatingVariant` y pasarlo a `<Header variant={...} />`. |
| `website/src/layouts/PageLayout.astro` | Modificar | Recibir `floatingVariant` y pasarlo a `<Header variant={...} />`. |
| `website/src/components/pages/views/HomeView.astro` | Modificar | Leer `home.floatingVariant` y enviarlo a `LandingLayout`. |
| `website/src/pages/[...slug].astro` | Modificar | Leer `page.floatingVariant` y enviarlo a `PageLayout`. |
| `website/e2e/header-floating.spec.ts` | Crear | Test automatizado de Playwright para comprobar el renderizado de cada variante. |

---

## Tareas de Implementación

### Tarea 1: Añadir el campo `floatingVariant` en la colección `Pages` de Payload CMS

- [ ] **Paso 1.1**: Abrir `backend/src/collections/Pages/index.ts` y localizar la pestaña de `headerStyle`.
- [ ] **Paso 1.2**: Agregar el campo de selección condicional:
  ```typescript
  {
    name: 'floatingVariant',
    type: 'select',
    defaultValue: 'transparent',
    label: 'Acabado de Cápsula Flotante',
    options: [
      { label: 'Vidrio translúcido (Glassmorphism / Transparent)', value: 'transparent' },
      { label: 'Semitransparente con Desenfoque (Default Blur)', value: 'default' },
      { label: 'Sólida opaca (Solid)', value: 'solid' },
    ],
    admin: {
      condition: (data) => data?.headerStyle === 'floating',
      description: 'Elige el acabado visual de la cápsula flotante.',
    },
  }
  ```
- [ ] **Paso 1.3**: Ejecutar compilación y chequeo de tipos en backend:
  `pnpm --filter ./backend build`
- [ ] **Paso 1.4**: Si la base de datos requiere migración por la nueva columna en PostgreSQL, generar la migración:
  `pnpm --filter ./backend payload migrate:create add_floating_variant`

---

### Tarea 2: Sincronizar tipos en el Website Frontend

- [ ] **Paso 2.1**: Actualizar la interfaz `Page` en `website/src/lib/payload-types.ts`:
  ```typescript
  export interface Page {
    // ...
    headerStyle?: ('bar' | 'floating' | 'transparent') | null;
    floatingVariant?: ('transparent' | 'default' | 'solid') | null;
  }
  ```
- [ ] **Paso 2.2**: Verificar que el cliente de Payload no reporte errores de tipos con `pnpm --filter ./website check`.

---

### Tarea 3: Conectar las propiedades en los Layouts de Astro

- [ ] **Paso 3.1**: Modificar `website/src/layouts/LandingLayout.astro`:
  - Añadir en `interface Props`:
    ```typescript
    floatingVariant?: 'transparent' | 'default' | 'solid' | null;
    ```
  - En la renderización de `<Header />` dentro del bloque flotante:
    ```astro
    <Header
      slot="header"
      position="fixed"
      shape="floating"
      variant={floatingVariant ?? 'transparent'}
      colorScheme="default"
      size="lg"
      showThemeSelector
      autoHide={false}
      scrollProgressPosition="top"
      invertOnReturn={false}
    />
    ```
- [ ] **Paso 3.2**: Modificar `website/src/layouts/PageLayout.astro` para aceptar e inyectar `floatingVariant` de forma idéntica.
- [ ] **Paso 3.3**: Modificar `website/src/components/pages/views/HomeView.astro`:
  - Pasar `floatingVariant={home?.floatingVariant ?? 'transparent'}` a `LandingLayout`.
- [ ] **Paso 3.4**: Modificar `website/src/pages/[...slug].astro`:
  - Pasar `floatingVariant={page?.floatingVariant ?? 'transparent'}` a `PageLayout`.

---

### Tarea 4: Verificación Visual con Playwright y Navegador

- [ ] **Paso 4.1**: Iniciar los servidores de desarrollo en modo aislado o comprobar puertos (`pnpm dev`).
- [ ] **Paso 4.2**: Usar las herramientas de Playwright MCP:
  - Navegar a la página con `browser_navigate`.
  - Capturar screenshot con `browser_take_screenshot` para la variante `transparent` (vidrio).
  - Cambiar en vivo a la variante `default` (blur) y tomar captura comparativa.
  - Cambiar a la variante `solid` (opaco) y tomar captura comparativa.
- [ ] **Paso 4.3**: Validar que en los 3 casos:
  - El menú móvil siga abriendo correctamente.
  - La animación de entrada `animate-header-drop` se ejecute sin parpadeos.
  - La barra de progreso de lectura permanezca anclada en el borde de la cápsula.

---

### Tarea 5: Verificación de Integridad y Reglas de Git

- [ ] **Paso 5.1**: Ejecutar suite de pruebas:
  `pnpm --filter ./website test -- --run`
- [ ] **Paso 5.2**: Ejecutar linter y compilación global:
  `pnpm build`
- [ ] **Paso 5.3**: Seguir la regla estricta de Git del proyecto:
  - Cambios en rama `develop` (o `feat/floating-header-variants`).
  - Creación de Pull Request hacia `main`.
