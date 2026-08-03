'use client'

import { useState } from 'react'

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export const LogoutButton: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/users/logout', { method: 'POST' })
    } catch {
      // fallback: redirect anyway
    }
    window.location.href = '/admin/login'
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        margin: '0.5rem 0.75rem',
        borderRadius: 'var(--style-radius-m)',
        border: 'none',
        background: 'transparent',
        color: 'var(--theme-error-500, #dc2626)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        width: 'calc(100% - 1.5rem)',
      }}
    >
      <LogoutIcon />
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  )
}
