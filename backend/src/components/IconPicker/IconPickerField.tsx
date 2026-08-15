'use client'

import { Icon } from '@iconify/react'
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  fieldBaseClass,
  useField,
} from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { iconCategories, recommendedIcons } from './iconCatalog'

type LucideIcon = { body: string; width: number; height: number }
type IconSet = Record<string, LucideIcon>

const MAX_VISIBLE = 300

type Tab = {
  id: string
  label: string
  icons: string[]
}

const ALL_TAB_ID = 'all'
const RECOMMENDED_TAB_ID = 'recommended'

let iconCache: Promise<IconSet> | null = null

function loadLucideIcons(): Promise<IconSet> {
  if (!iconCache) {
    iconCache = import('@iconify-json/lucide/icons.json').then(
      (mod: {
        default: {
          icons: Record<string, { body: string }>
          width?: number
          height?: number
        }
      }) => {
        const { icons: raw, width = 24, height = 24 } = mod.default
        const normalized: IconSet = {}
        for (const [name, icon] of Object.entries(raw)) {
          normalized[name] = { body: icon.body, width, height }
        }
        return normalized
      },
    )
  }
  return iconCache
}

export const IconPickerField: TextFieldClientComponent = (props) => {
  const { field, path, readOnly } = props

  const label = field?.label
  const required = field?.required
  const description = field?.admin?.description

  const { value, setValue, showError } = useField<string | null | undefined>({ path })

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [icons, setIcons] = useState<IconSet | null>(null)
  const [activeTab, setActiveTab] = useState<string>(RECOMMENDED_TAB_ID)

  useEffect(() => {
    loadLucideIcons()
      .then(setIcons)
      .catch(() => setIcons({}))
  }, [])

  const tabs = useMemo<Tab[]>(() => {
    if (!icons) return []
    return [
      { id: RECOMMENDED_TAB_ID, label: 'Comúnmente usados', icons: recommendedIcons },
      { id: ALL_TAB_ID, label: 'Todos', icons: Object.keys(icons) },
      ...iconCategories.map((category) => ({
        id: category.id,
        label: category.label,
        icons: category.icons,
      })),
    ]
  }, [icons])

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  const visibleIcons = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q) {
      if (!icons) return []
      return Object.keys(icons)
        .filter((name) => name.includes(q))
        .slice(0, MAX_VISIBLE)
    }
    const tabIcons = activeTabData?.icons ?? []
    const available = icons ? tabIcons.filter((name) => name in icons) : []
    return available.slice(0, MAX_VISIBLE)
  }, [icons, query, activeTabData])

  const totalMatches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!icons) return 0
    if (q) {
      return Object.keys(icons).filter((name) => name.includes(q)).length
    }
    return activeTabData?.icons.filter((name) => name in icons).length ?? 0
  }, [icons, query, activeTabData])

  const iconData = value ? (icons?.[value] as LucideIcon | undefined) : undefined

  const currentValueInList = useMemo(() => {
    if (!icons || !value) return false
    const q = query.trim().toLowerCase()
    if (q) return value in icons
    return (activeTabData?.icons ?? []).includes(value)
  }, [icons, value, query, activeTabData])

  if (readOnly) {
    return (
      <div className={fieldBaseClass}>
        <FieldLabel label={label} required={required} path={path} />
        <div style={readOnlyValueStyle}>
          {iconData ? <Icon icon={iconData} width={22} height={22} /> : null}
          <span>{value || '—'}</span>
        </div>
        <FieldDescription description={description} path={path} />
      </div>
    )
  }

  const selectIcon = (name: string) => {
    setValue(name)
    setOpen(false)
  }

  return (
    <div className={fieldBaseClass}>
      <FieldLabel label={label} required={required} path={path} />
      <div style={triggerRowStyle}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ ...triggerButtonStyle, ...(value ? previewButtonStyle : {}) }}
          aria-label="Seleccionar icono"
        >
          {iconData ? (
            <Icon icon={iconData} width={22} height={22} />
          ) : (
            <span style={placeholderStyle}>Seleccionar icono</span>
          )}
        </button>
        {value ? <code style={nameStyle}>{value}</code> : null}
        {value ? (
          <button
            type="button"
            onClick={() => setValue(undefined)}
            style={clearButtonStyle}
            aria-label="Quitar icono"
          >
            Quitar
          </button>
        ) : null}
      </div>
      <FieldDescription description={description} path={path} />
      <FieldError message={showError ? 'Error' : undefined} path={path} showError={showError} />

      {open ? (
        <div style={overlayStyle} onClick={() => setOpen(false)}>
          <div style={panelStyle} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div style={panelHeaderStyle}>
              <strong>Seleccionar icono</strong>
              <button type="button" onClick={() => setOpen(false)} style={closeButtonStyle}>
                ✕
              </button>
            </div>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar en todos los iconos (ej: phone, globe…)"
              style={searchInputStyle}
            />
            <div style={tabsRowStyle}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    ...tabButtonStyle,
                    ...(activeTab === tab.id ? activeTabButtonStyle : {}),
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div style={gridStyle}>
              {visibleIcons.map((name) => {
                const icon = icons?.[name]
                if (!icon) return null
                return (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    onClick={() => selectIcon(name)}
                    style={{
                      ...cellButtonStyle,
                      ...(value === name ? selectedCellStyle : {}),
                    }}
                  >
                    <Icon icon={icon} width={20} height={20} />
                  </button>
                )
              })}
              {!icons ? (
                <div style={gridMessageStyle}>Cargando iconos…</div>
              ) : visibleIcons.length === 0 ? (
                <div style={gridMessageStyle}>Sin resultados</div>
              ) : null}
            </div>
            <div style={panelFooterStyle}>
              {icons
                ? query.trim()
                  ? `${totalMatches} resultados${totalMatches > MAX_VISIBLE ? ` · muestra los primeros ${MAX_VISIBLE}` : ''}`
                  : `${totalMatches} iconos${currentValueInList ? '' : ' · tu icono no está en esta categoría'}. Busca en todos o usa «Todos».`
                : 'Cargando iconos…'}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const triggerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginTop: '0.25rem',
}

const triggerButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '3rem',
  height: '3rem',
  padding: '0 0.75rem',
  border: '1px solid var(--theme-elevation-300)',
  borderRadius: '4px',
  background: 'var(--theme-elevation-50)',
  color: 'var(--theme-text)',
  cursor: 'pointer',
  transition: 'border-color 0.15s ease, background 0.15s ease',
}

