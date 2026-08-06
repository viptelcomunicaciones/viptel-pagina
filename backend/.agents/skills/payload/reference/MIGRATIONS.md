# Migraciones

Payload CMS usa Drizzle ORM para generar y ejecutar migraciones SQL contra PostgreSQL.

## Estructura

```
src/migrations/
├── index.ts                      # Registro de migraciones
├── 20260801_232755_initial.ts    # Migración inicial (todas las tablas base)
├── 20260801_232755_initial.json  # SQL generado (up/down)
├── 20260803_155526.ts           # Agrega colección services
└── 20260803_155526.json         # SQL generado (up/down)
```

## Crear una migración

```bash
# En el directorio backend/
pnpm migrate:create
```

Esto ejecuta `payload migrate:create` que:
1. Compara el schema actual con la base de datos
2. Genera archivos SQL (Drizzle)
3. Crea archivos `.ts` y `.json` en `src/migrations/`

## Registrar una migración

En `src/migrations/index.ts`:

```typescript
import { initial } from './20260801_232755_initial'
import { services } from './20260803_155526'

export const migrations = [initial, services]
```

## Ejecutar migraciones

Las migraciones se ejecutan automáticamente al iniciar el servidor Payload. También se pueden ejecutar manualmente:

```bash
pnpm migrate
```

## Migraciones existentes

### `20260801_232755_initial`
Crea todas las tablas base:
- `users`, `users_sessions`, `users_api_keys`
- `media`, `media_sizes`, `media_folders`
- `categories`, `categories_locales`
- `pages`, `pages_locales`, `pages_rels`, `pages_versions`
- `posts`, `posts_locales`, `posts_rels`, `posts_versions`, `posts_tags`
- `projects`, `projects_locales`, `projects_rels`, `projects_versions`, `projects_tags`, `projects_gallery`
- `redirects`
- `header`, `header_locales`, `header_nav_items`
- `footer`, `footer_locales`, `footer_nav_items`
- Tablas del sistema Payload (`payload_preferences`, `payload_migrations`, etc.)

### `20260803_155526`
Agrega:
- `services`, `services_locales`, `services_rels`, `services_versions`, `services_tags`
- `services_features`, `services_pricing`, `services_faq`, `services_gallery`
- Relaciones self-referencing para `parent`

---

## Cómo funciona Drizzle con Payload

Payload 3.x usa Drizzle ORM internamente. Las migraciones son archivos SQL generados por `drizzle-kit` que Payload ejecuta contra PostgreSQL.

**Conexión**: `DATABASE_URL=postgres://postgres:viptel3562@127.0.0.1:5432/payload_viptel`
