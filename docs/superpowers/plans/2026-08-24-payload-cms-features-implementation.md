# Payload CMS Features — Implementation Plan

**Fecha**: 2026-08-24
**Estado**: Propuesto
**Autor**: Análisis sistemático del proyecto Viptel Comunicaciones
**Referencia**: Spec: `2026-08-24-payload-cms-features-design.md`

---

## 1. Resumen Ejecutivo

Este plan detalla la implementación de features faltantes y mejoras críticas en el backend Payload CMS de Viptel Comunicaciones, basado en el análisis feature-by-feature contra la lista oficial de Payload CMS.

**Objetivo**: Elevar el CMS de "funcional básico" a "producción enterprise-ready" con seguridad, observabilidad, escalabilidad y UX editorial óptima.

---

## 2. Estado Actual vs Objetivo

| Feature | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| **Admin** | ✅ Completo | ✅ Completo | — |
| **Custom Components** | ⚠️ 4 básicos | ✅ Dashboard widgets, custom views, field components | +8-10 componentes |
| **Authentication** | ⚠️ Email/pass + API Key | ✅ Roles, JWT, field-level access, 2FA opcional | Crítico |
| **Rich Text** | ✅ Lexical personalizado | ✅ + Tables, inline images, indent | Medio |
| **Live Preview** | ✅ Configurado | ✅ Validado end-to-end | Verificación |
| **Versions** | ✅ Drafts + autosave + schedule | ✅ Completo | — |
| **Upload** | ✅ Local + 8 sizes | ✅ S3/R2 cloud storage | **Producción** |
| **Folders** | ✅ Habilitado | ✅ Completo | — |
| **Email** | ✅ Resend configurado | ✅ Templates + preview + testing | Medio |
| **Jobs Queue** | ⚠️ Solo schedulePublish | ✅ Custom tasks: revalidate, search, sitemap, cleanup | **Crítico** |
| **Query Presets** | ❌ Ausente | ✅ Presets por colección | Bajo |
| **Trash** | ❌ Ausente | ✅ Soft-delete en colecciones principales | Alto |
| **Troubleshooting** | ⚠️ Console logs | ✅ Sentry + health checks + structured logs | **Producción** |
| **TypeScript** | ✅ Auto-generado | ✅ Completo | — |

---

## 3. Plan de Fases

### Fase 1: Fundamentos Críticos (Semanas 1-2)
**Objetivo**: Seguridad, revalidation, base para todo lo demás

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 1.1 | Agregar campo `roles` a Users collection | `backend/src/collections/Users/index.ts` | 2h | — |
| 1.2 | Implementar `saveToJWT` y field-level access en roles | `backend/src/collections/Users/index.ts` | 1h | 1.1 |
| 1.3 | Crear factory functions de access control | `backend/src/access/` (nuevos archivos) | 3h | 1.1 |
| 1.4 | Implementar hook `afterChange` global para revalidation | `backend/src/payload.config.ts` | 2h | — |
| 1.5 | Agregar hook `afterChange` por colección (Pages, Posts, Projects, Services) | `backend/src/collections/*/index.ts` | 3h | 1.4 |
| 1.6 | Configurar `trash: true` en Pages, Posts, Projects, Services | `backend/src/collections/*/index.ts` | 30min | — |
| 1.7 | Agregar índices DB en campos de query frecuentes | `backend/src/collections/*/index.ts` | 1h | — |
| 1.8 | Verificar transaction safety en hooks existentes | `backend/src/hooks/`, `backend/src/collections/*/hooks/` | 1h | — |

**Entregable**: CMS con roles, revalidation funcionando, soft-delete, queries optimizadas.

---

