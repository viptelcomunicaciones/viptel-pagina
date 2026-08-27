# Payload CMS Infrastructure — Implementation Plan

**Fecha**: 2026-08-24
**Estado**: Propuesto
**Autor**: Análisis sistemático del proyecto Viptel Comunicaciones
**Referencia**: Plan principal: `2026-08-24-payload-cms-features-implementation.md`

---

## 1. Resumen Ejecutivo

Este plan detalla la implementación de infraestructura de producción para el backend Payload CMS de Viptel Comunicaciones: **Cloud Storage (Cloudflare R2)** y **Search + Observabilidad** (Meilisearch, Sentry, Health checks, Logging). Estas características son necesarias para el despliegue en producción y se ejecutan independientemente del plan principal de features del CMS.

**Objetivo**: Preparar el CMS para despliegue en producción con almacenamiento en la nube, búsqueda full-text y observabilidad completa.

---

## 2. Estado Actual vs Objetivo

| Feature | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| **Upload** | ✅ Local + 8 sizes | ✅ S3/R2 cloud storage | **Producción** |
| **Search** | ❌ Ausente | ✅ Meilisearch full-text | **Producción** |
| **Observability** | ⚠️ Console logs | ✅ Sentry + Health + Structured logs | **Producción** |

---

## 3. Plan de Fases

### Fase 1: Cloud Storage — Cloudflare R2 (Semana 1)
**Objetivo**: Producción-ready media handling

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 1.1 | Instalar `@payloadcms/storage-r2` (Cloudflare R2) | `backend/package.json` | 15min | — |
| 1.2 | Configurar plugin en `payload.config.ts` | `backend/src/payload.config.ts` | 1h | 1.1 |
| 1.3 | Migrar media existente de `public/media` a R2 | Script de migración | 2h | 1.2 |
| 1.4 | Configurar `resolveMediaUrl` para URLs firmadas | `website/src/lib/payload-client.ts` | 1h | 1.2 |
| 1.5 | Configurar CORS en bucket R2 | Infra/Cloudflare | 30min | 1.2 |
| 1.6 | Cleanup local `public/media` post-migración | Script + verificación | 30min | 1.3 |

**Entregable**: Media en cloud, URLs firmadas/seguras, cero archivos locales en producción.

**Feature Flag**: `FEATURE_R2`

---

### Fase 2: Search & Observabilidad (Semanas 1-2)
**Objetivo**: Búsqueda full-text + monitoring completo

| # | Tarea | Archivos Afectados | Esfuerzo | Dependencias |
|---|-------|-------------------|----------|--------------|
| 2.1 | Evaluar e instalar search adapter (Meilisearch/Typesense) | `backend/package.json` | 30min | — |
| 2.2 | Configurar `@payloadcms/plugin-search` | `backend/src/payload.config.ts` | 2h | 1.1 |
| 2.3 | Indexar colecciones: Pages, Posts, Projects, Services | `backend/src/payload.config.ts` | 1h | 1.1 |
| 2.4 | Crear endpoint `/api/search` en Astro | `website/src/pages/api/search.ts` | 2h | 1.1 |
| 2.5 | Instalar `@payloadcms/plugin-sentry` | `backend/package.json` | 15min | — |
| 2.2 | Configurar Sentry en `payload.config.ts` | `backend/src/payload.config.ts` | 1h | 2.1 |
| 2.3 | Health check endpoint `/api/health` | `backend/src/app/(payload)/api/health.ts` | 1h | — |
| 2.4 | Structured logging (pino/winston) | `backend/src/logger.ts` | 2h | 1.2 |

**Entregable**: Search funcional en admin + website, error tracking, health checks.

**Feature Flags**: `FEATURE_SEARCH`, `FEATURE_SENTRY`

---

## 4. Arquitectura de Archivos Nuevos

