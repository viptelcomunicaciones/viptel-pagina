# Endpoints de la API

## REST API

Handler: `src/app/(payload)/api/[...slug]/route.ts`
Métodos: GET, POST, PATCH, PUT, DELETE, OPTIONS.

### Colecciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/{collection}` | Listar documentos |
| GET | `/api/{collection}/{id}` | Obtener un documento |
| POST | `/api/{collection}` | Crear documento |
| PATCH | `/api/{collection}/{id}` | Actualizar documento |
| DELETE | `/api/{collection}/{id}` | Eliminar documento |

**Parámetros de query**:
- `?locale=es|en` — Filtrar por idioma
- `?depth=0|1|2` — Profundidad de relaciones (default 2 en el website)
- `?where[field][operator]=value` — Filtros
- `?sort=-field` — Ordenamiento
- `?page=1&limit=12` — Paginación
- `?draft=true` — Incluir drafts (requiere API key)

### Globals

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/globals/{slug}` | Obtener global (header, footer) |
| POST | `/api/globals/{slug}` | Actualizar global |

### Auth

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/users/login` | Login (email + password) |
| POST | `/api/users/logout` | Logout |
| GET | `/api/users/me` | Usuario actual |
| POST | `/api/users/me` | Actualizar usuario actual |

### Media

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/media/file/{filename}` | Servir archivo de media |

### Jobs

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/payload-jobs/run` | Ejecutar tareas programadas (cron) |

Acceso: requiere usuario autenticado O header `Authorization: Bearer {CRON_SECRET}`.

---

## GraphQL API

**Endpoint**: `POST /api/graphql`
**Playground**: `GET /api/graphql-playground`

Todas las colecciones y globals están disponibles vía GraphQL con los mismos controles de acceso que REST.

---

## Headers de autenticación

### Usuario (sesión)
```
Cookie: payload-token={session_token}
```

### API Key (service account)
```
Authorization: users API-Key {api_key}
```

El website usa API key para requests de preview/draft. El service account es `website-service@viptelcomunicaciones.com`.

---

## Formato de respuesta

```json
{
  "docs": [...],
  "totalDocs": 42,
  "limit": 12,
  "totalPages": 4,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

## URL del servidor

- **Desarrollo**: `http://localhost:3000`
- **Docker**: `http://host.docker.internal:3000`
- **Producción**: configurable vía `PAYLOAD_PUBLIC_SERVER_URL` y `FRONTEND_URL`
