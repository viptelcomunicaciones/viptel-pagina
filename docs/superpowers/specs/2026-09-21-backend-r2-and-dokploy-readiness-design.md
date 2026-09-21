# Backend: Cloudflare R2 Storage y Preparación para Dokploy

- **Fecha:** 2026-09-21
- **Estado:** Aprobado
- **Alcance:** Solo paquete `backend/` (el paquete `website/` permanece intacto en esta fase)

---

## 1. Contexto y Problema

1. **Fallo en despliegue Dokploy (`payload migrate` colgado):**
   - En despliegues anteriores, la base de datos en Dokploy ejecutó cambios en modo *dev push*, registrando `{ name: 'dev', batch: -1 }` en `payload_migrations`.
   - `start.sh` ejecutaba `pnpm payload migrate --forceAcceptWarning`. Como Payload no soporta `--forceAcceptWarning` en `migrate`, solicitaba confirmación interactiva `(y/N)`. En Docker, sin terminal interactiva (`stdin`), el proceso se bloqueaba indefinidamente.
   - Además, `pushDevSchema` no debe ejecutarse en producción para evitar alterar dinámicamente el esquema.

2. **Pérdida y visualización de imágenes (Media en producción):**
   - La colección `Media` utilizaba almacenamiento en disco local (`public/media`).
   - En contenedores Docker (Dokploy), el sistema de archivos es efímero. Al reiniciar o desplegar, las imágenes se perdían.
   - En el frontend público, las imágenes relativas requerían acceso directo al host del backend.
   - **Solución:** Integrar Cloudflare R2 como almacenamiento en la nube S3-compatible mediante el adaptador oficial `@payloadcms/storage-s3`, configurado de forma condicional (híbrido) para no romper el entorno local.

---

## 2. Decisiones de Diseño

### 2.1 Almacenamiento Híbrido R2 (Cloudflare R2 vía `@payloadcms/storage-s3`)
- Se instala `@payloadcms/storage-s3@3.86.0` en `backend/`.
- El plugin se activa solo si la variable `R2_BUCKET` está definida:
  ```ts
  enabled: Boolean(process.env.R2_BUCKET)
  ```
- **Modo Local (sin R2 configurado):** Las subidas van a `public/media` en disco local como hasta ahora. Nada se rompe ni se requiere cuenta R2 obligatoria para desarrollar en local.
- **Modo Producción (o local con credenciales R2):** Las subidas van al bucket de Cloudflare R2.
- `generateFileURL` construye la URL pública directa desde `R2_PUBLIC_URL`, aprovechando la CDN global con costo $0 de transferencia (egress).

### 2.2 Control de Esquema de Base de Datos
- En `backend/src/payload.config.ts`, el adaptador de PostgreSQL se configura con:
  ```ts
  push: process.env.NODE_ENV !== 'production'
  ```
- En desarrollo (`NODE_ENV=development` o por defecto en local), Drizzle auto-sincroniza el esquema (`push: true`).
- En producción (`NODE_ENV=production`), se desactiva el push automático, forzando el uso exclusivo de migraciones controladas (`payload migrate`).

### 2.3 Script de Inicio y Dockerfile
- En `backend/scripts/start.sh`:
  - Se elimina el flag `--forceAcceptWarning` que es inválido para `payload migrate`.
  - Queda:
    ```sh
    #!/bin/sh
    pnpm payload migrate
    pnpm start
    ```
- En `backend/Dockerfile`:
  - Se declara explícitamente `ENV NODE_ENV=production` antes del CMD para asegurar que el runtime reconozca el entorno de producción.

---

## 3. Variables de Entorno

Se documentan en `backend/.env.example`:
```env
# Cloudflare R2 (Opcional en local, recomendado en producción)
R2_BUCKET=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

---

## 4. Plan de Verificación

1. `pnpm install` en raíz para resolver `@payloadcms/storage-s3`.
2. `pnpm --filter viptel-cms build` para confirmar que compila y que no hay errores de TypeScript.
3. Comprobar que en local sin variables R2 el backend sigue operando con almacenamiento local.
4. Git commit local sin push a remoto (a la espera de la limpieza de base de datos en Dokploy).
