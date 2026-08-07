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
  'services',
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

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Viptel3562/*-'
  const serviceApiKey = crypto.randomUUID().replace(/-/g, '')

  const [admin, websiteService] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Admin Viptel',
        email: process.env.SEED_ADMIN_EMAIL || 'viptelcomunicaciones@hotmail.com',
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

  payload.logger.info(`- Seeding services...`)

  type ServiceSeed = {
    slug: string
    es: { title: string; shortDescription: string }
    en: { title: string; shortDescription: string }
    children: {
      slug: string
      es: { title: string; shortDescription: string }
      en: { title: string; shortDescription: string }
    }[]
  }

  const serviceCategories: ServiceSeed[] = [
    {
      slug: 'viptel-pbx',
      es: { title: 'Viptel-PBX', shortDescription: 'Centrales telefónicas virtuales para empresas. Comunicación unificada sin hardware costoso.' },
      en: { title: 'Viptel-PBX', shortDescription: 'Virtual phone systems for businesses. Unified communication without expensive hardware.' },
      children: [
        { slug: 'basica', es: { title: 'PBX Básica', shortDescription: 'Hasta 10 extensiones. Ideal para pequeñas empresas y startups.' }, en: { title: 'Basic PBX', shortDescription: 'Up to 10 extensions. Ideal for small businesses and startups.' } },
        { slug: 'avanzada', es: { title: 'PBX Avanzada', shortDescription: 'Extensiones ilimitadas, IVR, grabación de llamadas y reportes.' }, en: { title: 'Advanced PBX', shortDescription: 'Unlimited extensions, IVR, call recording and reports.' } },
      ],
    },
    {
      slug: 'viptel-voip',
      es: { title: 'Viptel-VoIP', shortDescription: 'Telefonía IP de alta calidad. Minutos a todo destino y números DID locales e internacionales.' },
      en: { title: 'Viptel-VoIP', shortDescription: 'High-quality IP telephony. Minutes to all destinations and local/international DID numbers.' },
      children: [
        { slug: 'minutos', es: { title: 'Minutos VoIP', shortDescription: 'Terminación de llamadas nacionales e internacionales con la mejor tarifa.' }, en: { title: 'VoIP Minutes', shortDescription: 'National and international call termination at the best rate.' } },
        { slug: 'did', es: { title: 'Números DID', shortDescription: 'Números virtuales locales en Colombia y más de 50 países.' }, en: { title: 'DID Numbers', shortDescription: 'Local virtual numbers in Colombia and 50+ countries.' } },
      ],
    },
    {
      slug: 'viptel-web',
      es: { title: 'Viptel-Web', shortDescription: 'Desarrollo web profesional. Desde sitios informativos hasta tiendas en línea avanzadas.' },
      en: { title: 'Viptel-Web', shortDescription: 'Professional web development. From informational sites to advanced online stores.' },
      children: [
        { slug: 'sitio-informativo', es: { title: 'Sitio Informativo', shortDescription: 'Página web de una sola página con información de tu negocio y formulario de contacto.' }, en: { title: 'Informational Site', shortDescription: 'Single-page website with your business info and contact form.' } },
        { slug: 'sitio-corporativo', es: { title: 'Sitio Corporativo', shortDescription: 'Sitio web multi-página con blog, portafolio y diseño personalizado.' }, en: { title: 'Corporate Site', shortDescription: 'Multi-page website with blog, portfolio and custom design.' } },
        { slug: 'tienda-basica', es: { title: 'Tienda Básica', shortDescription: 'E-commerce con hasta 50 productos, pasarela de pagos y panel de administración.' }, en: { title: 'Basic Store', shortDescription: 'E-commerce with up to 50 products, payment gateway and admin panel.' } },
        { slug: 'tienda-avanzada', es: { title: 'Tienda Avanzada', shortDescription: 'E-commerce escalable con productos ilimitados, multi-idioma y funcionalidades avanzadas.' }, en: { title: 'Advanced Store', shortDescription: 'Scalable e-commerce with unlimited products, multi-language and advanced features.' } },
      ],
    },
    {
      slug: 'viptel-marketing',
      es: { title: 'Viptel-Marketing', shortDescription: 'Marketing digital multicanal. Email, WhatsApp, SMS y audio masivo para llegar a tu audiencia.' },
      en: { title: 'Viptel-Marketing', shortDescription: 'Multi-channel digital marketing. Email, WhatsApp, SMS and bulk audio to reach your audience.' },
      children: [
        { slug: 'email-masivo', es: { title: 'Email Masivo', shortDescription: 'Campañas de email marketing con segmentación, automatización y analítica.' }, en: { title: 'Bulk Email', shortDescription: 'Email marketing campaigns with segmentation, automation and analytics.' } },
        { slug: 'whatsapp-masivo', es: { title: 'WhatsApp Masivo', shortDescription: 'Mensajería masiva por WhatsApp Business API con plantillas aprobadas.' }, en: { title: 'Bulk WhatsApp', shortDescription: 'Bulk messaging via WhatsApp Business API with approved templates.' } },
        { slug: 'sms-masivo', es: { title: 'SMS Masivo', shortDescription: 'Envío de SMS transaccionales y promocionales a nivel nacional.' }, en: { title: 'Bulk SMS', shortDescription: 'Transactional and promotional SMS delivery nationwide.' } },
        { slug: 'audio-masivo', es: { title: 'Audio Masivo', shortDescription: 'Campañas de audio masivo con IVR para notificaciones y marketing telefónico.' }, en: { title: 'Bulk Audio', shortDescription: 'Bulk audio campaigns with IVR for notifications and phone marketing.' } },
      ],
    },
    {
      slug: 'viptel-software',
      es: { title: 'Viptel-Software', shortDescription: 'Software empresarial a la medida. Soluciones ERP y CRM adaptadas a tu negocio.' },
      en: { title: 'Viptel-Software', shortDescription: 'Custom enterprise software. ERP and CRM solutions tailored to your business.' },
      children: [
        { slug: 'erp', es: { title: 'ERP', shortDescription: 'Sistema de planificación de recursos empresariales. Facturación, inventario, contabilidad y más.' }, en: { title: 'ERP', shortDescription: 'Enterprise resource planning system. Invoicing, inventory, accounting and more.' } },
        { slug: 'crm', es: { title: 'CRM', shortDescription: 'Gestión de relaciones con clientes. Seguimiento de oportunidades, pipeline y automatización.' }, en: { title: 'CRM', shortDescription: 'Customer relationship management. Opportunity tracking, pipeline and automation.' } },
      ],
    },
  ]

  for (const cat of serviceCategories) {
    const parentDoc = await payload.create({
      collection: 'services',
      locale: 'es',
      depth: 0,
      data: {
        title: cat.es.title,
        slug: cat.slug,
        shortDescription: cat.es.shortDescription,
        _status: 'published',
      },
    })
    await payload.update({
      collection: 'services',
      id: parentDoc.id,
      locale: 'en',
      data: {
        title: cat.en.title,
        shortDescription: cat.en.shortDescription,
      },
    })

    for (const child of cat.children) {
      const childDoc = await payload.create({
        collection: 'services',
        locale: 'es',
        depth: 0,
        data: {
          title: child.es.title,
          slug: child.slug,
          shortDescription: child.es.shortDescription,
          parent: parentDoc.id,
          _status: 'published',
        },
      })
      await payload.update({
        collection: 'services',
        id: childDoc.id,
        locale: 'en',
        data: {
          title: child.en.title,
          shortDescription: child.en.shortDescription,
        },
      })
    }
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
          blockType: 'cards',
          heading: 'Nuestros servicios',
          cards: [
            {
              icon: 'phone',
              title: 'Telecomunicaciones',
              description: 'PBX en la nube, VoIP, redes y conectividad empresarial.',
              linkUrl: '/services',
            },
            {
              icon: 'globe',
              title: 'Desarrollo web',
              description: 'Sitios corporativos, aplicaciones web y e-commerce.',
              linkUrl: '/services',
            },
            {
              icon: 'trending-up',
              title: 'Marketing digital',
              description: 'SEO, publicidad digital y gestión de redes sociales.',
              linkUrl: '/services',
            },
          ],
        },
        {
          blockType: 'archive',
          introContent: paragraph('Proyectos que hemos desarrollado para nuestros clientes.'),
          populateBy: 'collection',
          relationTo: 'projects' as any,
          limit: 4,
        },
        {
          blockType: 'archive',
          introContent: paragraph('Artículos y noticias sobre tecnología y telecomunicaciones.'),
          populateBy: 'collection',
          relationTo: 'posts',
          limit: 4,
        },
        {
          blockType: 'cta',
          richText: heading('¿Listo para impulsar tu empresa?'),
          links: [
            {
              link: {
                type: 'custom' as const,
                label: 'Contáctanos',
                url: '/contact',
                appearance: 'default',
              },
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
          blockType: 'cards',
          heading: 'Our services',
          cards: [
            {
              icon: 'phone',
              title: 'Telecommunications',
              description: 'Cloud PBX, VoIP, networks and enterprise connectivity.',
              linkUrl: '/en/services',
            },
            {
              icon: 'globe',
              title: 'Web development',
              description: 'Corporate websites, web applications and e-commerce.',
              linkUrl: '/en/services',
            },
            {
              icon: 'trending-up',
              title: 'Digital marketing',
              description: 'SEO, digital advertising and social media management.',
              linkUrl: '/en/services',
            },
          ],
        },
        {
          blockType: 'archive',
          introContent: paragraph('Projects we have developed for our clients.'),
          populateBy: 'collection',
          relationTo: 'projects' as any,
          limit: 4,
        },
        {
          blockType: 'archive',
          introContent: paragraph('Articles and news about technology and telecommunications.'),
          populateBy: 'collection',
          relationTo: 'posts',
          limit: 4,
        },
        {
          blockType: 'cta',
          richText: heading('Ready to boost your business?'),
          links: [
            {
              link: {
                type: 'custom' as const,
                label: 'Contact us',
                url: '/en/contact',
                appearance: 'default',
              },
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

  payload.logger.info('- Seeding about page...')

  const aboutPage = await payload.create({
    collection: 'pages',
    locale: 'es',
    depth: 0,
    data: {
      title: 'Nosotros',
      slug: 'about',
      hero: { type: 'lowImpact', richText: heading('Viptel Comunicaciones') },
      layout: [
        { blockType: 'cards', heading: 'Que ofrecemos', cards: [
          { icon: 'phone', title: 'Telecomunicaciones', description: 'PBX en la nube, VoIP, redes y conectividad empresarial para tu negocio.', linkUrl: '/services' },
          { icon: 'globe', title: 'Desarrollo Web', description: 'Sitios corporativos, aplicaciones web y e-commerce a la medida.', linkUrl: '/services' },
          { icon: 'trending-up', title: 'Marketing Digital', description: 'SEO, publicidad digital y gestion de redes sociales.', linkUrl: '/services' },
        ]},
        { blockType: 'cards', heading: 'Nuestros principios', cards: [
          { icon: 'check-circle', title: 'Calidad Primero', description: 'Cada proyecto cumple con los mas altos estandares de la industria.', linkUrl: '' },
          { icon: 'users', title: 'Experiencia', description: 'Anos de experiencia en telecomunicaciones y tecnologia empresarial.', linkUrl: '' },
          { icon: 'lightbulb', title: 'Innovacion', description: 'Tecnologia de punta adaptada a las necesidades de tu empresa.', linkUrl: '' },
        ]},
        { blockType: 'faq', heading: 'Preguntas frecuentes', items: [
          { question: 'Que servicios ofrecen?', answer: paragraph('Ofrecemos telecomunicaciones (PBX, VoIP), desarrollo web, marketing digital y software empresarial.') },
          { question: 'Donde estan ubicados?', answer: paragraph('Nuestra oficina principal esta en Bogota, Colombia. Atendemos clientes en toda Latinoamerica.') },
          { question: 'Como empiezo un proyecto?', answer: paragraph('Contactanos a traves del formulario en la pagina de contacto y te responderemos en menos de 24 horas.') },
        ]},
        { blockType: 'content', columns: [{ size: 'full', richText: heading('Open Source') }] },
      ],
      meta: { title: 'Nosotros — Viptel Comunicaciones', description: 'Empresa colombiana de telecomunicaciones, desarrollo web y marketing digital. Bogota, Colombia.' },
      _status: 'published',
    },
  })

  await payload.update({ collection: 'pages', id: aboutPage.id, locale: 'en', data: {
    title: 'About Us',
    hero: { type: 'lowImpact', richText: heading('Viptel Comunicaciones') },
    layout: [
      { blockType: 'cards', heading: 'What we offer', cards: [
        { icon: 'phone', title: 'Telecommunications', description: 'Cloud PBX, VoIP, networks and enterprise connectivity.', linkUrl: '/en/services' },
        { icon: 'globe', title: 'Web Development', description: 'Corporate websites, web apps and custom e-commerce.', linkUrl: '/en/services' },
        { icon: 'trending-up', title: 'Digital Marketing', description: 'SEO, digital advertising and social media management.', linkUrl: '/en/services' },
      ]},
      { blockType: 'cards', heading: 'Our principles', cards: [
        { icon: 'check-circle', title: 'Quality First', description: 'Every project meets the highest industry standards.', linkUrl: '' },
        { icon: 'users', title: 'Experience', description: 'Years of experience in telecommunications and enterprise technology.', linkUrl: '' },
        { icon: 'lightbulb', title: 'Innovation', description: 'Cutting-edge technology tailored to your business needs.', linkUrl: '' },
      ]},
      { blockType: 'faq', heading: 'FAQ', items: [
        { question: 'What services do you offer?', answer: paragraph('We offer telecommunications (PBX, VoIP), web development, digital marketing and enterprise software.') },
        { question: 'Where are you located?', answer: paragraph('Our main office is in Bogota, Colombia. We serve clients across Latin America.') },
        { question: 'How do I start a project?', answer: paragraph('Contact us through the form on the contact page and we will respond within 24 hours.') },
      ]},
      { blockType: 'content', columns: [{ size: 'full', richText: heading('Open Source') }] },
    ],
    meta: { title: 'About Us — Viptel Comunicaciones', description: 'Colombian telecommunications, web development and digital marketing company. Bogota, Colombia.' },
  }})

  payload.logger.info('- Seeding contact page...')

  const contactPage = await payload.create({
    collection: 'pages',
    locale: 'es',
    depth: 0,
    data: {
      title: 'Contacto',
      slug: 'contact',
      hero: { type: 'lowImpact', richText: heading('Cuentanos sobre tu proyecto') },
      layout: [{ blockType: 'content', columns: [{ size: 'full', richText: paragraph('Completa el formulario y te contactaremos en menos de 24 horas.') }] }],
      meta: { title: 'Contacto — Viptel Comunicaciones', description: 'Contactanos para soluciones de telecomunicaciones, desarrollo web y marketing digital.' },
      _status: 'published',
    },
  })

  await payload.update({ collection: 'pages', id: contactPage.id, locale: 'en', data: {
    title: 'Contact',
    hero: { type: 'lowImpact', richText: heading('Tell us about your project') },
    meta: { title: 'Contact — Viptel Comunicaciones', description: 'Contact us for telecommunications, web development and digital marketing solutions.' },
  }})

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
