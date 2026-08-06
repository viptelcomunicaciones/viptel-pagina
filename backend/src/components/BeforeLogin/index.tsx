'use client'

import React from 'react'

export const BeforeLogin: React.FC = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        marginBottom: '2rem',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #0055aa 0%, #003d7a 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '1.5rem',
          color: 'white',
          fontWeight: 700,
        }}
      >
        V
      </div>
      <h2
        style={{
          margin: '0 0 0.5rem',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--theme-text)',
        }}
      >
        Viptel Comunicaciones
      </h2>
      <p
        style={{
          margin: '0',
          fontSize: '0.875rem',
          color: 'var(--theme-elevation-500)',
        }}
      >
        Panel de administración
      </p>
    </div>
  )
}
