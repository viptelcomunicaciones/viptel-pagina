# Viptel Comunicaciones

Monorepo de Viptel Comunicaciones — empresa colombiana de telecomunicaciones, desarrollo web y marketing digital.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| CMS | Payload CMS 3.86 + Lexical editor |
| Frontend CMS | Next.js 16.2 + React 19 |
| Frontend público | Astro 7.1 + Tailwind CSS v4 + React 19 |
| Base de datos | PostgreSQL + Drizzle ORM |
| Paquetería | pnpm workspaces |
| Contenedores | Docker (Node 22 Alpine) |

## Arquitectura

```
PostgreSQL ←→ Backend (Payload CMS) ←→ Website (Astro SSR) → Usuarios
              Puerto 3000               Puerto 4321
              /admin                    /
              /api/*                    /es/*, /en/*
```

El website consume contenido del backend vía REST API en tiempo de ejecución (SSR). No hay acceso directo a base de datos desde el website.

## Desarrollo local

### Requisitos

- Node.js 22+
- pnpm
- PostgreSQL

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/viptelcomunicaciones.git
cd viptelcomunicaciones

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp website/.env.example website/.env
# Editar .env con tus credenciales reales

# Iniciar en modo desarrollo
pnpm dev
```

### URLs de desarrollo

| Servicio | URL |
|---|---|
| Backend (Payload CMS) | http://localhost:3000/admin |
| Website (Astro) | http://localhost:4321 |

### Sembrar datos demo

```bash
# Sembrar todo (admin + servicios + contenido)
cd backend
pnpm seed

# Solo sembrar servicios
pnpm seed:services
```

## Estructura del proyecto

```
viptelcomunicaciones/
├── backend/                # Payload CMS 3 + Next.js 16
│   ├── src/
│   │   ├── collections/    # 7 colecciones (Users, Media, Pages, Posts, Projects, Categories, Services)
│   │   ├── blocks/         # 11 bloques de contenido
│   │   ├── scripts/        # seed.ts, seed-services.ts
│   │   └── payload.config.ts
│   ├── Dockerfile          # Docker build para Dokploy
│   ├── scripts/start.sh    # migrate + start
│   └── .env.example
├── website/                # Astro 7 + Tailwind CSS v4
│   ├── src/
│   │   ├── components/     # 57 componentes
│   │   ├── pages/          # Rutas (es + en + API)
│   │   ├── i18n/           # Textos (es.json, en.json)
│   │   ├── lib/            # payload.ts (cliente REST)
│   │   └── config/         # site.config.ts, nav.config.ts, i18n.config.ts
│   ├── Dockerfile          # Docker build para Dokploy
│   ├── scripts/start.sh    # node ./dist/server/entry.mjs
│   └── .env.example
└── docs/                   # Especificaciones y planes
```

## i18n

- `es` (default, sin prefijo URL) y `en` (prefijo `/en/`) activos
- TODO el texto visible vive en `website/src/i18n/{locale}.json`
- El backend también tiene localización (es/en)

## Colecciones del backend

| Colección | Descripción |
|---|---|
| `users` | Autenticación de administradores |
| `categories` | Categorías para posts |
| `media` | Imágenes y archivos |
| `pages` | Páginas del sitio con bloques (nested-docs) |
| `posts` | Artículos del blog |
| `projects` | Casos de estudio y portafolio |
| `services` | Servicios de Viptel (jerárquicos) |

## Deployment con Dokploy

### Arquitectura en Dokploy

```
Dokploy
├── PostgreSQL (addon)
│   └── Base de datos: payload_viptel
├── Backend (servicio Docker)
│   ├── Dockerfile: backend/
│   ├── Puerto: 3000
│   ├── Dominio: cms.viptelcomunicaciones.com
│   └── Healthcheck: /api/health
└── Website (servicio Docker)
    ├── Dockerfile: website/
    ├── Puerto: 4321
    ├── Dominio: viptelcomunicaciones.com
    └── Healthcheck: /api/health
```

### Pasos para deploy

1. **Subir código a GitHub**
2. **Crear PostgreSQL** en Dokploy (addon)
3. **Crear servicio backend**:
   - Source: GitHub repo, directorio `backend/`
   - Build: Dockerfile
   - Variables de entorno (ver `.env.example`)
4. **Crear servicio website**:
   - Source: GitHub repo, directorio `website/`
   - Build: Dockerfile
   - Variables de entorno (ver `.env.example`)
5. **Configurar dominios** en Dokploy
6. **Ejecutar seeds** del backend (una vez)

### Variables de entorno para Dokploy

#### Backend

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | URL de PostgreSQL (del addon Dokploy) |
| `PAYLOAD_SECRET` | Secreto para tokens JWT |
| `PAYLOAD_PUBLIC_SERVER_URL` | URL pública del backend |
| `FRONTEND_URL` | URL del frontend |
| `PREVIEW_SECRET` | Secreto para modo preview |

#### Website

| Variable | Descripción |
|---|---|
| `PAYLOAD_URL` | URL del backend |
| `SITE_URL` | URL del sitio |
| `PREVIEW_SECRET` | Mismo que el backend |

## Comandos

### Desde la raíz

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Inicia backend y website en paralelo |
| `pnpm dev:backend` | Solo backend (puerto 3000) |
| `pnpm dev:website` | Solo website (puerto 4321) |
| `pnpm build` | Build de ambos paquetes |
| `pnpm build:backend` | Build solo backend |
| `pnpm build:website` | Build solo website |

### Backend

| Comando | Qué hace |
|---|---|
| `pnpm seed` | Sembrar datos demo completos |
| `pnpm seed:services` | Sembrar solo servicios |
| `pnpm payload migrate` | Ejecutar migraciones |
| `pnpm generate:types` | Generar tipos TypeScript |

### Website

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm check` | TypeScript + ESLint + Prettier |

## Documentación

| Archivo | Contenido |
|---|---|
| `AGENTS.md` | Instrucciones para agentes de IA |
| `PROJECT-KNOWLEDGE.md` | Conocimiento completo del proyecto |
| `backend/README.md` | Setup y arquitectura del backend |
| `website/README.md` | Setup y arquitectura del website |
| `backend/.agents/skills/payload/` | Skill de Payload CMS (13 archivos) |
| `docs/superpowers/` | Especificaciones y planes de features |

## Licencia

Proyecto privado — Viptel Comunicaciones.
