# Payload CMS Features — Implementation Plan

**Fecha**: 2026-08-24
**Estado**: Propuesto
**Autor**: Análisis sistemático del proyecto Viptel Comunicaciones
**Referencia**: Spec: `2026-08-24-payload-cms-features-design.md`
**Plan complementario**: Infraestructura (R2 + Search/Observability) en `2026-08-24-payload-cms-infrastructure-implementation.md`

---

## 1. Resumen Ejecutivo

Este plan detalla la implementación de features faltantes y mejoras críticas en el backend Payload CMS de Viptel Comunicaciones, basado en el análisis feature-by-feature contra la lista oficial de Payload CMS.

**Objetivo**: Elevar el CMS de "funcional básico" a "producción enterprise-ready" con seguridad, observabilidad, escalabilidad y UX editorial óptima (excluyendo infraestructura de producción: R2, Search, Sentry — ver plan separado).

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
| **Upload** | ✅ Local + 8 sizes | ✅ Local (R2 en plan infra) | — |
| **Folders** | ✅ Habilitado | ✅ Completo | — |
| **Email** | ✅ Resend configurado | ✅ Templates + preview + testing | Medio |
| **Jobs Queue** | ⚠️ Solo schedulePublish | ✅ Custom tasks: revalidate, sitemap, cleanup | **Crítico** |
| **Query Presets** | ❌ Ausente | ✅ Presets por colección | Bajo |
| **Trash** | ❌ Ausente | ✅ Soft-delete en colecciones principales | Alto |
| **Troubleshooting** | ⚠️ Console logs | ✅ Health checks + structured logs | **Producción** |
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
| 1.9 | Verificar transaction safety en hooks existentes | `backend/src/hooks/`, `backend/src/collections/*/hooks/` | 1h | — |

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
| 3.8 | Tests de integración para jobs | `backend/tests/int/jobs.int.spec.ts` | 2h | 3.2-3.5 |

**Entregable**: Jobs queue operativa con 5 tasks críticas, cron configurado, tests.

---

### Fase 4: Rich Text & UX Editorial (Semana 5)
**Objetivo**: Mejor experiencia de edición

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 4.1 | Agregar `TableFeature` al editor global | `backend/src/fields/defaultLexical.ts` | 30min | — |
| 4.2 | Agregar `UploadFeature` (inline images) | `backend/src/fields/defaultLexical.ts` | 1h | 4.1 |
| 4.3 | Agregar `IndentFeature` | `backend/src/fields/defaultLexical.ts` | 15min | 4.1 |
| 4.4 | Configurar `EXPERIMENTAL_TableFeature` | `backend/src/fields/defaultLexical.ts` | 30min | 4.1 |
| 4.5 | Custom field components: IconPicker mejorado | `backend/src/components/IconPicker/` | 2h | — |
| 4.6 | Dashboard widget: "Mis borradores recientes" | `backend/src/components/DashboardWidgets/` (nuevo) | 2h | — |
| 4.7 | Custom list views: Posts por estado, Services por categoría | `backend/src/components/CustomViews/` (nuevo) | 3h | — |

**Entregable**: Editor rico con tablas/imágenes inline, dashboard personalizado, vistas optimizadas.

---

### Fase 5: Query Presets & Admin Polish (Semana 5-6)
**Objetivo**: UX admin pulida

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 5.1 | Query Presets en Pages: "Publicadas", "Borradores", "Programadas" | `backend/src/collections/Pages/index.ts` | 30min | — |
| 4.2 | Query Presets en Posts: "Publicados", "Por revisar", "Míos" | `backend/src/collections/Posts/index.ts` | 30min | — |
| 4.3 | Query Presets en Services: "Activos", "Con precios", "Raíz" | `backend/src/collections/Services/index.ts` | 30min | — |
| 4.4 | Query Presets en Projects: "Publicados", "Con website", "Recientes" | `backend/src/collections/Projects/index.ts` | 30min | — |
| 4.5 | Admin description/help text en campos complejos | `backend/src/collections/*/index.ts`, `backend/src/blocks/*/` | 1h | — |
| 4.6 | Collapsible/Row en Services para features/pricing/faq | `backend/src/collections/Services/index.ts` | 1h | — |

**Entregable**: Admin UX optimizada, presets útiles, campos organizados.

---