### Fase 2: Access Control Avanzado (Semanas 2-3)
**Objetivo**: Control granular por rol, organización, tiempo

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 2.1 | Crear `createRoleBasedAccess` factory | `backend/src/access/roleBased.ts` | 1h | 1.3 |
| 2.2 | Crear `createOrgScopedAccess` para multi-tenancy futuro | `backend/src/access/orgScoped.ts` | 2h | 1.3 |
| 2.3 | Crear `createTimeLimitedAccess` para contenido programado | `backend/src/access/timeLimited.ts` | 1h | 1.3 |
| 2.4 | Aplicar access control a Collections: Pages, Posts, Projects, Services | `backend/src/collections/*/index.ts` | 2h | 2.1-2.3 |
| 2.5 | Field-level access en Services (pricing, features) | `backend/src/collections/Services/index.ts` | 2h | 2.1 |
| 2.6 | Field-level access en Media (delete/restricted) | `backend/src/collections/Media.ts` | 1h | 2.1 |
| 2.7 | Documentar matriz de permisos por rol | `docs/access-control-matrix.md` | 1h | 2.1-2.5 |

**Entregable**: Matriz de permisos completa, field-level security, base multi-tenant.

---

### Fase 3: Jobs Queue & Automatización (Semanas 3-4)
**Objetivo**: Automatizar operaciones críticas

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 3.1 | Definir tipos de tasks en `payload.config.ts` | `backend/src/payload.config.ts` | 1h | — |
| 3.2 | Task `revalidateFrontend` — llama webhook Astro | `backend/src/jobs/revalidateFrontend.ts` (nuevo) | 2h | 1.4 |
| 3.3 | Task `syncSearchIndex` — Meilisearch/Typesense | `backend/src/jobs/syncSearchIndex.ts` (nuevo) | 3h | 3.1 |
| 3.4 | Task `generateSitemap` — trigger Astro rebuild | `backend/src/jobs/generateSitemap.ts` (nuevo) | 2h | 3.1 |
| 3.5 | Task `cleanupOldVersions` — mantener últimas 50 | `backend/src/jobs/cleanupVersions.ts` (nuevo) | 1h | 3.1 |
| 3.6 | Task `webhookDelivery` — cola con retry/backoff | `backend/src/jobs/webhookDelivery.ts` (nuevo) | 2h | 3.1 |
| 3.7 | Configurar cron jobs para tasks recurrentes | `backend/src/payload.config.ts` + infra | 1h | 3.2-3.5 |
| 3.8 | Tests de integración para jobs | `backend/tests/int/jobs.int.spec.ts` | 2h | 3.2-3.6 |

**Entregable**: Jobs queue operativa con 5 tasks críticas, cron configurado, tests.

---

### Fase 4: Cloud Storage & Media (Semana 4)
**Objetivo**: Producción-ready media handling

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 4.1 | Instalar `@payloadcms/storage-r2` (Cloudflare R2) | `backend/package.json` | 15min | — |
| 4.2 | Configurar plugin en `payload.config.ts` | `backend/src/payload.config.ts` | 1h | 4.1 |
| 4.3 | Migrar media existente de `public/media` a R2 | Script de migración | 2h | 4.2 |
| 4.4 | Configurar `resolveMediaUrl` para URLs firmadas | `website/src/lib/payload-client.ts` | 1h | 4.2 |
| 4.5 | Configurar CORS en bucket R2 | Infra/Cloudflare | 30min | 4.2 |
| 4.6 | Cleanup local `public/media` post-migración | Script + verificación | 30min | 4.3 |

**Entregable**: Media en cloud, URLs seguras, cero archivos locales en producción.

---

### Fase 5: Search & Observabilidad (Semanas 4-5)
**Objetivo**: Búsqueda full-text + monitoring

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 5.1 | Evaluar e instalar search adapter (Meilisearch/Typesense) | `backend/package.json` | 30min | — |
| 5.2 | Configurar `@payloadcms/plugin-search` | `backend/src/payload.config.ts` | 2h | 5.1 |
| 5.3 | Indexar colecciones: Pages, Posts, Projects, Services | `backend/src/payload.config.ts` | 1h | 5.2 |
| 5.4 | Crear endpoint `/api/search` en Astro | `website/src/pages/api/search.ts` | 2h | 5.2 |
| 5.5 | Instalar `@payloadcms/plugin-sentry` | `backend/package.json` | 15min | — |
| 5.6 | Configurar Sentry en `payload.config.ts` | `backend/src/payload.config.ts` | 1h | 5.5 |
| 5.7 | Health check endpoint `/api/health` | `backend/src/app/(payload)/api/health.ts` (nuevo) | 1h | — |
| 5.8 | Structured logging (pino/winston) | `backend/src/logger.ts` (nuevo) | 2h | 5.6 |

