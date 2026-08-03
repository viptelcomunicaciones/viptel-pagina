# Task 4 Report: Backend — Update seed script with services

## Status

DONE

## Changes

- Added `'services'` to the `collections` array in `backend/src/scripts/seed.ts` so the services collection is cleared before re-seeding
- Inserted service seeding block (type `ServiceSeed`, `serviceCategories` data array, and nested seeding loop) after the projects loop and before the home page section
- 5 parent categories + 14 child sub-services = 19 total services seeded across `es` and `en` locales

## Verification

```
pnpm --filter ./backend run seed
```

Output confirms:
- `- Seeding services...` logged
- All 5 categories and 14 sub-services created
- `Seeded database successfully!`

## Commits

1. `8602206` — `feat(seed): add services seeding data (5 categories + 14 sub-services)`

## Concerns

None.