### Fase 6: Email & Comunicaciones (Semana 6)
**Objetivo**: Email transaccional robusto

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 6.1 | Crear templates de email (contact, newsletter, welcome) | `backend/src/emails/templates/` (nuevo) | 2h | — |
| 6.2 | Configurar preview de emails en admin | `backend/src/emails/preview.ts` (nuevo) | 1h | 6.1 |
| 6.3 | Test suite para emails (Vitest) | `backend/tests/int/emails.int.spec.ts` | 1h | 6.1 |
| 6.4 | Documentar variables de entorno Resend | `backend/.env.example`, `docs/email-setup.md` | 30min | 6.1 |

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
186: │   │   ├── orgScoped.ts              🆕 Nueva (Fase 2)
187: │   │   ├── timeLimited.ts            🆕 Nueva (Fase 2)
188: │   │   └── index.ts                  🆕 Barrel export
189: │   ├── collections/
189: │   │   ├── Users/index.ts            ✅ Existente → modificar (Fase 1)
190: │   │   ├── Pages/index.ts            ✅ Existente → modificar (Fase 1,2,4)
191: │   │   ├── Posts/index.ts            ✅ Existente → modificar (Fase 1,2,4)
192: │   │   ├── Projects/index.ts         ✅ Existente → modificar (Fase 1,2,4)
194: │   │   ├── Services/index.ts         ✅ Existente → modificar (Fase 1,2,4)
195: │   │   ├── Media.ts                  ✅ Existente → modificar (Fase 1,2)
195: │   │   └── Categories.ts             ✅ Existente
196: │   ├── hooks/
197: │   │   ├── populatePublishedAt.ts    ✅ Existente
198: │   │   ├── revalidateFrontend.ts     🆕 Nueva (Fase 1)
199: │   │   └── index.ts                  🆕 Barrel export
200: │   ├── jobs/
200: │   │   ├── revalidateFrontend.ts     🆕 Nueva (Fase 3)
201: │   │   ├── syncSearchIndex.ts        🆕 Nueva (Fase 3)
201: │   │   ├── generateSitemap.ts        🆕 Nueva (Fase 3)
202: │   │   ├── cleanupVersions.ts        🆕 Nueva (Fase 3)
202: │   │   ├── webhookDelivery.ts        🆕 Nueva (Fase 3)
202: │   │   └── index.ts                  🆕 Barrel export
203: │   ├── components/
203: │   │   ├── IconPicker/               ✅ Existente
204: │   │   ├── DashboardWidgets/         🆕 Nueva (Fase 4)
205: │   │   │   └── MyDraftsWidget.tsx
210: │   │   ├── CustomViews/              🆕 Nueva (Fase 4)
210: │   │   │   ├── PostsByStatus.tsx
211: │   │   │   └── ServicesByCategory.tsx
211: │   ├── Footer/                       ✅ Existente
217: │   ├── Header/                       ✅ Existente
217: │   ├── heros/                        ✅ Existente
218: │   ├── emails/
218: │   │   ├── templates/
220: │   │   │   ├── contact.tsx
221: │   │   │   ├── newsletter.tsx
221: │   │   │   └── welcome.tsx
222: │   │   ├── preview.ts
222: │   │   └── index.ts
223: │   ├── logger.ts                     🆕 Nueva (Fase 3)
228: │   ├── app/(payload)/
228: │   │   └── api/
228: │   │       └── health.ts             🆕 Nueva (Fase 3)
229: │   ├── payload.config.ts             ✅ Existente → modificar (Fases 1,3)
230: │   └── fields/
230: │       ├── defaultLexical.ts         ✅ Existente → modificar (Fase 4)
231: │       ├── iconField.ts              ✅ Existente
232: │       ├── link.ts                   ✅ Existente
232: │       ├── linkGroup.ts              ✅ Existente
233: │       ├── seoTab.ts                 ✅ Existente
234: │       └── tocField.ts               ✅ Existente
235: ```


---

## 5. Variables de Entorno Nuevas

### Backend (.env)

`nv
# Fase 1: Auth
# (existentes: PAYLOAD_SECRET, DATABASE_URL, etc.)

# Fase 3: Jobs
CRON_SECRET=                      # Ya existe
REVALIDATE_WEBHOOK_URL=http://localhost:4321/api/revalidate
SITEMAP_WEBHOOK_URL=http://localhost:4321/api/sitemap

# Fase 3: Jobs (Search - mover a plan infra cuando se implemente)
# SEARCH_INDEX_URL=http://localhost:7700
# SEARCH_INDEX_KEY=

