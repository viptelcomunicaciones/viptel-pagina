# Services Content from docs/content — Design Spec

**Fecha**: 2026-09-01
**Estado**: Aprobado
**Origen**: `docs/content/01-…12-….md` (contenido de servicios)

## Contexto

Los 19 servicios de la colección `services` (5 raíces + 14 hijos) existen con `title` y
`shortDescription` (es/en), pero `description`, `features`, `faq`, `icon` y `layout` están
vacíos. Los 12 docs en `docs/content/` contienen el contenido completo que debe poblar
estos campos. Falta además el servicio "Plataforma Web a la Medida" (doc 09).

## Decisiones aprobadas

1. **Jerarquía**: los "Módulos Adicionales" de ERP y CRM (HRMS, Helpdesk, WhatsApp API,
   ViptelPBX, ViptelBot, WhatsApp Call…) se modelan como **features dentro** del servicio
   ERP/CRM — no como servicios hijos.
2. **Entrega**: script de seed TypeScript idempotente (busca por `slug`, actualiza o crea).
3. **FAQ y pricing**: todos los servicios (hijos) llevan FAQ (4–6) y pricing genérico
   (2–3 planes sin montos reales).
4. **Raíces**: `description` + `faq` + `cta` — sin features/pricing.
5. **CTA**: bloque `cta` al final de todos los servicios (raíces e hijos) con el tagline
   del doc y link a `/contact`.

## Jerarquía objetivo

```
viptel-pbx        ├─ basica, avanzada                 ← docs 01, 02
viptel-voip       ├─ minutos, did                     ← docs 03, 04
viptel-web        ├─ sitio-informativo, sitio-corporativo,
                  │  tienda-basica, tienda-avanzada,
                  └─ plataforma-a-la-medida  🆕       ← docs 05–09
viptel-marketing  ├─ sms-masivo, audio-masivo,
                  │  email-masivo, whatsapp-masivo    ← doc 10
viptel-software   ├─ erp, crm                         ← docs 11, 12
```

## Mapeo doc → campos CMS

| Campo CMS | Fuente del doc |
|---|---|
| `description` (richText) | "Descripción General" |
| `features[]` (title + description + icon) | "Principales Funcionalidades" |
| `faq[]` | Redactadas del contenido del doc |
| `pricing[]` | Planes genéricos sin montos (`price: 0` → "A convenir") |
| `icon` | Catálogo Lucide (`iconCatalog.ts`) |
| `layout` | 1 bloque `cta` (richText = tagline del doc + link a `/contact`) |

## Cambio de frontend requerido

`ServicePricing.astro` renderiza `{currency}{price.toLocaleString()}`. Con `price: 0`
mostraría "COP0". Cambio:

- Si `plan.price <= 0` → label "A convenir" (key i18n `services.pricing.onRequest`).
- Añadir key a `website/src/i18n/es.json` y `en.json`.

## Script de seed

- Archivo: `backend/src/scripts/seed-services.ts`
- Comando: `pnpm --filter ./backend seed:services` (script nuevo en package.json)
- Idempotente: `payload.find({ collection: 'services', where: { slug } })` → update o create.
- Publica (`_status: 'published'`) los servicios creados/actualizados.
- Contenido completo en `es` y `en` para los 15 servicios hijos + 5 raíces (faq/cta) +
  el nuevo `plataforma-a-la-medida`.

## Validación

1. Ejecutar `seed:services` contra DB local → verificar counts (features/faq/pricing > 0).
2. `pnpm --filter ./backend build` + `pnpm --filter ./website build`.
3. `astro check` (0 errores).
4. Render de `/services` y una página de detalle (p.ej. `/services/viptel-pbx/avanzada`).