**Entregable**: Search funcional en admin + website, error tracking, health checks.

---

### Fase 6: Rich Text & UX Editorial (Semana 5)
**Objetivo**: Mejor experiencia de edición

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 6.1 | Agregar `TableFeature` al editor global | `backend/src/fields/defaultLexical.ts` | 30min | — |
| 6.2 | Agregar `UploadFeature` (inline images) | `backend/src/fields/defaultLexical.ts` | 1h | 6.1 |
| 6.3 | Agregar `IndentFeature` | `backend/src/fields/defaultLexical.ts` | 15min | 6.1 |
| 6.4 | Configurar `EXPERIMENTAL_TableFeature` | `backend/src/fields/defaultLexical.ts` | 30min | 6.1 |
| 6.5 | Custom field components: IconPicker mejorado | `backend/src/components/IconPicker/` | 2h | — |
| 6.6 | Dashboard widget: "Mis borradores recientes" | `backend/src/components/DashboardWidgets/` (nuevo) | 2h | — |
| 6.7 | Custom list views: Posts por estado, Services por categoría | `backend/src/components/CustomViews/` (nuevo) | 3h | — |

**Entregable**: Editor rico con tablas/imágenes inline, dashboard personalizado, vistas optimizadas.

---

### Fase 7: Query Presets & Admin Polish (Semana 5-6)
**Objetivo**: UX admin pulida

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 7.1 | Query Presets en Pages: "Publicadas", "Borradores", "Programadas" | `backend/src/collections/Pages/index.ts` | 30min | — |
| 7.2 | Query Presets en Posts: "Publicados", "Por revisar", "Míos" | `backend/src/collections/Posts/index.ts` | 30min | — |
| 7.3 | Query Presets en Services: "Activos", "Con precios", "Raíz" | `backend/src/collections/Services/index.ts` | 30min | — |
| 7.4 | Query Presets en Projects: "Publicados", "Con website", "Recientes" | `backend/src/collections/Projects/index.ts` | 30min | — |
| 7.5 | Admin description/help text en campos complejos | `backend/src/collections/*/index.ts`, `backend/src/blocks/*/` | 1h | — |
| 7.6 | Collapsible/Row en Services para features/pricing/faq | `backend/src/collections/Services/index.ts` | 1h | — |

**Entregable**: Admin UX optimizada, presets útiles, campos organizados.

---

### Fase 8: Email & Comunicaciones (Semana 6)
**Objetivo**: Email transaccional robusto

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 8.1 | Crear templates de email (contact, newsletter, welcome) | `backend/src/emails/templates/` (nuevo) | 2h | — |
| 8.2 | Configurar preview de emails en admin | `backend/src/emails/preview.ts` (nuevo) | 1h | 8.1 |
| 8.3 | Test suite para emails (Vitest) | `backend/tests/int/emails.int.spec.ts` | 1h | 8.1 |
| 8.4 | Documentar variables de entorno Resend | `backend/.env.example`, `docs/email-setup.md` | 30min | 8.1 |

**Entregable**: Email templates, preview, tests, docs.

---

## 4. Arquitectura de Archivos Nuevos

