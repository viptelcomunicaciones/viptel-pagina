# Seed Data

El script de seed (`src/scripts/seed.ts`) puebla la base de datos con datos de demostración. Se ejecuta con:

```bash
pnpm seed
```

**Importante**: El seed limpia TODOS los datos existentes antes de sembrar.

## Usuarios creados

| Email | Rol | Password |
|---|---|---|
| `viptelcomunicaciones@hotmail.com` | Admin | `Viptel3562/*-` (configurable vía `SEED_ADMIN_PASSWORD`) |
| `website-service@viptelcomunicaciones.com` | Service account | Random (API key generada automáticamente) |

## Media

3 imágenes descargadas del template de Payload CMS:
- Hero image
- 2 imágenes de blog posts

## Categories

| Título (es) | Título (en) |
|---|---|
| Telecomunicaciones | Telecommunications |
| Desarrollo Web | Web Development |
| Marketing Digital | Digital Marketing |

## Blog Posts

| Título (es) | Título (en) | Categorías |
|---|---|---|
| PBX en la nube: La revolución de las comunicaciones empresariales | Cloud PBX: The Business Communications Revolution | Telecomunicaciones |
| Tendencias de desarrollo web para 2026 | Web Development Trends for 2026 | Desarrollo Web |

Ambos posts incluyen: autores, categorías, tags, contenido rich text, y posts relacionados cruzados.

## Projects

| Título (es) | Título (en) | Cliente | Año |
|---|---|---|---|
| Red corporativa para empresa multinacional | Corporate Network for Multinational Company | Grupo Empresarial Andino | 2025 |
| E-commerce para cadena de retail | E-commerce for Retail Chain | Moda Latina S.A. | 2025 |

Incluyen: cover image, gallery, tags, contenido rich text.

## Services — Jerarquía

### Viptel-PBX (`viptel-pbx`)
- `viptel-pbx-basica` — PBX Básica / Basic PBX
- `viptel-pbx-avanzada` — PBX Avanzada / Advanced PBX

### Viptel-VoIP (`viptel-voip`)
- `viptel-voip-minutos` — Minutos VoIP / VoIP Minutes
- `viptel-voip-did` — DID / Virtual Numbers

### Viptel-Web (`viptel-web`)
- `viptel-web-sitio-informativo` — Sitio Informativo / Informational Site
- `viptel-web-sitio-corporativo` — Sitio Corporativo / Corporate Site
- `viptel-web-tienda-basica` — Tienda Básica / Basic Store
- `viptel-web-tienda-avanzada` — Tienda Avanzada / Advanced Store

### Viptel-Marketing (`viptel-marketing`)
- `viptel-marketing-email` — Email Masivo / Mass Email
- `viptel-marketing-whatsapp` — WhatsApp Masivo / Mass WhatsApp
- `viptel-marketing-sms` — SMS Masivo / Mass SMS
- `viptel-marketing-audio` — Audio Masivo / Mass Audio

### Viptel-Software (`viptel-software`)
- `viptel-software-erp` — ERP Empresarial / Enterprise ERP
- `viptel-software-crm` — CRM / Customer Relationship Management

Cada sub-servicio incluye: descripción, features, pricing, FAQ, gallery, layout blocks.

## Home Page

- Slug: `/home`
- Hero con rich text y CTA links
- Layout: services cards, project archive, post archive, call to action
- SEO metadata en es y en

## Header y Footer

Navegación completa en español e inglés:
- Home, Servicios, Portafolio, Blog, Nosotros, Contacto, Tienda
