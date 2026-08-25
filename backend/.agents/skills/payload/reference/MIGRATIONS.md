# Migraciones

Payload CMS usa Drizzle ORM para generar y ejecutar migraciones SQL contra PostgreSQL.

> **Estado de esta cadena: SANA** (reset completa el 2026-08-25, baseline `20260825_205151_initial`).
> `migrate:create` funciona correctamente desde entonces. No escribas migraciones a mano sin
> su snapshot `.json`: eso rompió la cadena anterior y obligó a resetear toda la historia.

## Estructura

```
src/migrations/
├── index.ts                      # Registro de migraciones (auto-actualizado)
├── 20260825_205151_initial.ts    # Baseline único: esquema completo (159 tablas)
└── 20260825_205151_initial.json  # Snapshot Drizzle (base para futuros diffs)
```

## Regla de oro

**dev = push mode · producción = migrate.**

- En desarrollo, el adaptador postgres usa `push: true` por defecto: al arrancar
  `next dev`, Drizzle sincroniza el esquema automáticamente. La DB local es un sandbox.
- Las migraciones existen para producción/CI. Nunca corras `payload migrate` contra tu DB local
  de desarrollo salvo que sepas lo que haces (mezclar push + migrate sin criterio corrompe el estado).
- No mezcles: si una vez aplicas migrate manualmente a tu local, marca SIEMPRE la fila en
  `payload_migrations` o genera el snapshot correspondiente.

## Flujo por cada cambio de esquema (colecciones/campos/bloques)

```bash
# 1. Edita payload.config.ts / colecciones
# 2. Arranca pnpm dev → push ajusta tu DB local sola (no necesitas migrar localmente)
# 3. Al terminar la feature, genera la migración:
pnpm payload migrate:create nombre-descriptivo
# 4. REVISAR el SQL generado en src/migrations/*.ts (buena práctica oficial)
# 5. Commit del .ts + .json junto con el cambio de config
```

Comandos (el bin se invoca vía el script `payload`):

| Comando | Qué hace |
|---|---|
| `pnpm payload migrate:create <nombre>` | Genera `.ts` (SQL up/down) + `.json` (snapshot) y registra en `index.ts`. Flags: `--skip-empty`, `--force-accept-warning` |
| `pnpm payload migrate` | Aplica las migraciones pendientes, en orden |
| `pnpm payload migrate:status` | Tabla de estado: qué se ha ejecutado y qué no |
| `pnpm payload migrate:down` | Revierte el último batch |
| `pnpm payload migrate:fresh` | ⚠️ Borra TODAS las tablas y re-aplica todo. Solo dev |

## Cómo funciona internamente (importante para no romperlo)

- `migrate:create` **no mira la base de datos**: compara el último snapshot `.json`
  ("before") contra el esquema derivado del config actual ("after").
- Por eso una migración escrita a mano SIN su `.json` deja el diff siguiente corrupto
  (esto fue lo que pasó antes del reset de 2026-08-25).
- Cada migración exporta `up()` y `down()`; en Postgres usan
  `import { type MigrateUpArgs, sql } from '@payloadcms/db-postgres'`.
- Payload registra cada migración aplicada en la tabla `payload_migrations`.
  El marcador `batch = -1, name = 'dev'` indica que la DB fue creada/modificada por push mode.

## Producción

Nunca push en producción. Dos mecanismos soportados:

### Opción A — CI antes del build (recomendada)

Script ya definido en `package.json`:

```json
"ci": "cross-env NODE_OPTIONS=--no-deprecation payload migrate && pnpm build"
```

Apunta el `build script` del plataforma de deploy a `pnpm ci`. Conecta a la DB de
producción, aplica migraciones pendientes y solo entonces compila. Si una migración
falla, el deploy se rechaza.

### Opción B — Al arranque del servidor (servidores de larga vida, no serverless)

```ts
// payload.config.ts
import { migrations } from './migrations'

db: postgresAdapter({
  // ...
  prodMigrations: migrations,
})
```

### Checklist por deploy a producción

1. **Backup** de la DB (`pg_dump -Fc`)
2. Deploy del código que incluye las migraciones nuevas
3. Ejecutar `payload migrate` (vía `pnpm ci` o startup)
4. Verificar con `payload migrate:status` + smoke tests

## Historial

| Migración | Nota |
|---|---|
| `20260825_205151_initial` | Baseline completo tras reset de la historia (incluye project-types/project-categories). Verificada aplicando limpia sobre DB fresca |

La historia anterior (20260801–20260815) fue eliminada en el reset: tenía drift
(migraciones `.ts` sin snapshot + DB mantenida por push), lo que impedía generar
nuevas migraciones correctamente.

## Conexión

`DATABASE_URL=postgres://...@127.0.0.1:5432/payload_viptel` (ver `backend/.env`).