```
backend/
├── src/
│   ├── access/
│   │   ├── anyone.ts                 ✅ Existente
│   │   ├── authenticated.ts          ✅ Existente
│   │   ├── authenticatedOrPublished.ts ✅ Existente
│   │   ├── roleBased.ts              🆕 Nueva (Fase 2)
│   │   ├── orgScoped.ts              🆕 Nueva (Fase 2)
│   │   ├── timeLimited.ts            🆕 Nueva (Fase 2)
│   │   └── index.ts                  🆕 Barrel export
│   ├── collections/
│   │   ├── Users/index.ts            ✅ Existente → modificar (Fase 1)
│   │   ├── Pages/index.ts            ✅ Existente → modificar (Fase 1,2,7)
│   │   ├── Posts/index.ts            ✅ Existente → modificar (Fase 1,2,7)
│   │   ├── Projects/index.ts         ✅ Existente → modificar (Fase 1,2,7)
│   │   ├── Services/index.ts         ✅ Existente → modificar (Fase 1,2,5,7)
│   │   ├── Media.ts                  ✅ Existente → modificar (Fase 1,2,4)
│   │   └── Categories.ts             ✅ Existente
│   ├── hooks/
│   │   ├── populatePublishedAt.ts    ✅ Existente
│   │   ├── revalidateFrontend.ts     🆕 Nueva (Fase 1)
│   │   └── index.ts                  🆕 Barrel export
│   ├── jobs/
│   │   ├── revalidateFrontend.ts     🆕 Nueva (Fase 3)
│   │   ├── syncSearchIndex.ts        🆕 Nueva (Fase 3)
│   │   ├── generateSitemap.ts        🆕 Nueva (Fase 3)
│   │   ├── cleanupVersions.ts        🆕 Nueva (Fase 3)
│   │   ├── webhookDelivery.ts        🆕 Nueva (Fase 3)
│   │   └── index.ts                  🆕 Barrel export
│   ├── components/
│   │   ├── IconPicker/               ✅ Existente
│   │   ├── DashboardWidgets/         🆕 Nueva (Fase 6)
│   │   │   └── MyDraftsWidget.tsx
│   │   ├── CustomViews/              🆕 Nueva (Fase 6)
│   │   │   ├── PostsByStatus.tsx
│   │   │   └── ServicesByCategory.tsx
│   │   ├── BeforeDashboard/          ✅ Existente
│   │   ├── BeforeLogin/              ✅ Existente
│   │   └── LogoutButton.tsx          ✅ Existente
│   ├── emails/
│   │   ├── templates/
│   │   │   ├── contact.tsx
│   │   │   ├── newsletter.tsx
│   │   │   └── welcome.tsx
│   │   ├── preview.ts
│   │   └── index.ts
│   ├── logger.ts                     🆕 Nueva (Fase 5)
│   ├── app/(payload)/
│   │   └── api/
│   │       └── health.ts             🆕 Nueva (Fase 5)
│   ├── payload.config.ts             ✅ Existente → modificar (Fases 1,3,4,5)
│   └── fields/
│       ├── defaultLexical.ts         ✅ Existente → modificar (Fase 6)
│       ├── iconField.ts              ✅ Existente
│       ├── link.ts                   ✅ Existente
│       ├── linkGroup.ts              ✅ Existente
│       ├── seoTab.ts                 ✅ Existente
│       └── tocField.ts               ✅ Existente
```

---

## 5. Variables de Entorno Nuevas

### Backend (`.env`)
```env
# Fase 1: Auth
# (existentes: PAYLOAD_SECRET, DATABASE_URL, etc.)

# Fase 3: Jobs
CRON_SECRET=                      # Ya existe
REVALIDATE_WEBHOOK_URL=http://localhost:4321/api/revalidate
SEARCH_INDEX_URL=http://localhost:7700  # Meilisearch
SEARCH_INDEX_KEY=                 # Meilisearch admin key
SITEMAP_WEBHOOK_URL=http://localhost:4321/api/sitemap

# Fase 4: Cloud Storage (R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=viptel-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Fase 5: Search
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=

# Fase 5: Sentry
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Fase 8: Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@viptelcomunicaciones.com
RESEND_AUDIENCE_ID=
```

### Website (`.env`)
```env
# Fase 4: Media URLs
# (existente: PAYLOAD_URL, PAYLOAD_API_KEY, etc.)
```

---

## 6. Testing Strategy