# Fase 6: Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@viptelcomunicaciones.com
RESEND_AUDIENCE_ID=
`

### Website (.env)

`nv
# (existente: PAYLOAD_URL, PAYLOAD_API_KEY, etc.)
`

---

## 6. Testing Strategy

| Tipo | Cobertura | Herramienta | Cuándo |
|------|-----------|-------------|--------|
| **Unit** | Access control factories, hook logic | Vitest | Cada fase |
| **Integration** | Collections CRUD, jobs, email | Vitest + Payload Local API | Fases 1,3,4,5,6 |
| **E2E** | Admin flows: create/edit/publish/delete, preview | Playwright | Fases 1,2,4,5,6 |
| **Contract** | Payload types ↔ Astro client types | TypeScript build | Continuo |

**Comando unificado**: pnpm test (backend) / pnpm test (website)

---

## 7. Rollout & Deployment

### Orden de Deploy por Entorno

| Entorno | Fases | Notas |
|---------|-------|-------|
| **Local/Dev** | 1-6 completo | Feature flags para ir activando |
| **Staging** | 1-6 completo | Validar jobs, rich text, email |
| **Producción** | 1-6 obligatorio | Infraestructura (R2, Search, Sentry) en plan separado |

### Feature Flags Sugeridos

`	ypescript
// payload.config.ts
const features = {
  roles: process.env.FEATURE_ROLES == 'true',
  jobs: process.env.FEATURE_JOBS == 'true',
  richTextTables: process.env.FEATURE_RICH_TEXT_TABLES == 'true',
  dashboardWidgets: process.env.FEATURE_DASHBOARD_WIDGETS == 'true',
  queryPresets: process.env.FEATURE_QUERY_PRESETS == 'true',
  // cloudStorage: process.env.FEATURE_R2 == 'true',      // En plan infra
  // search: process.env.FEATURE_SEARCH == 'true',        // En plan infra
  // sentry: process.env.FEATURE_SENTRY == 'true',        // En plan infra
}
`

---

## 7. Métricas de Éxito

| Métrica | Baseline | Target | Medición |
|---------|----------|--------|----------|
| Tiempo revalidation (publish → live) | N/A (roto) | < 5s | Logs + manual test |
| Admin list load (100 items) | ~2s | < 500ms | DB query time |
| Media upload (5MB) | Local ~3s | Local < 3s | Network tab |
| Search latency (admin) | N/A | N/A | N/A (plan infra) |
| Error rate (logs) | N/A | < 0.1% | Structured logs |
| Build time | ~3min | < 2min | CI/CD logs |

---

## 8. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Roles rompen access existente | Media | Alto | Feature flag, tests exhaustivos, deploy gradual |
| Jobs queue bloquea DB | Baja | Alto | disableTransaction en reads, timeouts, circuit breaker |
| Rich text features rompen contenido existente | Baja | Medio | Tests exhaustivos, feature flag |
| Email templates rompen en cliente | Baja | Medio | Preview en admin, tests de render |

---

## 8. Estimación Total

| Fase | Esfuerzo (horas) | Semanas |
|------|------------------|---------|
| 1: Fundamentos | 13.5h | 1-2 |
| 2: Access Control | 10h | 2-3 |
| 3: Jobs Queue | 14h | 3-4 |
| 4: Rich Text + UX | 9h | 5 |
| 5: Query Presets + Polish | 3.5h | 5-6 |
| 6: Email | 4.5h | 6 |
| **Total** | **~54.5h** | **5 semanas** |

---

## 9. Próximos Pasos Inmediatos

1. **Aprobar plan** — Revisar con stakeholders
2. **Crear branch** — eature/payload-cms-features
3. **Iniciar Fase 1.1** — Roles en Users (base para todo)
4. **Configurar feature flags** — En payload.config.ts
5. **Setup CI/CD checks** — TypeScript, lint, tests en cada PR

---

## 10. Referencias

- [Payload CMS Docs - Access Control](https://payloadcms.com/docs/access-control/overview)
- [Payload CMS Docs - Jobs Queue](https://payloadcms.com/docs/configuration/jobs-queue)
- [Payload CMS Docs - Rich Text](https://payloadcms.com/docs/fields/rich-text)
- [Payload CMS Docs - Email](https://payloadcms.com/docs/fields/email)
- [Project Knowledge](../project-knowledge/SKILL.md)
- [Backend AGENTS.md](../backend/AGENTS.md)
- [Plan Infraestructura](../plans/2026-08-24-payload-cms-infrastructure-implementation.md)
- [Análisis feature-by-feature previo] (conversación del 2026-08-24)

---