const previewButtonStyle: CSSProperties = {
  background: 'var(--theme-elevation-100)',
}

const placeholderStyle: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--theme-elevation-500)',
}

const nameStyle: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--theme-text)',
  background: 'var(--theme-elevation-50)',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
}

const clearButtonStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--theme-error-400)',
  cursor: 'pointer',
  fontSize: '0.8125rem',
  padding: '0.25rem',
}

const readOnlyValueStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginTop: '0.25rem',
  color: 'var(--theme-elevation-500)',
  fontSize: '0.875rem',
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
}

const panelStyle: CSSProperties = {
  width: '100%',
  maxWidth: '38rem',
  maxHeight: '75vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'var(--theme-bg)',
  color: 'var(--theme-text)',
  border: '1px solid var(--theme-elevation-100)',
  borderRadius: '8px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
}

const panelHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1rem',
  borderBottom: '1px solid var(--theme-elevation-100)',
}

const closeButtonStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--theme-elevation-500)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  padding: '0.25rem',
}

const searchInputStyle: CSSProperties = {
  margin: '0.75rem 1rem 0.5rem',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--theme-elevation-300)',
  borderRadius: '4px',
  background: 'var(--theme-elevation-50)',
  color: 'var(--theme-text)',
  fontSize: '0.875rem',
  outline: 'none',
}

const tabsRowStyle: CSSProperties = {
  display: 'flex',
  gap: '0.25rem',
  padding: '0 1rem 0.5rem',
  overflowX: 'auto',
  flexShrink: 0,
}

const tabButtonStyle: CSSProperties = {
  flexShrink: 0,
  padding: '0.35rem 0.75rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'var(--theme-elevation-200)',
  borderRadius: '999px',
  background: 'transparent',
  color: 'var(--theme-elevation-500)',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
}

const activeTabButtonStyle: CSSProperties = {
  background: 'var(--theme-elevation-100)',
  color: 'var(--theme-text)',
  borderColor: 'var(--theme-elevation-300)',
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(2.75rem, 1fr))',
  gap: '0.25rem',
  padding: '0.25rem 1rem 0.75rem',
  overflowY: 'auto',
  alignContent: 'start',
}

const gridMessageStyle: CSSProperties = {
  gridColumn: '1 / -1',
  padding: '1.5rem 0',
  textAlign: 'center',
  color: 'var(--theme-elevation-500)',
  fontSize: '0.8125rem',
}

const cellButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '2.75rem',
  borderStyle: 'solid',
  borderWidth: '1px',
  borderColor: 'transparent',
  borderRadius: '4px',
  background: 'transparent',
  color: 'var(--theme-text)',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease',
}

const selectedCellStyle: CSSProperties = {
  borderColor: 'var(--theme-success-400)',
  background: 'var(--theme-success-50)',
}

const panelFooterStyle: CSSProperties = {
  padding: '0.5rem 1rem',
  borderTop: '1px solid var(--theme-elevation-100)',
  fontSize: '0.75rem',
  color: 'var(--theme-elevation-500)',
}