| Tipo | Cobertura | Herramienta | Cuándo |
|------|-----------|-------------|--------|
| **Unit** | Access control factories, hook logic | Vitest | Cada fase |
| **Integration** | Collections CRUD, jobs, email, search | Vitest + Payload Local API | Fases 1,3,5,8 |
| **E2E** | Admin flows: create/edit/publish/delete, preview | Playwright | Fases 1,2,6 |
| **Contract** | Payload types ↔ Astro client types | TypeScript build | Continuo |

**Comando unificado**: `pnpm test` (backend) / `pnpm test` (website)

---

## 7. Rollout & Deployment

### Orden de Deploy por Entorno

| Entorno | Fases | Notas |
|---------|-------|-------|
| **Local/Dev** | 1-8 completo | Feature flags para ir activando |
| **Staging** | 1-5 primero, luego 6-8 | Validar jobs + search + storage |
| **Producción** | 1-4 obligatorio, 5-8 incremental | Zero-downtime para storage migration |

### Feature Flags Sugeridos
```typescript
// payload.config.ts
const features = {
  roles: process.env.FEATURE_ROLES === 'true',
  jobs: process.env.FEATURE_JOBS === 'true',
  search: process.env.FEATURE_SEARCH === 'true',
  cloudStorage: process.env.FEATURE_R2 === 'true',
  sentry: process.env.FEATURE_SENTRY === 'true',
}
```

---

## 8. Métricas de Éxito

| Métrica | Baseline | Target | Medición |
|---------|----------|--------|----------|
| Tiempo revalidation (publish → live) | N/A (roto) | < 5s | Logs + manual test |
| Admin list load (100 items) | ~2s | < 500ms | DB query time |
| Media upload (5MB) | Local ~3s | R2 < 2s | Network tab |
| Search latency (admin) | N/A | < 200ms | Meilisearch stats |
| Error rate (Sentry) | N/A | < 0.1% | Sentry dashboard |
| Build time | ~3min | < 2min | CI/CD logs |

---

## 9. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Migración media a R2 falla | Media | Alto | Script idempotente, rollback plan, test en staging primero |
| Jobs queue bloquea DB | Baja | Alto | `disableTransaction` en reads, timeouts, circuit breaker |
| Roles rompen access existente | Media | Alto | Feature flag, tests exhaustivos, deploy gradual |
| Search index inconsistente | Media | Medio | Job de reindex completo semanal, webhook sync en every change |
| Sentry costos inesperados | Baja | Medio | Sample rate 10%, alertas en spikes |

---

## 10. Estimación Total

| Fase | Esfuerzo (horas) | Semanas |
|------|------------------|---------|
| 1: Fundamentos | 13.5h | 1-2 |
| 2: Access Control | 10h | 2-3 |
| 3: Jobs Queue | 14h | 3-4 |
| 4: Cloud Storage | 5h | 4 |
| 5: Search + Observabilidad | 10.5h | 4-5 |
| 6: Rich Text + UX | 9h | 5 |
| 7: Query Presets + Polish | 3.5h | 5-6 |
| 8: Email | 4.5h | 6 |
| **Total** | **~70h** | **6 semanas** |

---

## 11. Próximos Pasos Inmediatos

1. **Aprobar plan** — Revisar con stakeholders
2. **Crear branch** — `feature/payload-cms-features`
3. **Iniciar Fase 1.1** — Roles en Users (base para todo)
4. **Configurar feature flags** — En `payload.config.ts`
5. **Setup CI/CD checks** — TypeScript, lint, tests en cada PR

---

## 12. Referencias

- [Payload CMS Docs - Access Control](https://payloadcms.com/docs/access-control/overview)
- [Payload CMS Docs - Jobs Queue](https://payloadcms.com/docs/configuration/jobs-queue)
- [Payload CMS Docs - Storage Adapters](https://payloadcms.com/docs/storage/overview)
- [Payload CMS Docs - Search](https://payloadcms.com/docs/plugins/search)
- [Project Knowledge](../project-knowledge/SKILL.md)
- [Backend AGENTS.md](../backend/AGENTS.md)
- [Análisis feature-by-feature previo] (conversación del 2026-08-24)