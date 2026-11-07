import type { GlobalConfig } from 'payload'

import { contentRoles } from '@/access/roleBased'
import { link } from '@/fields/link'
import { revalidateGlobal } from '@/hooks/revalidateFrontend'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pie de Página (Footer)',
  access: {
    read: () => true,
    update: contentRoles,
  },
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Navegación y Enlaces',
          fields: [
            {
              name: 'navItems',
              type: 'array',
              localized: true,
              label: 'Enlaces de Navegación Simple',
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 8,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/Footer/RowLabel#RowLabel',
                },
              },
            },
            {
              name: 'linkGroups',
              type: 'array',
              localized: true,
              label: 'Grupos de Enlaces (Columnas)',
              admin: {
                condition: (data) => data?.layout === 'columns',
                initCollapsed: true,
                description: 'Grupos de enlaces organizados por columnas cuando el layout es "Columnas".',
              },
              validate: (value, { data }) => {
                const layout = (data as { layout?: string } | undefined)?.layout
                if (layout === 'columns' && (!value || (Array.isArray(value) && value.length === 0))) {
                  return 'Debe agregar al menos un grupo de enlaces cuando el layout es "Columnas".'
                }
                return true
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: 'Título de la Columna',
                },
                {
                  name: 'links',
                  type: 'array',
                  label: 'Enlaces de la Columna',
                  fields: [
                    link({
                      appearances: false,
                    }),
                  ],
                },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              localized: true,
              label: 'Enlaces Legales (Privacidad, Términos)',
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 6,
              admin: {
                initCollapsed: true,
              },
            },
          ],
        },
        {
          label: 'Diseño y Créditos',
          fields: [
            {
              name: 'layout',
              type: 'select',
              options: [
                { label: 'Columnas (columns)', value: 'columns' },
                { label: 'Centrado (centered)', value: 'centered' },
                { label: 'Simple (simple)', value: 'simple' },
                { label: 'Apilado (stacked)', value: 'stacked' },
                { label: 'Minimalista (minimal)', value: 'minimal' },
              ],
              defaultValue: 'columns',
              label: 'Disposición del Footer (Layout)',
            },
            {
              name: 'columns',
              type: 'select',
              options: [
                { label: '2 Columnas', value: '2' },
                { label: '3 Columnas', value: '3' },
                { label: '4 Columnas', value: '4' },
              ],
              defaultValue: '3',
              label: 'Número de Columnas',
              admin: {
                condition: (data) => data?.layout === 'columns',
              },
            },
            {
              name: 'background',
              type: 'select',
              options: [
                { label: 'Por defecto (default)', value: 'default' },
                { label: 'Fondo Secundario (secondary)', value: 'secondary' },
                { label: 'Invertido / Oscuro (invert)', value: 'invert' },
              ],
              defaultValue: 'default',
              label: 'Color de Fondo',
            },
            {
              name: 'maxWidth',
              type: 'select',
              options: [
                { label: '4xl', value: '4xl' },
                { label: '5xl', value: '5xl' },
                { label: '6xl (Predeterminado)', value: '6xl' },
                { label: '7xl', value: '7xl' },
                { label: 'Ancho Completo (full)', value: 'full' },
              ],
              defaultValue: '6xl',
              label: 'Ancho Máximo del Contenedor',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showSocial',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Mostrar Redes Sociales',
                },
                {
                  name: 'showCopyright',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Mostrar Línea de Copyright',
                },
                {
                  name: 'hideLogo',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Ocultar Logo en el Footer',
                },
              ],
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              label: 'Eslogan / Tagline bajo el Logo',
            },
            {
              name: 'copyright',
              type: 'text',
              localized: true,
              label: 'Texto de Copyright / Créditos (Soporta {year} y {siteName})',
            },
          ],
        },
      ],
    },
  ],
}
