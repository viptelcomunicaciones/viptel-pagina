import type { GlobalConfig } from 'payload'

import { contentRoles } from '@/access/roleBased'
import { link } from '@/fields/link'
import { revalidateGlobal } from '@/hooks/revalidateFrontend'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Encabezado (Header)',
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
          label: 'Navegación y CTA',
          fields: [
            {
              name: 'navItems',
              type: 'array',
              localized: true,
              label: 'Elementos de Navegación',
              fields: [
                link({
                  appearances: false,
                }),
                {
                  name: 'children',
                  type: 'array',
                  label: 'Sub-items (Dropdown)',
                  maxRows: 10,
                  fields: [
                    link({
                      appearances: false,
                    }),
                  ],
                  admin: {
                    initCollapsed: true,
                  },
                },
              ],
              maxRows: 8,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/Header/RowLabel#RowLabel',
                },
              },
            },
            {
              name: 'cta',
              type: 'group',
              localized: true,
              label: 'Botón de Acción Principal (CTA)',
              fields: [
                {
                  name: 'showCta',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Mostrar Botón CTA',
                },
                link({
                  appearances: false,
                  overrides: {
                    admin: {
                      condition: (_, siblingData) => Boolean(siblingData?.showCta),
                    },
                  },
                }),
              ],
            },
          ],
        },
        {
          label: 'Opciones Globales de Barra',
          fields: [
            {
              name: 'position',
              type: 'select',
              options: [
                { label: 'Fijo (fixed)', value: 'fixed' },
                { label: 'Pegajoso (sticky)', value: 'sticky' },
                { label: 'Estático (static)', value: 'static' },
              ],
              defaultValue: 'sticky',
              label: 'Posición del Menú',
            },
            {
              name: 'shape',
              type: 'select',
              options: [
                { label: 'Barra completa (bar)', value: 'bar' },
                { label: 'Cápsula flotante (floating)', value: 'floating' },
              ],
              defaultValue: 'bar',
              label: 'Forma del Menú',
            },
            {
              name: 'size',
              type: 'select',
              options: [
                { label: 'Pequeño (sm)', value: 'sm' },
                { label: 'Mediano (md)', value: 'md' },
                { label: 'Grande (lg)', value: 'lg' },
              ],
              defaultValue: 'md',
              label: 'Altura / Tamaño',
            },
            {
              name: 'variant',
              type: 'select',
              options: [
                { label: 'Por defecto (default)', value: 'default' },
                { label: 'Sólido (solid)', value: 'solid' },
                { label: 'Transparente / Glass (transparent)', value: 'transparent' },
              ],
              defaultValue: 'default',
              label: 'Variante de Fondo',
            },
            {
              name: 'colorScheme',
              type: 'select',
              options: [
                { label: 'Por defecto (default)', value: 'default' },
                { label: 'Invertido para fondos oscuros (invert)', value: 'invert' },
              ],
              defaultValue: 'default',
              label: 'Esquema de Color',
            },
            {
              name: 'layout',
              type: 'select',
              options: [
                { label: 'Estándar (default)', value: 'default' },
                { label: 'Centrado (centered)', value: 'centered' },
                { label: 'Minimalista (minimal)', value: 'minimal' },
              ],
              defaultValue: 'default',
              label: 'Disposición de Elementos',
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
              label: 'Ancho Máximo',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showSearch',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Mostrar Botón de Búsqueda',
                },
                {
                  name: 'showThemeToggle',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Mostrar Selector Claro/Oscuro',
                },
                {
                  name: 'showThemeSelector',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Mostrar Paleta de Colores',
                },
                {
                  name: 'showLanguageSwitcher',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Mostrar Selector de Idioma',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showSocialLinks',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Mostrar Iconos de Redes Sociales',
                },
                {
                  name: 'showMobileMenu',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Habilitar Menú Móvil',
                },
                {
                  name: 'showActiveState',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Resaltar Página Activa',
                },
                {
                  name: 'hideLogo',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Ocultar Logo',
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'showScrollProgress',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Barra de Progreso de Lectura',
                },
                {
                  name: 'scrollProgressPosition',
                  type: 'select',
                  options: [
                    { label: 'Arriba (top)', value: 'top' },
                    { label: 'Abajo (bottom)', value: 'bottom' },
                  ],
                  defaultValue: 'bottom',
                  label: 'Posición de la Barra de Progreso',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.showScrollProgress),
                  },
                },
                {
                  name: 'autoHide',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Ocultar al hacer Scroll hacia Abajo (autoHide)',
                },
                {
                  name: 'invertOnReturn',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Invertir Color al Volver (invertOnReturn)',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
