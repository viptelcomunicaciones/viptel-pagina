'use client'

import React from 'react'

export const BeforeDashboard: React.FC = () => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0055aa 0%, #003d7a 100%)',
          borderRadius: '8px',
          padding: '2rem',
          color: 'white',
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
          Viptel Comunicaciones
        </h1>
        <p style={{ margin: '0', opacity: 0.9, fontSize: '1rem' }}>
          Panel de administración — Gestión de contenido del sitio web
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.875rem', opacity: 0.8 }}>
          <span>Telecomunicaciones</span>
          <span>·</span>
          <span>Desarrollo Web</span>
          <span>·</span>
          <span>Marketing Digital</span>
          <span>·</span>
          <span>Software</span>
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        <QuickCard icon="📄" title="Páginas" description="Gestiona las páginas del sitio" />
        <QuickCard icon="✍️" title="Blog" description="Publica artículos y noticias" />
        <QuickCard icon="🖼️" title="Portafolio" description="Muestra tus proyectos" />
        <QuickCard icon="🛠️" title="Servicios" description="Catálogo de servicios" />
      </div>
    </div>
  )
}

function QuickCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        borderRadius: '8px',
        padding: '1.25rem',
        border: '1px solid var(--theme-elevation-100)',
      }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.938rem', fontWeight: 600 }}>{title}</h3>
      <p style={{ margin: '0', fontSize: '0.8125rem', color: 'var(--theme-elevation-500)' }}>
        {description}
      </p>
    </div>
  )
}
