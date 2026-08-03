# Task 6 Report — Service data functions in payload.ts

## Status
**Done** — all edits applied, build passes, committed.

## Changes
- `website/src/lib/payload.ts`: Added `Service` to import and export, added 4 functions:
  - `getServiceCategories()` — root-level services (no parent)
  - `getServicesByParent()` — children of a parent service
  - `getServiceBySlug()` — single service by slug
  - `getAllServices()` — all published services (max 100)

## Test summary
`pnpm --filter ./website run build` — **PASS** (no errors, completed in 4.80s)

## Commit
`5263557` — `feat(website): add service data functions to payload client`

## Concerns
None.
