import 'dotenv/config'
import type { CollectionSlug, File, GlobalSlug, Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'

// Matches the richText field shape in the generated payload-types
// (root node + index signature)
type LexicalContent = {
  root: {
    type: string
    children: { [k: string]: unknown; type: never; version: number }[]
    direction: 'ltr' | 'rtl' | null
    format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
    indent: number
    version: number
  }
  [k: string]: unknown
}

const collections: CollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'projects',
  'redirects',
  'users',
]

const globals: GlobalSlug[] = ['header', 'footer']

// Simple lexical helpers for seed content (hand-built nodes — cast to the editor state type)
const paragraph = (text: string): LexicalContent => {
  const state = {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }

  return state as unknown as LexicalContent
}

const heading = (text: string, tag: 'h1' | 'h2' | 'h3' = 'h1'): LexicalContent => {
  const state = {
    root: {
      type: 'root',
      children: [
        {
          type: 'heading',
          tag,
          children: [
            { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }

  return state as unknown as LexicalContent
}

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding database...')

  payload.logger.info(`- Clearing collections and globals...`)

  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: { navItems: [] },
        depth: 0,
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => payload.db.deleteMany({ collection, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payload.collections[collection]?.config.versions))
      .map((collection) => payload.db.deleteVersions({ collection, where: {} })),
  )

  payload.logger.info(`- Seeding users...`)

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'viptel-dev-password'
  const serviceApiKey = crypto.randomUUID().replace(/-/g, '')

  const [admin, websiteService] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Admin Viptel',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@viptelcomunicaciones.com',
        password: adminPassword,
      },
    }),
    // Service account used by the Astro website to fetch drafts in preview mode
    // (the admin UI auto-generates the API key; via Local API we must set it explicitly)
    payload.create({
      collection: 'users',
      data: {
        name: 'Website Service',
        email: 'website-service@viptelcomunicaciones.com',
        password: `svc-${crypto.randomUUID()}`,
        enableAPIKey: true,
        apiKey: serviceApiKey,
      },
    }),
  ])

  payload.logger.info(`  → Admin: ${admin.email} / ${adminPassword}`)
  payload.logger.info(`  → PAYLOAD_API_KEY (poner en website/.env): ${websiteService.apiKey}`)

  payload.logger.info(`- Seeding media...`)

  const [hero1Buffer, image1Buffer, image2Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post2.webp',
    ),
  ])

  const [heroImage, image1, image2] = await Promise.all([
    payload.create({
      collection: 'media',
      data: { alt: 'Equipo de telecomunicaciones trabajando' },
      file: hero1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Red empresarial' },
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Desarrollo web' },
      file: image2Buffer,
    }),
  ])

  payload.logger.info(`- Seeding categories...`)

  const categoryData: Array<{ es: string; en: string; slug: string }> = [
    { es: 'Telecomunicaciones', en: 'Telecommunications', slug: 'telecomunicaciones' },
    { es: 'Desarrollo Web', en: 'Web Development', slug: 'desarrollo-web' },
    { es: 'Marketing Digital', en: 'Digital Marketing', slug: 'marketing-digital' },
  ]

  const categoryDocs = []
  for (const cat of categoryData) {
    const doc = await payload.create({
      collection: 'categories',
      locale: 'es',
      data: { title: cat.es, slug: cat.slug },
    })
    await payload.update({
      collection: 'categories',
      id: doc.id,
      locale: 'en',
      data: { title: cat.en },
    })
    categoryDocs.push(doc)
  }

  payload.logger.info(`- Seeding posts...`)

  const postsData: Array<{
    es: { title: string; slug: string; excerpt: string; content: string }
    en: { title: string; excerpt: string; content: string }
    heroImage: number
    category: number
    tags: string[]
  }> = [
    {
      es: {
        title: 'Por qué tu empresa necesita una PBX en la nube',
        slug: 'pbx-en-la-nube',
        excerpt: 'Las centrales telefónicas virtuales reducen costos y habilitan el trabajo remoto.',
        content:
          'Una PBX en la nube elimina la necesidad de hardware costoso en las oficinas y permite que los equipos atiendan llamadas desde cualquier lugar. En Viptel implementamos soluciones de VoIP empresarial en toda Latinoamérica.',
      },
      en: {
        title: 'Why your company needs a cloud PBX',
        excerpt: 'Virtual phone systems cut costs and enable remote work.',
        content:
          'A cloud PBX removes the need for expensive office hardware and lets teams answer calls from anywhere. At Viptel we deploy enterprise VoIP solutions across Latin America.',
      },
      heroImage: image1.id as number,
      category: categoryDocs[0].id as number,
      tags: ['VoIP', 'PBX'],
    },
    {
      es: {
        title: 'Tendencias de desarrollo web para 2026',
        slug: 'tendencias-desarrollo-web-2026',
        excerpt: 'SSR, islas de interactividad y CMS headless dominan el panorama.',
        content:
          'El desarrollo web moderno apuesta por frameworks de islas como Astro, contenido desacoplado con CMS headless y rendimiento medible. Estas son las tendencias que aplicamos en los proyectos de nuestros clientes.',
      },
      en: {
        title: 'Web development trends for 2026',
        excerpt: 'SSR, interactive islands and headless CMS dominate the landscape.',
        content:
          'Modern web development bets on island frameworks like Astro, decoupled content with headless CMS and measurable performance. These are the trends we apply in our client projects.',
      },
      heroImage: image2.id as number,
      category: categoryDocs[1].id as number,
      tags: ['Astro', 'Headless CMS'],
    },
  ]

  const postDocs = []
  for (const post of postsData) {
    const doc = await payload.create({
      collection: 'posts',
      locale: 'es',
      depth: 0,
      data: {
        title: post.es.title,
        slug: post.es.slug,
        excerpt: post.es.excerpt,
        content: paragraph(post.es.content),
        heroImage: post.heroImage,
        categories: [post.category],
        authors: [admin.id],
        tags: post.tags.map((tag) => ({ tag })),
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'posts',
      id: doc.id,
      locale: 'en',
      data: {
        title: post.en.title,
        excerpt: post.en.excerpt,
        content: paragraph(post.en.content),
      },
    })
    postDocs.push(doc)
  }

  await payload.update({
    collection: 'posts',
    id: postDocs[0].id,
    data: { relatedPosts: [postDocs[1].id] },
  })
  await payload.update({
    collection: 'posts',
    id: postDocs[1].id,
    data: { relatedPosts: [postDocs[0].id] },
  })

  payload.logger.info(`- Seeding projects...`)

  const projectsData: Array<{
    es: { title: string; slug: string; description: string; content: string }
    en: { title: string; description: string; content: string }
    client: string
    year: number
    coverImage: number
    tags: string[]
  }> = [
    {
      es: {
        title: 'Red corporativa para grupo empresarial',
        slug: 'red-corporativa-grupo-empresarial',
        description: 'Diseño e implementación de red de datos y voz para 12 sedes.',
        content:
          'Implementamos una red MPLS con redundancia y telefonía IP para un grupo empresarial con presencia en 5 ciudades de Colombia.',
      },
      en: {
        title: 'Corporate network for business group',
        description: 'Design and implementation of data and voice network for 12 offices.',
        content:
          'We deployed a redundant MPLS network with IP telephony for a business group with presence in 5 Colombian cities.',
      },
      client: 'Grupo Empresarial (confidencial)',
      year: 2025,
      coverImage: image1.id as number,
      tags: ['Redes', 'VoIP'],
    },
    {
      es: {
        title: 'E-commerce para marca de retail',
        slug: 'ecommerce-marca-retail',
        description: 'Tienda en línea con pasarela de pagos y estrategia SEO.',
        content:
          'Desarrollamos una tienda en línea de alto rendimiento con integración de pagos locales y una estrategia de marketing digital que duplicó el tráfico orgánico en 6 meses.',
      },
      en: {
        title: 'E-commerce for retail brand',
        description: 'Online store with payment gateway and SEO strategy.',
        content:
          'We built a high-performance online store with local payment integration and a digital marketing strategy that doubled organic traffic in 6 months.',
      },
      client: 'Marca de retail (confidencial)',
      year: 2026,
      coverImage: image2.id as number,
      tags: ['E-commerce', 'SEO'],
    },
  ]

  for (const project of projectsData) {
    const doc = await payload.create({
      collection: 'projects',
      locale: 'es',
      depth: 0,
      data: {
        title: project.es.title,
        slug: project.es.slug,
        description: project.es.description,
        content: paragraph(project.es.content),
        client: project.client,
        year: project.year,
        coverImage: project.coverImage,
        tags: project.tags.map((tag) => ({ tag })),
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'projects',
      id: doc.id,
      locale: 'en',
      data: {
        title: project.en.title,
        description: project.en.description,
        content: paragraph(project.en.content),
      },
    })
  }

  payload.logger.info(`- Seeding home page...`)

  const homePage = await payload.create({
    collection: 'pages',
    locale: 'es',
    depth: 0,
    data: {
      title: 'Inicio',
      slug: 'home',
      hero: {
        type: 'highImpact',
        richText: heading('Soluciones de telecomunicaciones y tecnología para tu empresa'),
        links: [
          {
            link: {
              type: 'custom' as const,
              label: 'Conoce nuestros servicios',
              url: '/services',
              appearance: 'default',
            },
          },
          {
            link: {
              type: 'custom' as const,
              label: 'Contáctanos',
              url: '/contact',
              appearance: 'outline',
            },
          },
        ],
        media: heroImage.id as number,
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: paragraph(
                'Viptel Comunicaciones es una empresa colombiana de telecomunicaciones, desarrollo web y marketing digital. Atendemos clientes en toda Latinoamérica desde Bogotá.',
              ),
            },
          ],
        },
        {
          blockType: 'cards',
          heading: 'Nuestros servicios',
          cards: [
            {
              title: 'Telecomunicaciones',
              description: 'PBX en la nube, VoIP, redes y conectividad empresarial.',
              linkUrl: '/services',
            },
            {
              title: 'Desarrollo web',
              description: 'Sitios corporativos, aplicaciones web y e-commerce.',
              linkUrl: '/services',
            },
            {
              title: 'Marketing digital',
              description: 'SEO, publicidad digital y gestión de redes sociales.',
              linkUrl: '/services',
            },
          ],
        },
      ],
      meta: {
        title: 'Viptel Comunicaciones — Telecomunicaciones, desarrollo web y marketing digital',
        description:
          'Empresa colombiana de telecomunicaciones: PBX, VoIP, redes, desarrollo web y marketing digital. Bogotá, Colombia.',
      },
      _status: 'published',
    },
  })

  await payload.update({
    collection: 'pages',
    id: homePage.id,
    locale: 'en',
    data: {
      title: 'Home',
      hero: {
        type: 'highImpact',
        richText: heading('Telecommunications and technology solutions for your business'),
        links: [
          {
            link: {
              type: 'custom' as const,
              label: 'Explore our services',
              url: '/en/services',
              appearance: 'default',
            },
          },
          {
            link: {
              type: 'custom' as const,
              label: 'Contact us',
              url: '/en/contact',
              appearance: 'outline',
            },
          },
        ],
        media: heroImage.id as number,
      },
      layout: [
        {
          blockType: 'content',
          columns: [
            {
              size: 'full',
              richText: paragraph(
                'Viptel Comunicaciones is a Colombian telecommunications, web development and digital marketing company. We serve clients across Latin America from Bogotá.',
              ),
            },
          ],
        },
        {
          blockType: 'cards',
          heading: 'Our services',
          cards: [
            {
              title: 'Telecommunications',
              description: 'Cloud PBX, VoIP, networks and enterprise connectivity.',
              linkUrl: '/en/services',
            },
            {
              title: 'Web development',
              description: 'Corporate websites, web applications and e-commerce.',
              linkUrl: '/en/services',
            },
            {
              title: 'Digital marketing',
              description: 'SEO, digital advertising and social media management.',
              linkUrl: '/en/services',
            },
          ],
        },
      ],
      meta: {
        title: 'Viptel Comunicaciones — Telecommunications, web development and digital marketing',
        description:
          'Colombian telecommunications company: PBX, VoIP, networks, web development and digital marketing. Bogotá, Colombia.',
      },
    },
  })

  payload.logger.info(`- Seeding globals...`)

  const headerNav = {
    es: [
      { label: 'Inicio', url: '/' },
      { label: 'Servicios', url: '/services' },
      { label: 'Portafolio', url: '/projects' },
      { label: 'Blog', url: '/blog' },
      { label: 'Contacto', url: '/contact' },
    ],
    en: [
      { label: 'Home', url: '/en' },
      { label: 'Services', url: '/en/services' },
      { label: 'Portfolio', url: '/en/projects' },
      { label: 'Blog', url: '/en/blog' },
      { label: 'Contact', url: '/en/contact' },
    ],
  }

  await payload.updateGlobal({
    slug: 'header',
    locale: 'es',
    data: {
      navItems: headerNav.es.map((item) => ({
        link: { type: 'custom' as const, label: item.label, url: item.url },
      })),
    },
  })
  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    data: {
      navItems: headerNav.en.map((item) => ({
        link: { type: 'custom' as const, label: item.label, url: item.url },
      })),
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'es',
    data: {
      navItems: [
        { link: { type: 'custom' as const, label: 'Servicios', url: '/services' } },
        { link: { type: 'custom' as const, label: 'Portafolio', url: '/projects' } },
        { link: { type: 'custom' as const, label: 'Contacto', url: '/contact' } },
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    data: {
      navItems: [
        { link: { type: 'custom' as const, label: 'Services', url: '/en/services' } },
        { link: { type: 'custom' as const, label: 'Portfolio', url: '/en/projects' } },
        { link: { type: 'custom' as const, label: 'Contact', url: '/en/contact' } },
      ],
    },
  })

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}

// Standalone execution: pnpm seed
const payload = await getPayload({ config })
await seed(payload)
process.exit(0)