```
backend/
├── src/
│   ├── app/(payload)/
│   │   └── api/
│   │       └── health.ts             🆕 Nueva (Fase 2)
│   ├── logger.ts                     🆕 Nueva (Fase 2)
│   ├── payload.config.ts             ✅ Existente → modificar (Fases 1, 2)
│   └── components/
│       └── IconPicker/               ✅ Existente
```

---

## 5. Variables de Entorno Nuevas

### Backend (`.env`)

```env
# Fase 1: Cloud Storage (R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=viptel-media
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Fase 2: Search
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=

# Fase 2: Sentry
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
```

### Website (`.env`)

```env
# Fase 1: Media URLs
# (existente: PAYLOAD_URL, PAYLOAD_API_KEY, etc.)
```

---

## 5. Testing Strategy

| Tipo | Cobertura | Herramienta | Cuándo |
|------|-----------|-------------|--------|
| **Unit** | Storage config, search config | Vitest | Cada fase |
| **Integration** | R2 upload/download, search index, Sentry events | Vitest + Payload Local API | Fases 1, 2 |
| **E2E** | Media upload R2, search in admin + website | Playwright | Fases 1, 2 |

**Comando unificado**: `pnpm test` (backend) / `pnpm test` (website)

---

## 6. Rollout & Deployment

### Orden de Deploy por Entorno

| Entorno | Fases | Notas |
|---------|-------|-------|
| **Local/Dev** | 1-2 completo | Feature flags para ir activando |
| **Staging** | 1-2 completo | Validar R2 upload/download, search, Sentry |
| **Producción** | 1-2 obligatorio | Zero-downtime para storage migration |

### Feature Flags

```typescript
// payload.config.ts
const features = {
  cloudStorage: process.env.FEATURE_R2 === 'true',
  search: process.env.FEATURE_SEARCH === 'true',
  sentry: process.env.FEATURE_SENTRY === 'true',
}
```

---

## 6. Métricas de Éxito

| Métrica | Baseline | Target | Medición |
|---------|----------|--------|----------|
| Media upload (5MB) | Local ~3s | R2 < 2s | Network tab |
| Search latency (admin) | N/A | < 200ms | Meilisearch stats |
| Search latency (website) | N/A | < 300ms | API response time |
| Error rate (Sentry) | N/A | < 0.1% | Sentry dashboard |
| Health check uptime | N/A | 99.9% | Uptime monitor |

---

## 7. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Migración media a R2 falla | Media | Alto | Script idempotente, rollback plan, test en staging primero |
| Search index inconsistente | Media | Medio | Job de reindex completo semanal, webhook sync en every change |
| Sentry costos inesperados | Baja | Medio | Sample rate 10%, alertas en spikes |
| R2 costs inesperados | Baja | Medio | Lifecycle rules, alerts en Cloudflare |

---

## 7. Estimación Total

| Fase | Esfuerzo (horas) | Semanas |
|------|------------------|---------|
| 1: Cloud Storage (R2) | 5h | 1 |
| 2: Search + Observabilidad | 10.5h | 1-2 |
| **Total** | **~15.5h** | **2-3 semanas** |

---

## 8. Próximos Pasos Inmediatos

1. **Aprobar plan** — Revisar con stakeholders
2. **Crear branch** — `feature/payload-cms-infrastructure`
3. **Configurar Meilisearch local** — `docker run meilisearch/meilisearch`
4. **Configurar Cloudflare R2** — Crear bucket, CORS, API tokens
5. **Configurar Sentry project** — Obtener DSN, configurar alerts
6. **Iniciar Fase 1.1** — Instalar `@payloadcms/storage-r2`, configurar plugin

---

## 8. Referencias

- [Payload CMS Docs - Storage Adapters](https://payloadcms.com/docs/storage/overview)
- [Payload CMS Docs - Search](https://payloadcms.com/docs/plugins/search)
- [Payload CMS Docs - Sentry](https://payloadcms.com/docs/plugins/sentry)
- [Meilisearch Docs](https://www.meilisearch.com/docs)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Sentry Docs](https://docs.sentry.io/)
- [Plan principal](../2026-08-24-payload-cms-features-implementation.md)