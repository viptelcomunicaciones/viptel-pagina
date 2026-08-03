# Task 3: Backend — Regenerate payload-types and create migration

**Date:** 2026-08-03
**Status:** DONE

## Steps performed

### 1. Regenerate Payload types
Ran `pnpm --filter ./backend run payload generate:types`. The regenerated `payload-types.ts` now includes:
- `Service` interface (collection shape)
- `ServicesSelect` type
- `services` in the `Config.collections` map
- `services` in link `relationTo` unions
- `services` in `PayloadLockedDocument`, `TaskSchedulePublish`, etc.

### 2. Create migration
Ran `pnpm --filter ./backend run payload migrate:create`. Created migration: `backend/src/migrations/20260803_155526.ts`.

### 3. Run migration
Ran `pnpm --filter ./backend run payload migrate:fresh` (required because dev mode had already pushed tables dynamically). Both migrations ran successfully:
- `20260801_232755_initial` (1127ms)
- `20260803_155526` (613ms)

Re-seeded the database afterward.

### 4. Clean up temporary workarounds

| File | Change |
|---|---|
| `backend/src/collections/Services/index.ts` | Removed `CollectionSlug` import; removed `as CollectionSlug` cast on line 58 |
| `backend/src/fields/link.ts` | Removed `CollectionSlug` import; removed `as CollectionSlug[]` cast on line 78 |
| `backend/src/plugins/index.ts` | Added `Service` to type import from `@/payload-types`; added `Service` to `GenerateTitle` and `GenerateURL` generics |
| `backend/src/utilities/generatePreviewPath.ts` | Already had `services` prefix from Task 2 — no changes needed |

### 5. Build verification
`pnpm --filter ./backend run build` — **PASS**

### 6. Tests
`pnpm --filter ./backend run test:int` — **5 passed, 0 failed**

## Concerns
None.
