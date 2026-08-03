# Tasks 15–19 Implementation Report

**Date:** 2026-08-03  
**Branch:** `main`  
**Commit:** `5e28eaa` — `feat: services overview/detail views, routes, dropdown nav, and Tienda link`

## Status: ✅ Complete

## Tasks Implemented

### Task 15: ServicesOverviewView
**File:** `website/src/components/pages/views/ServicesOverviewView.astro`  
Shows all service categories with their sub-services as cards in grouped sections. Includes hero with badge, category sections with sub-service cards, and a CTA section.

### Task 16: ServiceView
**File:** `website/src/components/pages/views/ServiceView.astro`  
Routes to the correct detail layout — delegates to `ServiceDetailLayout` with the service, parent, children, and locale.

### Task 17: Routes
| File | Action |
|---|---|
| `services.astro` | Renamed to `.bak` → recreated with CMS data fetching |
| `[locale]/services.astro` | Renamed to `.bak` → recreated with CMS data fetching |
| `ServicesView.astro` | Renamed to `.bak` |
| `services/[...slug].astro` | New — default locale detail page |
| `[locale]/services/[...slug].astro` | New — secondary locale detail page |

### Task 18: nav.config.ts + i18n keys
- Added `children?: NavItem[]` to `NavItem` interface
- Added "Servicios" as dropdown with 5 children links
- Added "Tienda" (external link to `https://tienda.viptelcomunicaciones.com`)
- Added `"shop": "Tienda"/"Shop"` to both locale files
- Added full `services` i18n section (breadcrumb, overview, detail, pricing)
- Exported `isExternalOrAnchorHref` for Header use

### Task 19: Header dropdown
- Updated Header's `NavItem` interface with `children`, `order`, `external`
- Desktop nav: dropdown menus via `group-hover` with chevron icon
- Mobile nav: expandable `<details>` accordion for items with children
- External link icon for Tienda
- Switched from `getNavItems()` to direct `navItems` + `resolveNavItem` to preserve children/order

## Test Results

| Suite | Tests | Result |
|---|---|---|
| Backend integration tests | 5/5 | ✅ All passed |
| Website unit tests | 38/38 | ✅ All passed (fixed 1 test for new Tienda item) |

## Build

`pnpm build` — both backend and website compiled successfully with zero errors.

## Seed

`pnpm --filter ./backend run seed` — services seeded successfully (5 categories + 14 sub-services).

## Concerns

- None. All verifications passed cleanly.
