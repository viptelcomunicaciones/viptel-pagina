'use client'
import { useEffect, useState } from 'react'
import { useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'

type DraftDoc = {
  id: string
  title?: string
  updatedAt?: string
}

export const MyDraftsWidget = () => {
  const { config } = useConfig()
  const [drafts, setDrafts] = useState<DraftDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const url = formatAdminURL({
          apiRoute: config.routes.api,
          path: '/posts',
        })
        const params = new URLSearchParams({
          where: JSON.stringify({
            _status: { equals: 'draft' },
          }),
          limit: '5',
          sort: '-updatedAt',
        })
        const res = await fetch(`${url}?${params.toString()}`, { credentials: 'include' })
        if (!res.ok) throw new Error(`Failed to fetch drafts: ${res.status}`)
        const data = await res.json()
        setDrafts(data.docs || [])
      } catch (e) {
        console.error('Failed to fetch drafts', e)
      } finally {
        setLoading(false)
      }
    }
    fetchDrafts()
  }, [config])

  if (loading) return <div className="p-4">Cargando borradores...</div>
  if (!drafts.length) return <div className="p-4 text-muted-foreground">Sin borradores recientes</div>

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Mis borradores recientes</h3>
      <ul className="space-y-1">
        {drafts.map((draft) => (
          <li key={draft.id}>
            <a
              href={`${config.routes.admin}/collections/posts/${draft.id}`}
              className="text-sm hover:underline"
            >
              {draft.title || draft.id}
            </a>
            <span className="text-xs text-muted-foreground">
              Actualizado {new Date(draft.updatedAt ?? Date.now()).toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}