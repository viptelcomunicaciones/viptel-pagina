import type { GlobalConfig } from 'payload'

import { adminOnly } from '@/access/roleBased'
import { revalidateGlobal } from '@/hooks/revalidateFrontend'

const THEME_OPTIONS = [
  { label: 'Orange', value: 'orange' },
  { label: 'Amber', value: 'amber' },
  { label: 'Lime', value: 'lime' },
  { label: 'Emerald', value: 'emerald' },
  { label: 'Teal', value: 'teal' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Sky', value: 'sky' },
  { label: 'Blue', value: 'blue' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Violet', value: 'violet' },
  { label: 'Purple', value: 'purple' },
  { label: 'Magenta', value: 'magenta' },
]

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Configuración del Sitio',
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidad y Contacto Corporativo',
          fields: [
            {
              name: 'name',
              type: 'text',
              localized: true,
              required: true,
              defaultValue: 'Viptel Comunicaciones',
              label: 'Nombre de la Empresa / Sitio',
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              label: 'Descripción Global (Fallback SEO)',
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: 'Eslogan / Tagline Corporativo',
            },
            {
              name: 'footerNote',
              type: 'text',
              localized: true,
              label: 'Nota corta de pie de página',
            },
            {
              name: 'url',
              type: 'text',
              label: 'URL Principal del Sitio',
              defaultValue: 'https://viptelcomunicaciones.com',
            },
            {
              name: 'email',
              type: 'email',
              label: 'Correo de Contacto',
              defaultValue: 'info@viptel.com',
            },
            {
              name: 'phone',
              type: 'text',
              label: 'Teléfono Principal',
            },
            {
              name: 'address',
              type: 'group',
              label: 'Dirección Corporativa',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  label: 'Calle / Dirección',
                },
                {
                  name: 'city',
                  type: 'text',
                  label: 'Ciudad',
                  defaultValue: 'Bogotá',
                },
                {
                  name: 'state',
                  type: 'text',
                  label: 'Departamento / Estado',
                },
                {
                  name: 'zip',
                  type: 'text',
                  label: 'Código Postal',
                },
                {
                  name: 'country',
                  type: 'text',
                  label: 'País',
                  defaultValue: 'Colombia',
                },
              ],
            },
          ],
        },
        {
          label: 'Marca y Logos',
          fields: [
            {
              name: 'ogImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen OG por Defecto (Redes Sociales)',
            },
            {
              name: 'logo',
              type: 'group',
              label: 'Logo del Sitio',
              fields: [
                {
                  name: 'alt',
                  type: 'text',
                  localized: true,
                  label: 'Texto Alternativo del Logo',
                  defaultValue: 'Viptel Comunicaciones',
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Imagen de Logo (Media)',
                },
                {
                  name: 'customSvgPath',
                  type: 'text',
                  label: 'Ruta SVG Personalizada (ej: /logo.svg)',
                },
                {
                  name: 'structuredDataImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Logo para Datos Estructurados (PNG/Schema)',
                },
              ],
            },
            {
              name: 'favicon',
              type: 'group',
              label: 'Favicon',
              fields: [
                {
                  name: 'customSvgPath',
                  type: 'text',
                  defaultValue: '/favicon.svg',
                  label: 'Ruta Favicon SVG',
                },
              ],
            },
            {
              name: 'colors',
              type: 'group',
              label: 'Colores del Navegador y Splash',
              fields: [
                {
                  name: 'themeColor',
                  type: 'text',
                  defaultValue: '#0055aa',
                  label: 'Theme Color (Barra del Navegador)',
                },
                {
                  name: 'backgroundColor',
                  type: 'text',
                  defaultValue: '#ffffff',
                  label: 'Background Color (PWA Splash)',
                },
              ],
            },
          ],
        },
        {
          label: 'Temas y Apariencia',
          fields: [
            {
              name: 'defaultTheme',
              type: 'select',
              options: THEME_OPTIONS,
              defaultValue: 'blue',
              label: 'Tema Predeterminado',
            },
            {
              name: 'defaultColorMode',
              type: 'select',
              options: [
                { label: 'Sistema (System)', value: 'system' },
                { label: 'Claro (Light)', value: 'light' },
                { label: 'Oscuro (Dark)', value: 'dark' },
              ],
              defaultValue: 'system',
              label: 'Modo de Color Predeterminado',
            },
            {
              name: 'enabledThemes',
              type: 'select',
              hasMany: true,
              options: THEME_OPTIONS,
              defaultValue: THEME_OPTIONS.map((t) => t.value),
              label: 'Temas Habilitados en el Selector',
            },
            {
              name: 'blogImageOverlay',
              type: 'checkbox',
              defaultValue: true,
              label: 'Capa de Color sobre Imágenes de Blog (Site-Wide)',
            },
            {
              name: 'cursorTrail',
              type: 'checkbox',
              defaultValue: true,
              label: 'Efecto de Rastro en Cursor (Desktop)',
            },
          ],
        },
        {
          label: 'Redes Sociales Corporativas',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              label: 'Enlaces a Redes Sociales',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: 'Etiqueta (opcional)',
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  label: 'URL del Perfil',
                },
              ],
            },
            {
              name: 'twitterSite',
              type: 'text',
              defaultValue: '@viptel',
              label: 'Cuenta X / Twitter de la Empresa (ej: @viptel)',
            },
          ],
        },
        {
          label: 'Configuración de Blog y Portafolio',
          fields: [
            {
              name: 'toc',
              type: 'group',
              label: 'Tabla de Contenidos (TOC)',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Habilitar TOC Globalmente',
                },
                {
                  name: 'layout',
                  type: 'select',
                  options: [
                    { label: 'Automático (Sidebar en desktop, inline en móvil)', value: 'auto' },
                    { label: 'Inline al inicio del post', value: 'inline' },
                    { label: 'Sidebar fijo', value: 'sidebar' },
                  ],
                  defaultValue: 'auto',
                  label: 'Disposición del TOC',
                },
                {
                  name: 'sidebarPosition',
                  type: 'select',
                  options: [
                    { label: 'Derecha', value: 'right' },
                    { label: 'Izquierda', value: 'left' },
                  ],
                  defaultValue: 'right',
                  label: 'Posición del Sidebar',
                },
                {
                  name: 'minHeadings',
                  type: 'number',
                  defaultValue: 3,
                  label: 'Mínimo de Encabezados para Mostrar TOC',
                },
                {
                  name: 'maxDepth',
                  type: 'select',
                  options: [
                    { label: 'H2 únicamente', value: '2' },
                    { label: 'H2 + H3', value: '3' },
                    { label: 'H2 + H3 + H4', value: '4' },
                  ],
                  defaultValue: '3',
                  label: 'Profundidad Máxima de Encabezados',
                },
              ],
            },
            {
              name: 'comments',
              type: 'group',
              label: 'Comentarios en Artículos',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Habilitar Comentarios Globalmente',
                },
                {
                  name: 'provider',
                  type: 'select',
                  options: [
                    { label: 'Giscus (GitHub Discussions)', value: 'giscus' },
                    { label: 'Cusdis', value: 'cusdis' },
                    { label: 'Artalk', value: 'artalk' },
                  ],
                  defaultValue: 'giscus',
                  label: 'Proveedor de Comentarios',
                },
                {
                  name: 'giscus',
                  type: 'group',
                  label: 'Configuración Giscus',
                  admin: {
                    condition: (_, siblingData) => siblingData?.provider === 'giscus',
                  },
                  fields: [
                    { name: 'repo', type: 'text', label: 'Repositorio (usuario/repo)' },
                    { name: 'repoId', type: 'text', label: 'Repo ID' },
                    { name: 'category', type: 'text', label: 'Categoría' },
                    { name: 'categoryId', type: 'text', label: 'Category ID' },
                    {
                      name: 'mapping',
                      type: 'select',
                      options: [
                        { label: 'pathname', value: 'pathname' },
                        { label: 'url', value: 'url' },
                        { label: 'title', value: 'title' },
                        { label: 'og:title', value: 'og:title' },
                        { label: 'specific', value: 'specific' },
                        { label: 'number', value: 'number' },
                      ],
                      defaultValue: 'pathname',
                    },
                    { name: 'strict', type: 'checkbox', defaultValue: false },
                    { name: 'reactionsEnabled', type: 'checkbox', defaultValue: true },
                    { name: 'emitMetadata', type: 'checkbox', defaultValue: false },
                    {
                      name: 'inputPosition',
                      type: 'select',
                      options: [
                        { label: 'Arriba', value: 'top' },
                        { label: 'Abajo', value: 'bottom' },
                      ],
                      defaultValue: 'bottom',
                    },
                    { name: 'theme', type: 'text', label: 'Tema personalizado (dejar vacío para auto)' },
                    { name: 'lang', type: 'text', label: 'Idioma (dejar vacío para auto)' },
                  ],
                },
                {
                  name: 'cusdis',
                  type: 'group',
                  label: 'Configuración Cusdis',
                  admin: {
                    condition: (_, siblingData) => siblingData?.provider === 'cusdis',
                  },
                  fields: [
                    { name: 'appId', type: 'text', label: 'App ID' },
                    { name: 'host', type: 'text', defaultValue: 'https://cusdis.com', label: 'Host' },
                    {
                      name: 'theme',
                      type: 'select',
                      options: [
                        { label: 'Automático', value: 'auto' },
                        { label: 'Claro', value: 'light' },
                        { label: 'Oscuro', value: 'dark' },
                      ],
                      defaultValue: 'auto',
                    },
                    { name: 'lang', type: 'text', label: 'Idioma (dejar vacío para auto)' },
                  ],
                },
                {
                  name: 'artalk',
                  type: 'group',
                  label: 'Configuración Artalk',
                  admin: {
                    condition: (_, siblingData) => siblingData?.provider === 'artalk',
                  },
                  fields: [
                    { name: 'server', type: 'text', label: 'Servidor Artalk' },
                    { name: 'site', type: 'text', label: 'Nombre del Sitio Artalk' },
                    { name: 'jsUrl', type: 'text', label: 'URL JS Personalizada (opcional)' },
                    { name: 'cssUrl', type: 'text', label: 'URL CSS Personalizada (opcional)' },
                    { name: 'darkMode', type: 'text', label: 'Modo Oscuro (auto / true / false)' },
                    { name: 'locale', type: 'text', label: 'Locale' },
                  ],
                },
              ],
            },
            {
              name: 'blog',
              type: 'group',
              label: 'Paginación y Feed de Blog',
              fields: [
                {
                  name: 'postsPerPage',
                  type: 'number',
                  defaultValue: 12,
                  label: 'Artículos por Página',
                },
                {
                  name: 'tagCloudLimit',
                  type: 'number',
                  defaultValue: 0,
                  label: 'Límite de Nube de Etiquetas (0 = todas)',
                },
                {
                  name: 'rssMaxItems',
                  type: 'number',
                  defaultValue: 20,
                  label: 'Artículos Máximos en RSS Feed',
                },
              ],
            },
            {
              name: 'projects',
              type: 'group',
              label: 'Paginación de Portafolio / Proyectos',
              fields: [
                {
                  name: 'perPage',
                  type: 'number',
                  defaultValue: 12,
                  label: 'Proyectos por Página',
                },
                {
                  name: 'tagCloudLimit',
                  type: 'number',
                  defaultValue: 0,
                  label: 'Límite de Nube de Etiquetas (0 = todas)',
                },
              ],
            },
          ],
        },
        {
          label: 'Verificación, Analítica y Consentimiento',
          fields: [
            {
              name: 'schemas',
              type: 'group',
              label: 'Datos Estructurados (Schema.org)',
              fields: [
                {
                  name: 'includeOrgSchema',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Incluir Organization Schema en Home',
                },
                {
                  name: 'includePersonSchema',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Incluir Person Schema',
                },
                {
                  name: 'includeProfessionalServiceSchema',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Incluir ProfessionalService Schema (SEO Local)',
                },
              ],
            },
            {
              name: 'verification',
              type: 'group',
              label: 'Verificación de Motores de Búsqueda',
              fields: [
                {
                  name: 'google',
                  type: 'text',
                  label: 'Google Site Verification Code',
                },
                {
                  name: 'bing',
                  type: 'text',
                  label: 'Bing Site Verification Code',
                },
              ],
            },
            {
              name: 'analytics',
              type: 'group',
              label: 'Analítica Web',
              fields: [
                {
                  name: 'gaMeasurementId',
                  type: 'text',
                  label: 'Google Analytics Measurement ID (G-XXXXXXXXXX)',
                },
                {
                  name: 'gtmId',
                  type: 'text',
                  label: 'Google Tag Manager ID (GTM-XXXXXXX)',
                },
                {
                  name: 'umamiWebsiteId',
                  type: 'text',
                  label: 'Umami Website ID',
                },
                {
                  name: 'umamiSrc',
                  type: 'text',
                  label: 'Umami Script Source URL',
                },
              ],
            },
            {
              name: 'consent',
              type: 'group',
              label: 'Aviso de Consentimiento / Cookies',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Habilitar Banner de Consentimiento',
                },
                {
                  name: 'privacyPolicyUrl',
                  type: 'text',
                  label: 'Enlace a Política de Privacidad',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
