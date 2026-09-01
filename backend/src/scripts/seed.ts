import 'dotenv/config'
import type { CollectionSlug, File, GlobalSlug, Payload } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'
import { slugify } from '../collections/Tags'

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
  'post-types',
  'project-categories',
  'project-types',
  'projects',
  'redirects',
  'services',
  'tags',
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

type SeedBlock = ['p', string] | ['h2', string] | ['h3', string]

// Build richText content from an ordered list of paragraphs and headings.
// Posts/projects use several H2/H3 sections so the TOC ("En esta página")
// has something to render when `toc` is enabled or inherited.
const sections = (...blocks: SeedBlock[]): LexicalContent => {
  const state = {
    root: {
      type: 'root',
      children: blocks.map(([type, text]) =>
        type === 'p'
          ? {
              type: 'paragraph',
              children: [
                { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            }
          : {
              type: 'heading',
              tag: type,
              children: [
                { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
      ),
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

  // The MCP plugin's api-keys collection has a NOT NULL relationship to users.
  // Clear it first so deleting users does not violate the constraint.
  await payload.db.deleteMany({ collection: 'payload-mcp-api-keys' as never, where: {} })

  for (const collection of collections) {
    await payload.db.deleteMany({ collection, where: {} })
  }

  for (const collection of collections.filter((collection) =>
    Boolean(payload.collections[collection]?.config.versions),
  )) {
    await payload.db.deleteVersions({ collection, where: {} })
  }

  payload.logger.info(`- Seeding users...`)

  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Viptel3562/*-'
  const serviceApiKey =
    process.env.SEED_SERVICE_API_KEY || crypto.randomUUID().replace(/-/g, '')

  const [admin, websiteService] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Admin Viptel',
        email: process.env.SEED_ADMIN_EMAIL || 'viptelcomunicaciones@hotmail.com',
        password: adminPassword,
        roles: ['admin'],
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
        roles: ['editor'],
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

  payload.logger.info(`- Seeding post types...`)

  type PostTypeSeed = { es: string; en: string; slug: string; icon: string; position: number }

  const postTypesData: PostTypeSeed[] = [
    { es: 'Guía y tutorial', en: 'Guide & tutorial', slug: 'guias', icon: 'book', position: 1 },
    { es: 'Caso de éxito', en: 'Case study', slug: 'casos-exito', icon: 'trending-up', position: 2 },
    { es: 'Guía de compra', en: 'Buying guide', slug: 'guias-compra', icon: 'shopping-bag', position: 3 },
    { es: 'Noticia', en: 'News', slug: 'noticias', icon: 'newspaper', position: 4 },
  ]

  const postTypeIdBySlug = new Map<string, number>()
  for (const type of postTypesData) {
    const doc = await payload.create({
      collection: 'post-types',
      locale: 'es',
      data: { title: type.es, slug: type.slug, icon: type.icon, position: type.position },
    })
    await payload.update({
      collection: 'post-types',
      id: doc.id,
      locale: 'en',
      data: { title: type.en },
    })
    postTypeIdBySlug.set(type.slug, doc.id as number)
  }

  payload.logger.info(`- Seeding project types...`)

  type ProjectTypeSeed = { es: string; en: string; slug: string; icon: string; position: number }

  const projectTypesData: ProjectTypeSeed[] = [
    { es: 'Desarrollo Web', en: 'Web Development', slug: 'desarrollo-web', icon: 'globe', position: 1 },
    { es: 'Telecomunicaciones', en: 'Telecommunications', slug: 'telecomunicaciones', icon: 'phone', position: 2 },
    { es: 'Software Empresarial', en: 'Enterprise Software', slug: 'software-empresarial', icon: 'code', position: 3 },
    { es: 'Marketing Digital', en: 'Digital Marketing', slug: 'marketing-digital', icon: 'trending-up', position: 4 },
  ]

  const projectTypeIdBySlug = new Map<string, number>()
  for (const type of projectTypesData) {
    const doc = await payload.create({
      collection: 'project-types',
      locale: 'es',
      data: { title: type.es, slug: type.slug, icon: type.icon, position: type.position },
    })
    await payload.update({
      collection: 'project-types',
      id: doc.id,
      locale: 'en',
      data: { title: type.en },
    })
    projectTypeIdBySlug.set(type.slug, doc.id as number)
  }

  payload.logger.info(`- Seeding categories...`)

  type SubcategorySeed = { es: string; en: string; slug: string }
  type CategorySeed = { es: string; en: string; slug: string; subcategories: SubcategorySeed[] }

  const categoryData: CategorySeed[] = [
    {
      es: 'Telecomunicaciones',
      en: 'Telecommunications',
      slug: 'telecomunicaciones',
      subcategories: [
        { es: 'VoIP', en: 'VoIP', slug: 'voip' },
        { es: 'PBX y centrales telefónicas', en: 'PBX & phone systems', slug: 'pbx-centrales' },
        { es: 'Redes y conectividad', en: 'Networking & connectivity', slug: 'redes-conectividad' },
      ],
    },
    {
      es: 'Desarrollo Web',
      en: 'Web Development',
      slug: 'desarrollo-web',
      subcategories: [
        { es: 'Aplicaciones web', en: 'Web applications', slug: 'aplicaciones-web' },
        { es: 'E-commerce', en: 'E-commerce', slug: 'e-commerce' },
      ],
    },
    {
      es: 'Marketing Digital',
      en: 'Digital Marketing',
      slug: 'marketing-digital',
      subcategories: [
        { es: 'SEO', en: 'SEO', slug: 'seo' },
        { es: 'Publicidad digital', en: 'Digital advertising', slug: 'publicidad-digital' },
      ],
    },
  ]

  const categoryIdBySlug = new Map<string, number>()
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
    categoryIdBySlug.set(cat.slug, doc.id as number)
    for (const sub of cat.subcategories) {
      const subDoc = await payload.create({
        collection: 'categories',
        locale: 'es',
        data: { title: sub.es, slug: sub.slug, parent: doc.id as number },
      })
      await payload.update({
        collection: 'categories',
        id: subDoc.id,
        locale: 'en',
        data: { title: sub.en },
      })
      categoryIdBySlug.set(sub.slug, subDoc.id as number)
    }
  }

  payload.logger.info(`- Seeding project categories...`)

  type ProjectSubcategorySeed = { es: string; en: string; slug: string }
  type ProjectCategorySeed = { es: string; en: string; slug: string; subcategories: ProjectSubcategorySeed[] }

  const projectCategoryData: ProjectCategorySeed[] = [
    {
      es: 'Telecomunicaciones',
      en: 'Telecommunications',
      slug: 'telecomunicaciones',
      subcategories: [
        { es: 'PBX y VoIP', en: 'PBX & VoIP', slug: 'pbx-voip' },
        { es: 'Redes y conectividad', en: 'Networking & connectivity', slug: 'redes-conectividad' },
      ],
    },
    {
      es: 'Desarrollo Web',
      en: 'Web Development',
      slug: 'desarrollo-web',
      subcategories: [
        { es: 'E-commerce', en: 'E-commerce', slug: 'e-commerce' },
        { es: 'Aplicaciones web', en: 'Web applications', slug: 'aplicaciones-web' },
      ],
    },
    {
      es: 'Software Empresarial',
      en: 'Enterprise Software',
      slug: 'software-empresarial',
      subcategories: [
        { es: 'ERP', en: 'ERP', slug: 'erp' },
        { es: 'CRM', en: 'CRM', slug: 'crm' },
      ],
    },
    {
      es: 'Marketing Digital',
      en: 'Digital Marketing',
      slug: 'marketing-digital',
      subcategories: [
        { es: 'SEO', en: 'SEO', slug: 'seo' },
        { es: 'Publicidad digital', en: 'Digital advertising', slug: 'publicidad-digital' },
      ],
    },
  ]

  const projectCategoryIdBySlug = new Map<string, number>()
  for (const cat of projectCategoryData) {
    const doc = await payload.create({
      collection: 'project-categories',
      locale: 'es',
      data: { title: cat.es, slug: cat.slug },
    })
    await payload.update({
      collection: 'project-categories',
      id: doc.id,
      locale: 'en',
      data: { title: cat.en },
    })
    projectCategoryIdBySlug.set(cat.slug, doc.id as number)
    for (const sub of cat.subcategories) {
      const subDoc = await payload.create({
        collection: 'project-categories',
        locale: 'es',
        data: { title: sub.es, slug: sub.slug, parent: doc.id as number },
      })
      await payload.update({
        collection: 'project-categories',
        id: subDoc.id,
        locale: 'en',
        data: { title: sub.en },
      })
      projectCategoryIdBySlug.set(sub.slug, subDoc.id as number)
    }
  }

  payload.logger.info(`- Seeding tags...`)

  // Tags are a dedicated collection now. `ensureTag` lazily creates a tag doc
  // (cached by name) and returns its id, so posts and projects can reference
  // the same tag doc instead of duplicated free-text arrays.
  const tagIdByName = new Map<string, number>()
  const ensureTag = async (tag: string): Promise<number> => {
    const existing = tagIdByName.get(tag)
    if (existing) return existing
    const doc = await payload.create({
      collection: 'tags',
      data: { name: tag, slug: slugify(tag) },
    })
    tagIdByName.set(tag, doc.id as number)
    return doc.id as number
  }

  payload.logger.info(`- Seeding posts...`)

  type PostSeed = {
    es: { title: string; slug: string; excerpt: string; content: SeedBlock[] }
    en: { title: string; excerpt: string; content: SeedBlock[] }
    heroImage: number
    postType: string
    category: string
    tags: string[]
    toc?: 'inherit' | 'enabled' | 'disabled'
  }

  const postsData: PostSeed[] = [
    {
      es: {
        title: 'La guía definitiva de VoIP para pymes',
        slug: 'voip-pymes-2026',
        excerpt: 'Telefonía por internet de bajo costo, sin hardware y lista para el trabajo remoto.',
        content: [
          ['p', 'La voz sobre IP (VoIP) convirtió la telefonía empresarial en un servicio de software. Hoy cualquier pyme puede operar una central telefónica completa sin comprar equipos costosos ni pagar líneas analógicas por extensión.'],
          ['h2', '¿Qué es VoIP y por qué importa?'],
          ['p', 'VoIP transporta las llamadas por la misma red que usas para navegar. Esto elimina la red telefónica tradicional y reduce drásticamente los costos de larga distancia y mantenimiento.'],
          ['h2', 'Beneficios para tu empresa'],
          ['p', 'Entre las ventajas están las llamadas ilimitadas entre sedes, el registro de llamadas, la integración con CRM y la posibilidad de atender desde cualquier dispositivo con conexión a internet.'],
          ['h3', 'Ahorro real'],
          ['p', 'Las pymes que migran a VoIP suelen reducir su factura de telecomunicaciones entre un 40 % y un 60 % en el primer año.'],
        ],
      },
      en: {
        title: 'The definitive VoIP guide for SMBs',
        excerpt: 'Low-cost internet telephony, no hardware, ready for remote work.',
        content: [
          ['p', 'Voice over IP (VoIP) turned business telephony into a software service. Today any SMB can run a complete phone system without buying expensive equipment or paying for analog lines per extension.'],
          ['h2', 'What is VoIP and why it matters'],
          ['p', 'VoIP carries calls over the same network you use to browse. This removes the traditional phone network and dramatically cuts long-distance and maintenance costs.'],
          ['h2', 'Benefits for your business'],
          ['p', 'Advantages include unlimited calls between offices, call recording, CRM integration and the ability to answer from any internet-connected device.'],
          ['h3', 'Real savings'],
          ['p', 'SMBs that move to VoIP typically cut their telecommunications bill by 40% to 60% in the first year.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'voip',
      postType: 'guias',
      tags: ['VoIP', 'PBX'],
      toc: 'enabled',
    },
    {
      es: {
        title: 'Cómo elegir tu framework de frontend en 2026',
        slug: 'elegir-framework-frontend',
        excerpt: 'React, Vue, Svelte o Astro: cómo decidir sin caer en la moda.',
        content: [
          ['p', 'El ecosistema de frontend cambia rápido y elegir framework se siente como apostar. La clave no es el más popular, sino el que mejor se adapta al contenido, el equipo y el rendimiento que necesitas.'],
          ['h2', 'Frameworks de islas y contenido estático'],
          ['p', 'Astro y similares envían cero JavaScript por defecto y añaden interactividad solo donde hace falta. Son ideales para sitios con mucho contenido y SEO exigente.'],
          ['h2', 'Aplicaciones ricas y estado complejo'],
          ['p', 'Si tu producto es una aplicación con paneles, formularios intensivos o colaboración en tiempo real, un SPA con React o Vue sigue siendo la opción natural.'],
          ['h3', 'Rendimiento medible'],
          ['p', 'Mide Core Web Vitals antes y después de decidir. Un framework no vale la pena si degrada la experiencia del usuario.'],
        ],
      },
      en: {
        title: 'How to choose your frontend framework in 2026',
        excerpt: 'React, Vue, Svelte or Astro: how to decide without chasing hype.',
        content: [
          ['p', 'The frontend ecosystem changes fast and choosing a framework feels like a bet. The key is not the most popular one but the best fit for your content, team and performance needs.'],
          ['h2', 'Island frameworks and static content'],
          ['p', 'Astro and similar tools ship zero JavaScript by default and add interactivity only where needed. They are ideal for content-heavy sites with demanding SEO.'],
          ['h2', 'Rich applications and complex state'],
          ['p', 'If your product is an application with dashboards, intense forms or real-time collaboration, a React or Vue SPA remains the natural choice.'],
          ['h3', 'Measurable performance'],
          ['p', 'Measure Core Web Vitals before and after deciding. A framework is not worth it if it degrades the user experience.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'desarrollo-web',
      postType: 'guias',
      tags: ['Frontend', 'Desarrollo Web'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Ciberseguridad para pymes: lo esencial',
        slug: 'ciberseguridad-pymes',
        excerpt: 'Las pymes son el objetivo favorito de los atacantes. Protégete con lo básico.',
        content: [
          ['p', 'Los ciberdelincuentes no distinguen por tamaño: las pymes son atacadas constantemente porque suelen tener menos defensas. La buena noticia es que lo esencial es accesible.'],
          ['h2', 'Autenticación de dos factores y contraseñas fuertes'],
          ['p', 'Habilitar 2FA en correo, sistemas de facturación y acceso remoto bloquea la mayoría de los ataques de credenciales robadas.'],
          ['h2', 'Copias de seguridad 3-2-1'],
          ['p', 'Guarda tres copias de tu información, en dos soportes distintos, con una copia fuera de la oficina. Un ransomware deja de ser fatal cuando puedes restaurar.'],
          ['h3', 'Capacita a tu equipo'],
          ['p', 'El error humano causa la mayoría de los incidentes. Sesiones breves de phishing simulado reducen el riesgo notablemente.'],
        ],
      },
      en: {
        title: 'Cybersecurity for SMBs: the essentials',
        excerpt: 'SMBs are the favorite target of attackers. Protect yourself with the basics.',
        content: [
          ['p', 'Cybercriminals do not distinguish by size: SMBs are constantly attacked because they usually have fewer defenses. The good news is that the essentials are affordable.'],
          ['h2', 'Two-factor authentication and strong passwords'],
          ['p', 'Enabling 2FA on email, invoicing systems and remote access blocks most stolen-credential attacks.'],
          ['h2', '3-2-1 backups'],
          ['p', 'Keep three copies of your data, on two different media, with one copy off-site. Ransomware stops being fatal when you can restore.'],
          ['h3', 'Train your team'],
          ['p', 'Human error causes most incidents. Short simulated-phishing sessions noticeably reduce risk.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'redes-conectividad',
      postType: 'guias',
      tags: ['Ciberseguridad', 'Seguridad'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Inteligencia artificial aplicada al desarrollo de software',
        slug: 'ia-desarrollo-software',
        excerpt: 'Cómo la IA acelera el ciclo de desarrollo sin reemplazar al equipo.',
        content: [
          ['p', 'La IA generativa cambió la forma de escribir código, documentar y probar. Usada bien, multiplica la productividad del equipo y reduce errores repetitivos.'],
          ['h2', 'Asistentes de código y revisión'],
          ['p', 'Herramientas de autocompletado y revisión automatizada permiten a los desarrolladores concentrarse en la lógica de negocio y la arquitectura.'],
          ['h2', 'Pruebas y documentación generadas'],
          ['p', 'La IA puede proponer casos de prueba y borradores de documentación que el equipo revisa y valida, ahorrando horas de trabajo manual.'],
          ['h3', 'El humano sigue decidiendo'],
          ['p', 'La IA propone; el equipo valida. La revisión humana sigue siendo imprescindible para la calidad y la seguridad.'],
        ],
      },
      en: {
        title: 'AI applied to software development',
        excerpt: 'How AI accelerates the development cycle without replacing the team.',
        content: [
          ['p', 'Generative AI changed how we write code, document and test. Used well, it multiplies team productivity and reduces repetitive errors.'],
          ['h2', 'Code assistants and review'],
          ['p', 'Autocomplete and automated-review tools let developers focus on business logic and architecture.'],
          ['h2', 'Generated tests and documentation'],
          ['p', 'AI can propose test cases and documentation drafts that the team reviews and validates, saving hours of manual work.'],
          ['h3', 'Humans still decide'],
          ['p', 'AI proposes; the team validates. Human review remains essential for quality and security.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['Inteligencia Artificial', 'Desarrollo Web'],
      toc: 'enabled',
    },
    {
      es: {
        title: 'Tendencias de UI/UX para 2026',
        slug: 'tendencias-ui-ux-2026',
        excerpt: 'Diseño accesible, micro-interacciones y personalización sin fricción.',
        content: [
          ['p', 'El diseño de interfaces en 2026 prioriza la claridad sobre el espectáculo. Los usuarios valoran productos que se entienden solos y respetan su tiempo.'],
          ['h2', 'Accesibilidad como estándar'],
          ['p', 'Contrastes correctos, navegación por teclado y lectores de pantalla dejaron de ser opcionales. La accesibilidad mejora la experiencia de todos.'],
          ['h2', 'Micro-interacciones con propósito'],
          ['p', 'Las animaciones pequeñas guían al usuario y confirman acciones, siempre que respeten prefers-reduced-motion.'],
          ['h3', 'Personalización sin fricción'],
          ['p', 'Adaptar el contenido al contexto del usuario mejora la conversión sin exigir formularios largos.'],
        ],
      },
      en: {
        title: 'UI/UX trends for 2026',
        excerpt: 'Accessible design, micro-interactions and frictionless personalization.',
        content: [
          ['p', 'Interface design in 2026 prioritizes clarity over spectacle. Users value products that explain themselves and respect their time.'],
          ['h2', 'Accessibility as a standard'],
          ['p', 'Correct contrast, keyboard navigation and screen readers are no longer optional. Accessibility improves everyone experience.'],
          ['h2', 'Purposeful micro-interactions'],
          ['p', 'Small animations guide users and confirm actions, as long as they respect prefers-reduced-motion.'],
          ['h3', 'Frictionless personalization'],
          ['p', 'Adapting content to the user context improves conversion without demanding long forms.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'desarrollo-web',
      postType: 'noticias',
      tags: ['UX/UI', 'Diseño'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Edge computing y la conectividad del futuro',
        slug: 'edge-computing-conectividad',
        excerpt: 'Procesar cerca del usuario reduce latencia y habilita nuevas aplicaciones.',
        content: [
          ['p', 'El edge computing lleva el procesamiento al borde de la red, cerca de donde se generan los datos. Para las empresas es la diferencia entre aplicaciones lentas y en tiempo real.'],
          ['h2', 'Latencia y experiencia de usuario'],
          ['p', 'Procesar en el borde recorta la distancia física entre el usuario y el servidor, clave para videollamadas, IoT y comercio en línea.'],
          ['h2', 'Casos de uso empresarial'],
          ['p', 'Monitoreo de flotas, sensores industriales y redes de sucursales se benefician del procesamiento local con respaldo en la nube.'],
          ['h3', 'Seguridad en el borde'],
          ['p', 'Los nodos de borde deben cifrar los datos en tránsito y en reposo para no convertirse en un punto débil.'],
        ],
      },
      en: {
        title: 'Edge computing and the connectivity of the future',
        excerpt: 'Processing close to the user reduces latency and enables new applications.',
        content: [
          ['p', 'Edge computing moves processing to the network edge, close to where data is generated. For businesses it is the difference between slow and real-time applications.'],
          ['h2', 'Latency and user experience'],
          ['p', 'Processing at the edge cuts the physical distance between user and server, key for video calls, IoT and online commerce.'],
          ['h2', 'Enterprise use cases'],
          ['p', 'Fleet monitoring, industrial sensors and branch networks benefit from local processing with cloud backup.'],
          ['h3', 'Security at the edge'],
          ['p', 'Edge nodes must encrypt data in transit and at rest so they do not become a weak point.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'redes-conectividad',
      postType: 'guias',
      tags: ['Nube', 'Redes'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Migración a la nube paso a paso',
        slug: 'migracion-a-la-nube',
        excerpt: 'Planifica, prioriza y ejecuta una migración sin interrumpir tu operación.',
        content: [
          ['p', 'Mover la infraestructura a la nube no es copiar y pegar. Una migración exitosa empieza con un inventario honesto de sistemas y sus dependencias.'],
          ['h2', 'Inventario y prioridades'],
          ['p', 'Clasifica las aplicaciones por criticidad y complejidad. Empieza por las de menor riesgo para ganar confianza.'],
          ['h2', 'Elección del proveedor y arquitectura'],
          ['p', 'Define presupuesto, región y requisitos de cumplimiento antes de elegir. La arquitectura debe aprovechar los servicios gestionados.'],
          ['h3', 'Rollback planificado'],
          ['p', 'Define una estrategia de retorno por sistema. La nube no es irreversible si la planificas bien.'],
        ],
      },
      en: {
        title: 'Step-by-step cloud migration',
        excerpt: 'Plan, prioritize and execute a migration without disrupting operations.',
        content: [
          ['p', 'Moving infrastructure to the cloud is not copy and paste. A successful migration starts with an honest inventory of systems and dependencies.'],
          ['h2', 'Inventory and priorities'],
          ['p', 'Classify applications by criticality and complexity. Start with the lowest-risk ones to build confidence.'],
          ['h2', 'Provider choice and architecture'],
          ['p', 'Define budget, region and compliance requirements before choosing. Architecture must leverage managed services.'],
          ['h3', 'Planned rollback'],
          ['p', 'Define a return strategy per system. The cloud is not irreversible if you plan well.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['Nube', 'Cloud'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'El auge de los CMS headless',
        slug: 'auge-cms-headless',
        excerpt: 'Contenido desacoplado, publicación multicanal y equipos más ágiles.',
        content: [
          ['p', 'Los CMS headless separan la gestión de contenido de la presentación. Los editores escriben una vez y el contenido se sirve a web, apps y más.'],
          ['h2', 'Beneficios para el equipo'],
          ['p', 'Desarrolladores eligen el stack que prefieren y los editores obtienen una interfaz clara sin tocar código.'],
          ['h2', 'Rendimiento y escalabilidad'],
          ['p', 'Al servir contenido por API, el frontend puede ser estático o SSR y escalar independientemente del panel de administración.'],
          ['h3', 'Cuándo migrar'],
          ['p', 'Si publicas en varios canales o tu sitio crece en tráfico, es momento de considerar la arquitectura headless.'],
        ],
      },
      en: {
        title: 'The rise of headless CMS',
        excerpt: 'Decoupled content, multi-channel publishing and more agile teams.',
        content: [
          ['p', 'Headless CMS separate content management from presentation. Editors write once and content is served to web, apps and more.'],
          ['h2', 'Benefits for the team'],
          ['p', 'Developers choose their preferred stack and editors get a clear interface without touching code.'],
          ['h2', 'Performance and scalability'],
          ['p', 'By serving content over APIs, the frontend can be static or SSR and scale independently of the admin panel.'],
          ['h3', 'When to migrate'],
          ['p', 'If you publish across multiple channels or your site is growing in traffic, it is time to consider a headless architecture.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'desarrollo-web',
      postType: 'noticias',
      tags: ['Headless CMS', 'Desarrollo Web'],
      toc: 'enabled',
    },
    {
      es: {
        title: 'Mejora tus Core Web Vitals',
        slug: 'core-web-vitals',
        excerpt: 'LCP, INP y CLS: las métricas que Google usa para rankear tu sitio.',
        content: [
          ['p', 'Core Web Vitals son las métricas que miden la experiencia real de carga. Mejorarlas sube tu posicionamiento y reduce el abandono.'],
          ['h2', 'LCP: velocidad de carga del contenido principal'],
          ['p', 'Optimiza imágenes, prioriza el renderizado crítico y usa caché para cargar el contenido visible lo antes posible.'],
          ['h2', 'INP: respuesta a la interacción'],
          ['p', 'El INP mide cuánto tarda la página en responder a clics y teclas. Evita bloquear el hilo principal con scripts pesados.'],
          ['h3', 'CLS: estabilidad visual'],
          ['p', 'Reserva espacio para imágenes y evita inyectar banners que muevan el contenido mientras carga.'],
        ],
      },
      en: {
        title: 'Improve your Core Web Vitals',
        excerpt: 'LCP, INP and CLS: the metrics Google uses to rank your site.',
        content: [
          ['p', 'Core Web Vitals measure the real loading experience. Improving them boosts your ranking and reduces abandonment.'],
          ['h2', 'LCP: main content load speed'],
          ['p', 'Optimize images, prioritize critical rendering and use caching to load visible content as fast as possible.'],
          ['h2', 'INP: interaction response'],
          ['p', 'INP measures how long the page takes to respond to clicks and keystrokes. Avoid blocking the main thread with heavy scripts.'],
          ['h3', 'CLS: visual stability'],
          ['p', 'Reserve space for images and avoid injecting banners that shift content while loading.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'desarrollo-web',
      postType: 'guias',
      tags: ['Rendimiento', 'SEO'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Astro y las islas de interactividad',
        slug: 'astro-islas-interactividad',
        excerpt: 'Cero JavaScript por defecto y componentes hidratados solo donde importa.',
        content: [
          ['p', 'Astro popularizó la arquitectura de islas: la página se envía como HTML puro y solo los componentes interactivos cargan JavaScript al navegador.'],
          ['h2', 'Rendimiento por diseño'],
          ['p', 'Menos JavaScript significa páginas más rápidas y mejor SEO. Las islas se hidratan bajo demanda o en el momento de hacer scroll.'],
          ['h2', 'Integración con tu framework favorito'],
          ['p', 'Astro permite usar componentes de React, Vue o Svelte dentro de la misma página sin conflictos.'],
          ['h3', 'Ideal para contenido y CMS'],
          ['p', 'Sitios con blog, portafolio y contenido del CMS aprovechan al máximo el renderizado estático y SSR.'],
        ],
      },
      en: {
        title: 'Astro and islands of interactivity',
        excerpt: 'Zero JavaScript by default and hydrated components only where it matters.',
        content: [
          ['p', 'Astro popularized the islands architecture: the page is sent as pure HTML and only interactive components load JavaScript in the browser.'],
          ['h2', 'Performance by design'],
          ['p', 'Less JavaScript means faster pages and better SEO. Islands hydrate on demand or when scrolled into view.'],
          ['h2', 'Integrate your favorite framework'],
          ['p', 'Astro lets you use React, Vue or Svelte components in the same page without conflicts.'],
          ['h3', 'Great for content and CMS'],
          ['p', 'Sites with blogs, portfolios and CMS content get the most out of static and SSR rendering.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['Astro', 'Frontend'],
      toc: 'enabled',
    },
    {
      es: {
        title: 'SQL vs NoSQL: cuándo usar cada una',
        slug: 'sql-vs-nosql',
        excerpt: 'No hay base de datos universal: elige según tu modelo de datos.',
        content: [
          ['p', 'La elección entre SQL y NoSQL depende de la estructura de tus datos y de cómo los consultas, no de la moda.'],
          ['h2', 'SQL para transacciones y relaciones'],
          ['p', 'Si necesitas integridad referencial, transacciones complejas y reportes, un motor relacional como PostgreSQL es difícil de superar.'],
          ['h2', 'NoSQL para escala y flexibilidad'],
          ['p', 'Documentos y key-value brillan en catálogos, sesiones y cargas masivas donde el esquema cambia rápido.'],
          ['h3', 'Piensa en hibridación'],
          ['p', 'Muchos sistemas usan una base relacional como fuente de verdad y una NoSQL para lectura a escala.'],
        ],
      },
      en: {
        title: 'SQL vs NoSQL: when to use each',
        excerpt: 'There is no universal database: choose according to your data model.',
        content: [
          ['p', 'The choice between SQL and NoSQL depends on your data structure and how you query it, not on hype.'],
          ['h2', 'SQL for transactions and relations'],
          ['p', 'If you need referential integrity, complex transactions and reports, a relational engine like PostgreSQL is hard to beat.'],
          ['h2', 'NoSQL for scale and flexibility'],
          ['p', 'Documents and key-value shine in catalogs, sessions and bulk loads where the schema changes fast.'],
          ['h3', 'Think hybrid'],
          ['p', 'Many systems use a relational database as the source of truth and a NoSQL store for read scaling.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['Base de datos', 'Desarrollo Web'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Automatización del marketing digital',
        slug: 'automatizacion-marketing',
        excerpt: 'Flujos de email, WhatsApp y SMS que trabajan mientras duermes.',
        content: [
          ['p', 'La automatización conecta cada interacción del cliente con la siguiente acción correcta, sin intervención manual.'],
          ['h2', 'Email y secuencias de bienvenida'],
          ['p', 'Configura campañas que se disparan por comportamiento: registro, abandono de carrito o aniversario de compra.'],
          ['h2', 'Mensajería por WhatsApp y SMS'],
          ['p', 'Las plantillas aprobadas permiten enviar recordatorios y notificaciones transaccionales con alta tasa de apertura.'],
          ['h3', 'Mide cada flujo'],
          ['p', 'Revisa apertura, clics y conversión por flujo. La automatización sin medición es ruido.'],
        ],
      },
      en: {
        title: 'Digital marketing automation',
        excerpt: 'Email, WhatsApp and SMS flows that work while you sleep.',
        content: [
          ['p', 'Automation connects every customer interaction with the next correct action, without manual intervention.'],
          ['h2', 'Email and welcome sequences'],
          ['p', 'Set up campaigns triggered by behavior: sign-up, cart abandonment or purchase anniversary.'],
          ['h2', 'WhatsApp and SMS messaging'],
          ['p', 'Approved templates allow sending reminders and transactional notifications with high open rates.'],
          ['h3', 'Measure every flow'],
          ['p', 'Review open, click and conversion rates per flow. Automation without measurement is noise.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'marketing-digital',
      postType: 'guias',
      tags: ['Marketing Digital', 'Automatización'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Microservicios y APIs bien diseñadas',
        slug: 'microservicios-apis',
        excerpt: 'La arquitectura modular exige contratos claros entre servicios.',
        content: [
          ['p', 'Los microservicios prometen escalar cada parte de tu sistema por separado, pero exigen disciplina en el diseño de las APIs.'],
          ['h2', 'Contratos y versionado'],
          ['p', 'Define contratos explícitos y versiona tus endpoints. Romper una API es romper la promesa a quien la consume.'],
          ['h2', 'Observabilidad desde el inicio'],
          ['p', 'Registros, métricas y trazabilidad distribuida son imprescindibles para diagnosticar un sistema de muchos servicios.'],
          ['h3', '¿Realmente lo necesitas?'],
          ['p', 'Muchas empresas ganan más consolidando un monolito bien modular que fragmentando prematuramente.'],
        ],
      },
      en: {
        title: 'Microservices and well-designed APIs',
        excerpt: 'Modular architecture demands clear contracts between services.',
        content: [
          ['p', 'Microservices promise to scale each part of your system separately but demand discipline in API design.'],
          ['h2', 'Contracts and versioning'],
          ['p', 'Define explicit contracts and version your endpoints. Breaking an API breaks a promise to its consumers.'],
          ['h2', 'Observability from the start'],
          ['p', 'Logs, metrics and distributed tracing are essential to diagnose a multi-service system.'],
          ['h3', 'Do you really need it?'],
          ['p', 'Many companies gain more by consolidating a well-modularized monolith than by fragmenting prematurely.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['APIs', 'Desarrollo Web'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Telefonía IP y comunicación unificada',
        slug: 'telefonia-ip-unificada',
        excerpt: 'Integra voz, video y mensajería en una sola plataforma.',
        content: [
          ['p', 'La comunicación unificada junta llamadas, video, chat y presencia en una experiencia única. Es la base del trabajo híbrido.'],
          ['h2', 'Integración con herramientas de trabajo'],
          ['p', 'Conectar la telefonía con CRM y calendarios permite contexto completo en cada llamada entrante.'],
          ['h2', 'Calidad de servicio (QoS)'],
          ['p', 'Para que la voz suene bien, la red debe priorizar el tráfico de llamadas sobre el resto del tráfico.'],
          ['h3', 'Migración gradual'],
          ['p', 'La telefonía IP permite convivir líneas analógicas y virtuales durante la transición, sin cortar la operación.'],
        ],
      },
      en: {
        title: 'IP telephony and unified communications',
        excerpt: 'Integrate voice, video and messaging into a single platform.',
        content: [
          ['p', 'Unified communications bring calls, video, chat and presence together in one experience. It is the foundation of hybrid work.'],
          ['h2', 'Integration with work tools'],
          ['p', 'Connecting telephony with CRM and calendars provides full context on every incoming call.'],
          ['h2', 'Quality of service (QoS)'],
          ['p', 'For voice to sound good, the network must prioritize call traffic over the rest.'],
          ['h3', 'Gradual migration'],
          ['p', 'IP telephony lets analog and virtual lines coexist during the transition, without stopping operations.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'pbx-centrales',
      postType: 'guias',
      tags: ['Telefonía IP', 'VoIP'],
      toc: 'enabled',
    },
    {
      es: {
        title: 'Pruebas automatizadas en proyectos web',
        slug: 'pruebas-automatizadas',
        excerpt: 'Unitarias, de integración y e2e: una red de seguridad para cada release.',
        content: [
          ['p', 'Las pruebas automatizadas convierten el miedo a romper algo en confianza para desplegar con frecuencia.'],
          ['h2', 'Pruebas unitarias y de integración'],
          ['p', 'Cubren la lógica de negocio y las conexiones entre módulos. Son rápidas y corren en cada commit.'],
          ['h2', 'Pruebas end-to-end'],
          ['p', 'Simulan el recorrido real del usuario en el navegador. Son más lentas, pero validan el flujo completo.'],
          ['h3', 'Cobertura estratégica'],
          ['p', 'No busques 100 % de cobertura, prioriza los flujos que más se usan y los que más pueden fallar.'],
        ],
      },
      en: {
        title: 'Automated testing in web projects',
        excerpt: 'Unit, integration and e2e tests: a safety net for every release.',
        content: [
          ['p', 'Automated testing turns the fear of breaking something into confidence to deploy frequently.'],
          ['h2', 'Unit and integration tests'],
          ['p', 'They cover business logic and connections between modules. They are fast and run on every commit.'],
          ['h2', 'End-to-end tests'],
          ['p', 'They simulate the real user journey in the browser. Slower, but they validate the complete flow.'],
          ['h3', 'Strategic coverage'],
          ['p', 'Do not chase 100% coverage; prioritize the flows most used and most likely to fail.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['Testing', 'Desarrollo Web'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Contenedores y despliegue continuo',
        slug: 'contenedores-cd',
        excerpt: 'Empaqueta tu aplicación y despliega igual en cualquier entorno.',
        content: [
          ['p', 'Los contenedores resuelven el clásico "en mi máquina funciona". Empaquetas la aplicación con sus dependencias y la ejecutas igual en dev y producción.'],
          ['h2', 'Imágenes reproducibles'],
          ['p', 'Define imágenes inmutables con versiones fijas de dependencias. Menos sorpresas, despliegues más predecibles.'],
          ['h2', 'Pipeline de CI/CD'],
          ['p', 'Automatiza pruebas y despliegue en cada push. La integración continua con despliegue continuo acorta el ciclo de entrega.'],
          ['h3', 'Observabilidad en producción'],
          ['p', 'Con muchos contenedores, la salud de cada uno debe estar visible en un panel central.'],
        ],
      },
      en: {
        title: 'Containers and continuous deployment',
        excerpt: 'Package your app and deploy identically in any environment.',
        content: [
          ['p', 'Containers solve the classic "it works on my machine". You package the app with its dependencies and run it the same in dev and production.'],
          ['h2', 'Reproducible images'],
          ['p', 'Define immutable images with pinned dependency versions. Fewer surprises, more predictable deploys.'],
          ['h2', 'CI/CD pipeline'],
          ['p', 'Automate tests and deployment on every push. Continuous integration with continuous delivery shortens the release cycle.'],
          ['h3', 'Observability in production'],
          ['p', 'With many containers, the health of each one must be visible on a central dashboard.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'aplicaciones-web',
      postType: 'guias',
      tags: ['DevOps', 'Contenedores'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'SEO técnico en 2026',
        slug: 'seo-tecnico-2026',
        excerpt: 'Sitemaps, datos estructurados y velocidad: la base de todo ranking.',
        content: [
          ['p', 'El SEO técnico prepara tu sitio para que los buscadores lo entiendan y lo sirvan rápido. Sin él, el mejor contenido no llega a nadie.'],
          ['h2', 'Arquitectura y datos estructurados'],
          ['p', 'URLs limpias, breadcrumbs y schema.org ayudan a Google a interpretar la estructura y mostrar resultados enriquecidos.'],
          ['h2', 'Rastreo e indexación'],
          ['p', 'Revisa sitemaps, robots.txt y redirecciones. Una página bloqueada o con 301 en cadena pierde posiciones.'],
          ['h3', 'Internacionalización'],
          ['p', 'Si vendes en varios idiomas, usa hreflang correctamente para que cada usuario vea su idioma.'],
        ],
      },
      en: {
        title: 'Technical SEO in 2026',
        excerpt: 'Sitemaps, structured data and speed: the foundation of every ranking.',
        content: [
          ['p', 'Technical SEO prepares your site so search engines understand it and serve it fast. Without it, the best content reaches no one.'],
          ['h2', 'Architecture and structured data'],
          ['p', 'Clean URLs, breadcrumbs and schema.org help Google interpret structure and show rich results.'],
          ['h2', 'Crawling and indexing'],
          ['p', 'Review sitemaps, robots.txt and redirects. A blocked page or a 301 chain loses positions.'],
          ['h3', 'Internationalization'],
          ['p', 'If you sell in several languages, use hreflang correctly so every user sees their language.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'seo',
      postType: 'guias',
      tags: ['SEO', 'Marketing Digital'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Protege los datos de tus clientes',
        slug: 'proteccion-datos-clientes',
        excerpt: 'Cumplimiento y confianza: cifrado, permisos y políticas claras.',
        content: [
          ['p', 'La protección de datos personales no es solo una obligación legal, es la base de la confianza del cliente.'],
          ['h2', 'Cifrado y control de acceso'],
          ['p', 'Cifra los datos en tránsito y en reposo, y aplica el principio de mínimo privilegio a cada rol.'],
          ['h2', 'Políticas y transparencia'],
          ['p', 'Informa a tus usuarios qué datos recolectas y para qué. Una política clara reduce riesgos y reclamos.'],
          ['h3', 'Respuesta ante incidentes'],
          ['p', 'Ten un plan documentado para notificar y contener una brecha en las primeras horas.'],
        ],
      },
      en: {
        title: 'Protect your customers data',
        excerpt: 'Compliance and trust: encryption, permissions and clear policies.',
        content: [
          ['p', 'Personal data protection is not only a legal obligation, it is the foundation of customer trust.'],
          ['h2', 'Encryption and access control'],
          ['p', 'Encrypt data in transit and at rest, and apply least-privilege access to every role.'],
          ['h2', 'Policies and transparency'],
          ['p', 'Tell users what data you collect and why. A clear policy reduces risk and complaints.'],
          ['h3', 'Incident response'],
          ['p', 'Have a documented plan to notify and contain a breach in the first hours.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'redes-conectividad',
      postType: 'guias',
      tags: ['Ciberseguridad', 'Seguridad'],
      toc: 'disabled',
    },
    {
      es: {
        title: 'E-commerce: convierte y fideliza',
        slug: 'ecommerce-conversion',
        excerpt: 'Checkout sin fricción, pruebas sociales y seguimiento postventa.',
        content: [
          ['p', 'Un e-commerce exitoso no se mide solo en tráfico, sino en cuántos visitantes terminan comprando y vuelven.'],
          ['h2', 'Checkout sin fricción'],
          ['p', 'Reduce pasos, ofrece múltiples métodos de pago y guarda los datos del carrito para recuperar ventas abandonadas.'],
          ['h2', 'Prueba social y confianza'],
          ['p', 'Reseñas, garantías y sellos de seguridad disminuyen la desconfianza en el momento de pagar.'],
          ['h3', 'Postventa que fideliza'],
          ['p', 'El seguimiento del pedido y el email post-compra convierten una compra en una relación.'],
        ],
      },
      en: {
        title: 'E-commerce: convert and retain',
        excerpt: 'Frictionless checkout, social proof and post-sale follow-up.',
        content: [
          ['p', 'A successful e-commerce is not measured only in traffic but in how many visitors finish buying and return.'],
          ['h2', 'Frictionless checkout'],
          ['p', 'Reduce steps, offer multiple payment methods and save cart data to recover abandoned sales.'],
          ['h2', 'Social proof and trust'],
          ['p', 'Reviews, guarantees and security badges reduce distrust at the moment of payment.'],
          ['h3', 'Post-sale that retains'],
          ['p', 'Order tracking and post-purchase email turn a sale into a relationship.'],
        ],
      },
      heroImage: image1.id as number,
      category: 'e-commerce',
      postType: 'guias-compra',
      tags: ['E-commerce', 'SEO'],
      toc: 'inherit',
    },
    {
      es: {
        title: 'Redes 5G y WiFi 7 para empresas',
        slug: 'redes-5g-wifi7',
        excerpt: 'Conectividad inalámbrica de alta velocidad para oficinas y sucursales.',
        content: [
          ['p', 'Las nuevas generaciones de conectividad inalámbrica cambian lo que una oficina puede hacer sin cables: videollamadas 4K, AR y sensores en tiempo real.'],
          ['h2', 'WiFi 7 en la oficina'],
          ['p', 'Mayor ancho de banda y menor latencia para decenas de dispositivos simultáneos por usuario.'],
          ['h2', '5G para sucursales y operaciones móviles'],
          ['p', 'El 5G fijo y móvil conecta sedes temporales y flotas con respaldo automático a la red principal.'],
          ['h3', 'Planifica la seguridad'],
          ['p', 'Redes separadas para visitantes y empleados, y WPA3 por defecto, evitan accesos no deseados.'],
        ],
      },
      en: {
        title: '5G and WiFi 7 networks for business',
        excerpt: 'High-speed wireless connectivity for offices and branches.',
        content: [
          ['p', 'New generations of wireless connectivity change what an office can do without cables: 4K video calls, AR and real-time sensors.'],
          ['h2', 'WiFi 7 in the office'],
          ['p', 'More bandwidth and lower latency for dozens of simultaneous devices per user.'],
          ['h2', '5G for branches and mobile operations'],
          ['p', 'Fixed and mobile 5G connect temporary sites and fleets with automatic failover to the main network.'],
          ['h3', 'Plan security'],
          ['p', 'Separate networks for guests and employees, and WPA3 by default, prevent unwanted access.'],
        ],
      },
      heroImage: image2.id as number,
      category: 'redes-conectividad',
      postType: 'noticias',
      tags: ['Redes', 'Conectividad'],
      toc: 'disabled',
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
        content: sections(...post.es.content),
        heroImage: post.heroImage,
        categories: categoryIdBySlug.get(post.category) as number,
        postType: postTypeIdBySlug.get(post.postType) as number,
        authors: [admin.id],
        tags: await Promise.all(post.tags.map(ensureTag)),
        toc: post.toc ?? 'inherit',
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
        content: sections(...post.en.content),
      },
    })
    postDocs.push(doc)
  }

  for (let i = 0; i < postDocs.length; i++) {
    const next = postDocs[(i + 1) % postDocs.length].id
    await payload.update({
      collection: 'posts',
      id: postDocs[i].id,
      data: { relatedPosts: [next] },
    })
  }

  payload.logger.info(`- Seeding projects...`)

  type ProjectSeed = {
    es: { title: string; slug: string; description: string; content: SeedBlock[] }
    en: { title: string; description: string; content: SeedBlock[] }
    client: string
    year: number
    coverImage: number
    projectType: string
    category: string
    tags: string[]
    websiteUrl?: string
    sourceUrl?: string
    toc?: 'inherit' | 'enabled' | 'disabled'
  }

  const projectsData: ProjectSeed[] = [
    {
      es: {
        title: 'PBX en la nube para clínica médica',
        slug: 'pbx-nube-clinica',
        description: 'Central telefónica virtual con IVR, grabación y extensión móvil para 60 usuarios.',
        content: [
          ['p', 'La clínica atendía sus llamadas con una central analógica saturada. Implementamos una PBX en la nube que unifica las 4 sedes y mejora la atención al paciente.'],
          ['h2', 'IVR y encaminamiento inteligente'],
          ['p', 'Diseñamos menús de voz por especialidad y colas de espera con música, priorizando urgencias y citas.'],
          ['h2', 'Grabación y reportes'],
          ['p', 'Toda llamada se registra y los supervisores consultan reportes de llamadas por agente y por servicio.'],
          ['h3', 'Extensión móvil'],
          ['p', 'Los médicos atienden desde su celular con la misma extensión, sin compartir su número personal.'],
        ],
      },
      en: {
        title: 'Cloud PBX for a medical clinic',
        description: 'Virtual phone system with IVR, recording and mobile extension for 60 users.',
        content: [
          ['p', 'The clinic handled its calls with a saturated analog switchboard. We deployed a cloud PBX that unifies the 4 sites and improves patient care.'],
          ['h2', 'IVR and smart routing'],
          ['p', 'We designed voice menus by specialty and music-on-hold queues, prioritizing emergencies and appointments.'],
          ['h2', 'Recording and reports'],
          ['p', 'Every call is recorded and supervisors consult call reports by agent and by service.'],
          ['h3', 'Mobile extension'],
          ['p', 'Doctors answer from their cell phone with the same extension, without sharing their personal number.'],
        ],
      },
      client: 'Clínica Salud Plus',
      year: 2026,
      coverImage: image1.id as number,
      projectType: 'telecomunicaciones',
      category: 'pbx-voip',
      tags: ['PBX', 'VoIP', 'Nube'],
      websiteUrl: 'https://clinicasaludplus.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/pbx-nube-clinica',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Red corporativa con VPN para firma legal',
        slug: 'red-vpn-firma-legal',
        description: 'Conectividad segura entre oficinas con VPN cifrada y control de acceso.',
        content: [
          ['p', 'Una firma legal con tres oficinas necesitaba compartir expedientes digitales de forma segura. Implementamos una red privada virtual con autenticación multifactor.'],
          ['h2', 'VPN site-to-site'],
          ['p', 'Interconectamos las tres sedes con túneles cifrados, unificando la red y el acceso a los sistemas de gestión.'],
          ['h2', 'Segmentación y control de acceso'],
          ['p', 'Cada práctica legal accede solo a sus expedientes, con auditoría de cada acceso.'],
          ['h3', 'Respaldo y redundancia'],
          ['p', 'Dos enlaces de internet con conmutación automática garantizan disponibilidad continua.'],
        ],
      },
      en: {
        title: 'Corporate VPN network for a law firm',
        description: 'Secure connectivity between offices with encrypted VPN and access control.',
        content: [
          ['p', 'A law firm with three offices needed to share digital files securely. We deployed a private virtual network with multi-factor authentication.'],
          ['h2', 'Site-to-site VPN'],
          ['p', 'We interconnected the three offices with encrypted tunnels, unifying the network and access to management systems.'],
          ['h2', 'Segmentation and access control'],
          ['p', 'Each legal practice accesses only its files, with auditing of every access.'],
          ['h3', 'Backup and redundancy'],
          ['p', 'Two internet links with automatic failover guarantee continuous availability.'],
        ],
      },
      client: 'Estudio Jurídico Ávila & Asociados',
      year: 2025,
      coverImage: image2.id as number,
      projectType: 'telecomunicaciones',
      category: 'redes-conectividad',
      tags: ['Redes', 'Seguridad'],
      websiteUrl: 'https://avila-asociados.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/red-vpn-firma-legal',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Tienda en línea para marca de moda',
        slug: 'ecommerce-moda',
        description: 'E-commerce de alto rendimiento con pagos locales y estrategia SEO.',
        content: [
          ['p', 'La marca vendía por redes sociales y catálogos. Desarrollamos una tienda en línea que automatiza pedidos, pagos y envíos en toda Colombia.'],
          ['h2', 'Catálogo y experiencia de compra'],
          ['p', 'Filtros por talla, color y colección con fotografías optimizadas para una carga rápida en móvil.'],
          ['h2', 'Pagos y logística'],
          ['p', 'Integramos pasarelas locales y operadores de envío con cálculo de flete en tiempo real.'],
          ['h3', 'SEO y contenido'],
          ['p', 'La estrategia de contenido duplicó el tráfico orgánico en seis meses.'],
        ],
      },
      en: {
        title: 'Online store for a fashion brand',
        description: 'High-performance e-commerce with local payments and SEO strategy.',
        content: [
          ['p', 'The brand sold through social media and catalogs. We built an online store that automates orders, payments and shipping across Colombia.'],
          ['h2', 'Catalog and shopping experience'],
          ['p', 'Filters by size, color and collection with optimized photography for fast mobile loading.'],
          ['h2', 'Payments and logistics'],
          ['p', 'We integrated local gateways and shipping carriers with real-time freight calculation.'],
          ['h3', 'SEO and content'],
          ['p', 'The content strategy doubled organic traffic in six months.'],
        ],
      },
      client: 'Moda Latina SAS',
      year: 2026,
      coverImage: image1.id as number,
      projectType: 'desarrollo-web',
      category: 'e-commerce',
      tags: ['E-commerce', 'SEO', 'Desarrollo Web'],
      websiteUrl: 'https://modalatina.co',
      sourceUrl: 'https://github.com/viptelcomunicaciones/ecommerce-moda',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Plataforma de reservas para hotel boutique',
        slug: 'reservas-hotel-boutique',
        description: 'Motor de reservas con disponibilidad en tiempo real y confirmación automática.',
        content: [
          ['p', 'El hotel gestionaba reservas por teléfono y correo. Construimos una plataforma web con motor de disponibilidad en tiempo real.'],
          ['h2', 'Disponibilidad y tarifas'],
          ['p', 'Calendario de habitaciones con tarifas dinámicas por temporada y políticas de cancelación.'],
          ['h2', 'Pago y confirmación'],
          ['p', 'Reserva con tarjeta o transferencia y confirmación automática por email y WhatsApp.'],
          ['h3', 'Panel del hotel'],
          ['p', 'El personal gestiona huéspedes, desayunos y servicios adicionales desde un panel simple.'],
        ],
      },
      en: {
        title: 'Booking platform for a boutique hotel',
        description: 'Booking engine with real-time availability and automatic confirmation.',
        content: [
          ['p', 'The hotel managed reservations by phone and email. We built a web platform with a real-time availability engine.'],
          ['h2', 'Availability and rates'],
          ['p', 'Room calendar with dynamic rates by season and cancellation policies.'],
          ['h2', 'Payment and confirmation'],
          ['p', 'Book by card or bank transfer with automatic confirmation by email and WhatsApp.'],
          ['h3', 'Hotel panel'],
          ['p', 'Staff manage guests, breakfasts and extra services from a simple panel.'],
        ],
      },
      client: 'Hotel Casa Verde',
      year: 2025,
      coverImage: image2.id as number,
      projectType: 'desarrollo-web',
      category: 'aplicaciones-web',
      tags: ['Desarrollo Web', 'Apps'],
      websiteUrl: 'https://hotelcasaverde.co',
      sourceUrl: 'https://github.com/viptelcomunicaciones/reservas-hotel-boutique',
      toc: 'inherit',
    },
    {
      es: {
        title: 'ERP ligero de inventario para distribuidora',
        slug: 'erp-inventario-distribuidora',
        description: 'Control de bodegas, facturación y órdenes de compra en una sola herramienta.',
        content: [
          ['p', 'La distribuidora manejaba el inventario en hojas de cálculo. Implementamos un ERP ligero que centraliza bodegas, compras y ventas.'],
          ['h2', 'Inventario multi-bodega'],
          ['p', 'Cada bodega mantiene su stock con alertas de mínimo y trazabilidad por lote.'],
          ['h2', 'Facturación integrada'],
          ['p', 'Facturas, notas crédito y recibos se generan desde la misma orden, sincronizados con contabilidad.'],
          ['h3', 'Roles y permisos'],
          ['p', 'Cada usuario ve solo lo que su rol necesita, protegiendo los costos y márgenes.'],
        ],
      },
      en: {
        title: 'Lightweight inventory ERP for a distributor',
        description: 'Warehouse control, invoicing and purchase orders in one tool.',
        content: [
          ['p', 'The distributor managed inventory in spreadsheets. We implemented a lightweight ERP that centralizes warehouses, purchases and sales.'],
          ['h2', 'Multi-warehouse inventory'],
          ['p', 'Each warehouse keeps its stock with minimum alerts and lot traceability.'],
          ['h2', 'Integrated invoicing'],
          ['p', 'Invoices, credit notes and receipts are generated from the same order, synced with accounting.'],
          ['h3', 'Roles and permissions'],
          ['p', 'Each user sees only what their role needs, protecting costs and margins.'],
        ],
      },
      client: 'Distribuidora Andina',
      year: 2024,
      coverImage: image1.id as number,
      projectType: 'software-empresarial',
      category: 'erp',
      tags: ['ERP', 'Desarrollo Web'],
      websiteUrl: 'https://distribuidoraandina.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/erp-inventario-distribuidora',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Seguimiento de flota GPS en tiempo real',
        slug: 'seguimiento-flota-gps',
        description: 'Plataforma web de monitoreo de vehículos con geocercas y reportes.',
        content: [
          ['p', 'La operadora de transporte necesitaba saber dónde estaba cada camión. Desarrollamos una plataforma de monitoreo GPS en tiempo real.'],
          ['h2', 'Mapa en vivo y geocercas'],
          ['p', 'Ubicación de cada vehículo con alertas automáticas cuando entra o sale de una zona definida.'],
          ['h2', 'Historial y reportes'],
          ['p', 'Recorridos históricos, paradas y consumo ayudan a optimizar rutas y costos.'],
          ['h3', 'Alertas por WhatsApp'],
          ['p', 'Las notificaciones de eventos importantes llegan al despacho por WhatsApp y correo.'],
        ],
      },
      en: {
        title: 'Real-time GPS fleet tracking',
        description: 'Web vehicle monitoring platform with geofences and reports.',
        content: [
          ['p', 'The transport operator needed to know where each truck was. We built a real-time GPS monitoring platform.'],
          ['h2', 'Live map and geofences'],
          ['p', 'Location of every vehicle with automatic alerts when entering or leaving a defined area.'],
          ['h2', 'History and reports'],
          ['p', 'Historical routes, stops and consumption help optimize routes and costs.'],
          ['h3', 'WhatsApp alerts'],
          ['p', 'Important event notifications reach dispatch via WhatsApp and email.'],
        ],
      },
      client: 'Logística TransCaribe',
      year: 2026,
      coverImage: image2.id as number,
      projectType: 'software-empresarial',
      category: 'aplicaciones-web',
      tags: ['Apps', 'Datos'],
      websiteUrl: 'https://transcaribe.co',
      sourceUrl: 'https://github.com/viptelcomunicaciones/seguimiento-flota-gps',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Migración a la nube para cooperativa financiera',
        slug: 'migracion-nube-cooperativa',
        description: 'Infraestructura en la nube con alta disponibilidad y cumplimiento.',
        content: [
          ['p', 'La cooperativa operaba sus sistemas en servidores físicos de su sede. Migramos la infraestructura a la nube con alta disponibilidad y respaldo geográfico.'],
          ['h2', 'Arquitectura de alta disponibilidad'],
          ['p', 'Servicios duplicados en dos zonas con conmutación automática ante fallos.'],
          ['h2', 'Seguridad y cumplimiento'],
          ['p', 'Cifrado, control de acceso y auditoría alineados con la regulación financiera colombiana.'],
          ['h3', 'Migración sin interrupción'],
          ['p', 'La transición se ejecutó por módulos en horarios de bajo uso, sin detener la operación.'],
        ],
      },
      en: {
        title: 'Cloud migration for a financial cooperative',
        description: 'Cloud infrastructure with high availability and compliance.',
        content: [
          ['p', 'The cooperative ran its systems on physical servers at its headquarters. We migrated the infrastructure to the cloud with high availability and geographic backup.'],
          ['h2', 'High-availability architecture'],
          ['p', 'Services duplicated across two zones with automatic failover.'],
          ['h2', 'Security and compliance'],
          ['p', 'Encryption, access control and auditing aligned with Colombian financial regulation.'],
          ['h3', 'Zero-downtime migration'],
          ['p', 'The transition ran module by module during low-usage hours, without stopping operations.'],
        ],
      },
      client: 'Cooperativa Financiera Andina',
      year: 2025,
      coverImage: image1.id as number,
      projectType: 'telecomunicaciones',
      category: 'redes-conectividad',
      tags: ['Nube', 'Seguridad'],
      websiteUrl: 'https://cooperativaandina.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/migracion-nube-cooperativa',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Sitio corporativo multilingüe',
        slug: 'sitio-corporativo-multilingue',
        description: 'Web corporativa en español e inglés con CMS propio y SEO técnico.',
        content: [
          ['p', 'La empresa exportaba a varios países y necesitaba un sitio que hablara el idioma de cada cliente. Construimos una web corporativa bilingüe sobre un CMS a medida.'],
          ['h2', 'Arquitectura headless'],
          ['p', 'Contenido gestionado en un panel y servido por API a un frontend ultrarrápido.'],
          ['h2', 'Multilingüe y SEO'],
          ['p', 'Rutas por idioma, hreflang y contenido localizado mejoran la visibilidad en cada mercado.'],
          ['h3', 'Rendimiento'],
          ['p', 'El sitio carga en menos de un segundo en móvil, superando los umbrales de Core Web Vitals.'],
        ],
      },
      en: {
        title: 'Multilingual corporate website',
        description: 'Corporate website in Spanish and English with its own CMS and technical SEO.',
        content: [
          ['p', 'The company exported to several countries and needed a site that spoke each customer language. We built a bilingual corporate website on a custom CMS.'],
          ['h2', 'Headless architecture'],
          ['p', 'Content managed in a panel and served over APIs to a lightning-fast frontend.'],
          ['h2', 'Multilingual and SEO'],
          ['p', 'Per-language routes, hreflang and localized content improve visibility in each market.'],
          ['h3', 'Performance'],
          ['p', 'The site loads in under one second on mobile, exceeding Core Web Vitals thresholds.'],
        ],
      },
      client: 'Viptel Comunicaciones',
      year: 2026,
      coverImage: image2.id as number,
      projectType: 'desarrollo-web',
      category: 'aplicaciones-web',
      tags: ['Desarrollo Web', 'SEO'],
      websiteUrl: 'https://viptelcomunicaciones.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/sitio-corporativo',
      toc: 'enabled',
    },
    {
      es: {
        title: 'Red WiFi empresarial para campus universitario',
        slug: 'wifi-campus-universitario',
        description: 'Cobertura WiFi de alta densidad para más de 8.000 estudiantes.',
        content: [
          ['p', 'El campus contaba con puntos de acceso saturados. Diseñamos una red WiFi de alta densidad que soporta miles de dispositivos simultáneos.'],
          ['h2', 'Diseño de cobertura'],
          ['p', 'Estudio de sitio, ubicación de AP y ajuste de potencia para aulas, auditorios y zonas comunes.'],
          ['h2', 'Autenticación y políticas'],
          ['p', 'Acceso por credenciales institucionales, red separada para invitados y filtrado de contenido.'],
          ['h3', 'Monitoreo central'],
          ['p', 'Un panel central muestra salud de cada AP y el tráfico en tiempo real.'],
        ],
      },
      en: {
        title: 'Enterprise WiFi network for a university campus',
        description: 'High-density WiFi coverage for more than 8,000 students.',
        content: [
          ['p', 'The campus had saturated access points. We designed a high-density WiFi network that supports thousands of simultaneous devices.'],
          ['h2', 'Coverage design'],
          ['p', 'Site survey, AP placement and power tuning for classrooms, auditoriums and common areas.'],
          ['h2', 'Authentication and policies'],
          ['p', 'Access with institutional credentials, separate guest network and content filtering.'],
          ['h3', 'Central monitoring'],
          ['p', 'A central panel shows the health of every AP and real-time traffic.'],
        ],
      },
      client: 'Universidad del Norte',
      year: 2024,
      coverImage: image1.id as number,
      projectType: 'telecomunicaciones',
      category: 'redes-conectividad',
      tags: ['Redes', 'WiFi'],
      websiteUrl: 'https://unorte.edu.co',
      sourceUrl: 'https://github.com/viptelcomunicaciones/wifi-campus',
      toc: 'inherit',
    },
    {
      es: {
        title: 'CRM a medida para agencia de marketing',
        slug: 'crm-agencia-marketing',
        description: 'Pipeline de clientes, seguimiento de campañas y reportes automáticos.',
        content: [
          ['p', 'La agencia perdía oportunidades por falta de seguimiento estructurado. Implementamos un CRM a la medida de su flujo comercial.'],
          ['h2', 'Pipeline y etapas'],
          ['p', 'Visualización de oportunidades por etapa con probabilidad de cierre y fechas de seguimiento.'],
          ['h2', 'Campañas y presupuestos'],
          ['p', 'Cada campaña registra presupuesto, inversión y retorno, consolidado en reportes automáticos.'],
          ['h3', 'Automatización de recordatorios'],
          ['p', 'El sistema avisa a cada asesor cuándo corresponde contactar a un cliente.'],
        ],
      },
      en: {
        title: 'Custom CRM for a marketing agency',
        description: 'Client pipeline, campaign tracking and automatic reports.',
        content: [
          ['p', 'The agency lost opportunities due to a lack of structured follow-up. We implemented a CRM tailored to its sales flow.'],
          ['h2', 'Pipeline and stages'],
          ['p', 'Visualization of opportunities by stage with closing probability and follow-up dates.'],
          ['h2', 'Campaigns and budgets'],
          ['p', 'Each campaign records budget, investment and return, consolidated in automatic reports.'],
          ['h3', 'Follow-up reminders'],
          ['p', 'The system alerts each advisor when to contact a client.'],
        ],
      },
      client: 'Agencia Pixel Creativo',
      year: 2025,
      coverImage: image2.id as number,
      projectType: 'software-empresarial',
      category: 'crm',
      tags: ['CRM', 'Marketing Digital'],
      websiteUrl: 'https://pixelcreativo.co',
      sourceUrl: 'https://github.com/viptelcomunicaciones/crm-agencia-marketing',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Plataforma de cursos en línea (LMS)',
        slug: 'plataforma-lms',
        description: 'Aula virtual con lecciones, evaluaciones y certificados automáticos.',
        content: [
          ['p', 'La institución educativa necesitaba vender cursos en línea. Construimos un LMS con lecciones en video, quizzes y certificados.'],
          ['h2', 'Lecciones y progreso'],
          ['p', 'Estructura de módulos con seguimiento de progreso y recursos descargables.'],
          ['h2', 'Evaluaciones y certificados'],
          ['p', 'Quizzes con calificación automática y certificados generados al aprobar el curso.'],
          ['h3', 'Pagos e inscripción'],
          ['p', 'Compra de cursos con pasarela local y acceso inmediato al aula.'],
        ],
      },
      en: {
        title: 'Online course platform (LMS)',
        description: 'Virtual classroom with lessons, assessments and automatic certificates.',
        content: [
          ['p', 'The educational institution needed to sell online courses. We built an LMS with video lessons, quizzes and certificates.'],
          ['h2', 'Lessons and progress'],
          ['p', 'Module structure with progress tracking and downloadable resources.'],
          ['h2', 'Assessments and certificates'],
          ['p', 'Quizzes with automatic grading and certificates generated upon passing the course.'],
          ['h3', 'Payments and enrollment'],
          ['p', 'Course purchase with a local gateway and immediate access to the classroom.'],
        ],
      },
      client: 'Educación Virtual Latam',
      year: 2026,
      coverImage: image1.id as number,
      projectType: 'desarrollo-web',
      category: 'aplicaciones-web',
      tags: ['Desarrollo Web', 'Apps'],
      websiteUrl: 'https://educacionvirtuallatam.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/plataforma-lms',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Integración de pasarela de pagos local',
        slug: 'pasarela-pagos-local',
        description: 'Cobros en línea con transferencias, tarjetas y pagos contraentrega.',
        content: [
          ['p', 'La tienda perdía ventas porque sus clientes no podían pagar como querían. Integramos múltiples métodos de pago en un checkout unificado.'],
          ['h2', 'Métodos de pago'],
          ['p', 'Tarjetas, PSE, transferencias y contraentrega en un solo flujo de compra.'],
          ['h2', 'Seguridad de transacciones'],
          ['p', 'Tokenización de tarjetas y cifrado extremo a extremo para cada transacción.'],
          ['h3', 'Conciliación automática'],
          ['p', 'Los pagos se concilian automáticamente con la orden, reduciendo errores de contabilidad.'],
        ],
      },
      en: {
        title: 'Local payment gateway integration',
        description: 'Online payments with transfers, cards and cash on delivery.',
        content: [
          ['p', 'The store lost sales because its customers could not pay the way they wanted. We integrated multiple payment methods into a unified checkout.'],
          ['h2', 'Payment methods'],
          ['p', 'Cards, PSE, bank transfers and cash on delivery in a single purchase flow.'],
          ['h2', 'Transaction security'],
          ['p', 'Card tokenization and end-to-end encryption for every transaction.'],
          ['h3', 'Automatic reconciliation'],
          ['p', 'Payments reconcile automatically with the order, reducing accounting errors.'],
        ],
      },
      client: 'Tienda Online Colombia',
      year: 2025,
      coverImage: image2.id as number,
      projectType: 'desarrollo-web',
      category: 'e-commerce',
      tags: ['E-commerce', 'Integración'],
      websiteUrl: 'https://tiendaonlinecol.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/pasarela-pagos',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Centro de contacto omnicanal',
        slug: 'centro-contacto-omnicanal',
        description: 'Voz, chat y WhatsApp en una sola plataforma para servicio al cliente.',
        content: [
          ['p', 'La aseguradora atendía por teléfono y correo sin contexto entre canales. Unificamos toda la atención en un centro de contacto omnicanal.'],
          ['h2', 'Todos los canales en una vista'],
          ['p', 'El agente ve el historial completo de cada cliente sin importar por qué canal contacte.'],
          ['h2', 'Colas y priorización'],
          ['p', 'Las llamadas y chats se distribuyen según habilidad del agente y urgencia del caso.'],
          ['h3', 'Reportes en tiempo real'],
          ['p', 'Tiempos de espera, satisfacción y resolución en un panel de control ejecutivo.'],
        ],
      },
      en: {
        title: 'Omnichannel contact center',
        description: 'Voice, chat and WhatsApp in a single customer service platform.',
        content: [
          ['p', 'The insurer served customers by phone and email without context between channels. We unified all service into an omnichannel contact center.'],
          ['h2', 'All channels in one view'],
          ['p', 'The agent sees the full history of each customer regardless of the channel they contact through.'],
          ['h2', 'Queues and prioritization'],
          ['p', 'Calls and chats are distributed by agent skill and case urgency.'],
          ['h3', 'Real-time reports'],
          ['p', 'Wait times, satisfaction and resolution on an executive dashboard.'],
        ],
      },
      client: 'Seguros Protección Total',
      year: 2024,
      coverImage: image1.id as number,
      projectType: 'telecomunicaciones',
      category: 'pbx-voip',
      tags: ['Contact Center', 'VoIP'],
      websiteUrl: 'https://protecciontotal.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/centro-contacto',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Dashboard de analítica para retail',
        slug: 'dashboard-analitica-retail',
        description: 'Ventas, inventario y clientes en un panel de datos en tiempo real.',
        content: [
          ['p', 'La cadena de retail tenía los datos dispersos en sistemas aislados. Construimos un dashboard que consolida ventas, inventario y clientes.'],
          ['h2', 'Consolidación de fuentes'],
          ['p', 'Integramos puntos de venta, bodegas y e-commerce en un único almacén de datos.'],
          ['h2', 'Indicadores clave'],
          ['p', 'Ventas por tienda, rotación de inventario, ticket promedio y clientes recurrentes.'],
          ['h3', 'Alertas de stock'],
          ['p', 'El sistema alerta sobre productos críticos antes de que se agoten.'],
        ],
      },
      en: {
        title: 'Analytics dashboard for retail',
        description: 'Sales, inventory and customers in a real-time data dashboard.',
        content: [
          ['p', 'The retail chain had data scattered across isolated systems. We built a dashboard that consolidates sales, inventory and customers.'],
          ['h2', 'Source consolidation'],
          ['p', 'We integrated POS, warehouses and e-commerce into a single data warehouse.'],
          ['h2', 'Key indicators'],
          ['p', 'Sales by store, inventory turnover, average ticket and returning customers.'],
          ['h3', 'Stock alerts'],
          ['p', 'The system alerts on critical products before they run out.'],
        ],
      },
      client: 'Retail Unión',
      year: 2026,
      coverImage: image2.id as number,
      projectType: 'software-empresarial',
      category: 'erp',
      tags: ['Datos', 'Desarrollo Web'],
      websiteUrl: 'https://retailunion.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/dashboard-retail',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Facturación electrónica con la DIAN',
        slug: 'facturacion-electronica-dian',
        description: 'Emisión y envío de facturas electrónicas habilitadas ante la DIAN.',
        content: [
          ['p', 'La industria emitía facturas en papel y perdía tiempo en el proceso. Integramos facturación electrónica habilitada ante la DIAN con su ERP.'],
          ['h2', 'Emisión automática'],
          ['p', 'Cada factura se genera, firma y envía a la DIAN automáticamente desde el sistema de ventas.'],
          ['h2', 'Notas y trazabilidad'],
          ['p', 'Notas crédito y débito con seguimiento completo del estado de cada documento.'],
          ['h3', 'Respaldo contable'],
          ['p', 'Los documentos se archivan y exportan para contabilidad sin intervención manual.'],
        ],
      },
      en: {
        title: 'Electronic invoicing with the DIAN',
        description: 'Issuance and delivery of electronic invoices enabled before the DIAN.',
        content: [
          ['p', 'The factory issued paper invoices and wasted time in the process. We integrated electronic invoicing enabled before the DIAN with its ERP.'],
          ['h2', 'Automatic issuance'],
          ['p', 'Each invoice is generated, signed and sent to the DIAN automatically from the sales system.'],
          ['h2', 'Credit notes and traceability'],
          ['p', 'Credit and debit notes with full status tracking of each document.'],
          ['h3', 'Accounting backup'],
          ['p', 'Documents are archived and exported for accounting without manual intervention.'],
        ],
      },
      client: 'Industrias Metálicas del Valle',
      year: 2025,
      coverImage: image1.id as number,
      projectType: 'software-empresarial',
      category: 'erp',
      tags: ['Facturación', 'Integración'],
      websiteUrl: 'https://industriasvalle.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/facturacion-dian',
      toc: 'inherit',
    },
    {
      es: {
        title: 'App web de telemedicina',
        slug: 'telemedicina-app',
        description: 'Consultas médicas por video con agenda, recetas y expediente digital.',
        content: [
          ['p', 'El centro médico necesitaba atender pacientes a distancia. Desarrollamos una plataforma de telemedicina con video, agenda y recetas electrónicas.'],
          ['h2', 'Video y expediente'],
          ['p', 'Consultas por video con expediente clínico digital accesible para el médico y el paciente.'],
          ['h2', 'Recetas y ordenes'],
          ['p', 'Recetas electrónicas y órdenes de laboratorio generadas y enviadas al paciente.'],
          ['h3', 'Seguridad de datos médicos'],
          ['p', 'Cifrado y control de acceso estricto sobre la información clínica, conforme a la ley.'],
        ],
      },
      en: {
        title: 'Telemedicine web app',
        description: 'Video medical consultations with scheduling, prescriptions and digital records.',
        content: [
          ['p', 'The medical center needed to serve patients remotely. We built a telemedicine platform with video, scheduling and electronic prescriptions.'],
          ['h2', 'Video and records'],
          ['p', 'Video consultations with a digital clinical record accessible to doctor and patient.'],
          ['h2', 'Prescriptions and orders'],
          ['p', 'Electronic prescriptions and lab orders generated and sent to the patient.'],
          ['h3', 'Medical data security'],
          ['p', 'Encryption and strict access control over clinical information, in accordance with the law.'],
        ],
      },
      client: 'Centro Médico Vital',
      year: 2026,
      coverImage: image2.id as number,
      projectType: 'desarrollo-web',
      category: 'aplicaciones-web',
      tags: ['Telemedicina', 'Apps', 'Seguridad'],
      websiteUrl: 'https://centromedicovital.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/telemedicina',
      toc: 'enabled',
    },
    {
      es: {
        title: 'Portal de proveedores con inicio de sesión único',
        slug: 'portal-proveedores-sso',
        description: 'Autoservicio para proveedores con autenticación federada y roles.',
        content: [
          ['p', 'El grupo empresarial gestionaba a cientos de proveedores por correo. Creamos un portal de autoservicio con inicio de sesión único.'],
          ['h2', 'Autenticación federada'],
          ['p', 'Los proveedores inician sesión con su propia identidad corporativa mediante SSO.'],
          ['h2', 'Documentos y procesos'],
          ['p', 'Carga de documentos, estados de pago y órdenes de compra en un solo lugar.'],
          ['h3', 'Roles granulares'],
          ['p', 'Cada usuario ve únicamente la información de su empresa y su área.'],
        ],
      },
      en: {
        title: 'Supplier portal with single sign-on',
        description: 'Supplier self-service with federated authentication and roles.',
        content: [
          ['p', 'The business group managed hundreds of suppliers by email. We built a self-service portal with single sign-on.'],
          ['h2', 'Federated authentication'],
          ['p', 'Suppliers sign in with their own corporate identity via SSO.'],
          ['h2', 'Documents and processes'],
          ['p', 'Document upload, payment status and purchase orders in one place.'],
          ['h3', 'Granular roles'],
          ['p', 'Each user sees only their company and area information.'],
        ],
      },
      client: 'Grupo Empresarial del Pacífico',
      year: 2024,
      coverImage: image1.id as number,
      projectType: 'software-empresarial',
      category: 'crm',
      tags: ['Seguridad', 'Desarrollo Web'],
      websiteUrl: 'https://grupopacifico.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/portal-proveedores',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Campaña multicanal de marketing digital',
        slug: 'campana-marketing-multicanal',
        description: 'SEO, email y redes sociales integrados para una clínica estética.',
        content: [
          ['p', 'La clínica necesitaba llenar su agenda de citas. Diseñamos una campaña multicanal que combinó SEO, email y redes sociales.'],
          ['h2', 'Estrategia y segmentación'],
          ['p', 'Audiencias segmentadas por servicio y etapa de decisión en cada canal.'],
          ['h2', 'Ejecución y automatización'],
          ['p', 'Campañas de email y WhatsApp automatizadas con seguimiento de cada conversión.'],
          ['h3', 'Resultados medidos'],
          ['p', 'El retorno de inversión se midió por canal y por servicio, optimizando el presupuesto.'],
        ],
      },
      en: {
        title: 'Multichannel digital marketing campaign',
        description: 'SEO, email and social media integrated for an aesthetic clinic.',
        content: [
          ['p', 'The clinic needed to fill its appointment book. We designed a multichannel campaign combining SEO, email and social media.'],
          ['h2', 'Strategy and segmentation'],
          ['p', 'Audiences segmented by service and decision stage on each channel.'],
          ['h2', 'Execution and automation'],
          ['p', 'Automated email and WhatsApp campaigns with conversion tracking.'],
          ['h3', 'Measured results'],
          ['p', 'Return on investment was measured by channel and service, optimizing the budget.'],
        ],
      },
      client: 'Clínica Estética Renace',
      year: 2025,
      coverImage: image2.id as number,
      projectType: 'marketing-digital',
      category: 'seo',
      tags: ['Marketing Digital', 'SEO'],
      websiteUrl: 'https://renaceestetica.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/campana-multicanal',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Migración VoIP desde central analógica',
        slug: 'migracion-voip-analogica',
        description: 'Renovación de la telefonía del hotel sin cambiar los números actuales.',
        content: [
          ['p', 'El hotel usaba una central analógica de más de 15 años. Migramos toda la telefonía a VoIP conservando los números y extensiones.'],
          ['h2', 'Plan de migración'],
          ['p', 'Fase de convivencia entre la central antigua y la nueva durante la transición.'],
          ['h2', 'Portabilidad de números'],
          ['p', 'Los números principales se portaron al nuevo proveedor sin interrumpir el servicio.'],
          ['h3', 'Capacitación del personal'],
          ['p', 'El equipo de recepción y housekeeping se capacitó en la nueva consola de llamadas.'],
        ],
      },
      en: {
        title: 'VoIP migration from an analog switchboard',
        description: 'Renovating hotel telephony without changing current numbers.',
        content: [
          ['p', 'The hotel used an analog switchboard over 15 years old. We migrated all telephony to VoIP while keeping numbers and extensions.'],
          ['h2', 'Migration plan'],
          ['p', 'A coexistence phase between the old and new switchboard during the transition.'],
          ['h2', 'Number portability'],
          ['p', 'Main numbers were ported to the new provider without interrupting service.'],
          ['h3', 'Staff training'],
          ['p', 'Reception and housekeeping teams were trained on the new call console.'],
        ],
      },
      client: 'Hotel & Resort Bahía',
      year: 2024,
      coverImage: image1.id as number,
      projectType: 'telecomunicaciones',
      category: 'pbx-voip',
      tags: ['VoIP', 'Telefonía IP'],
      websiteUrl: 'https://bahiaresort.com',
      sourceUrl: 'https://github.com/viptelcomunicaciones/migracion-voip-hotel',
      toc: 'inherit',
    },
    {
      es: {
        title: 'Plataforma inmobiliaria con mapas',
        slug: 'plataforma-inmobiliaria-mapas',
        description: 'Buscador de inmuebles con mapas interactivos y fichas detalladas.',
        content: [
          ['p', 'La inmobiliaria publicaba sus propiedades en páginas aisladas. Construimos una plataforma con buscador avanzado y mapas interactivos.'],
          ['h2', 'Buscador y filtros'],
          ['p', 'Filtros por zona, precio, área y tipo de inmueble con resultados instantáneos.'],
          ['h2', 'Mapas y geolocalización'],
          ['p', 'Cada propiedad se ubica en un mapa con información de la zona y transporte cercano.'],
          ['h3', 'Fichas optimizadas'],
          ['p', 'Fichas con galería, planos y formulario de contacto directo con el asesor.'],
        ],
      },
      en: {
        title: 'Real estate platform with maps',
        description: 'Property search with interactive maps and detailed listings.',
        content: [
          ['p', 'The real estate agency published its properties on isolated pages. We built a platform with an advanced search and interactive maps.'],
          ['h2', 'Search and filters'],
          ['p', 'Filters by area, price, size and property type with instant results.'],
          ['h2', 'Maps and geolocation'],
          ['p', 'Each property is located on a map with neighborhood and nearby transport information.'],
          ['h3', 'Optimized listings'],
          ['p', 'Listings with gallery, floor plans and a direct contact form with the advisor.'],
        ],
      },
      client: 'Inmobiliaria Capital',
      year: 2026,
      coverImage: image2.id as number,
      projectType: 'desarrollo-web',
      category: 'aplicaciones-web',
      tags: ['Desarrollo Web', 'Apps', 'SEO'],
      websiteUrl: 'https://inmobiliariacapital.co',
      sourceUrl: 'https://github.com/viptelcomunicaciones/plataforma-inmobiliaria',
      toc: 'disabled',
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
        content: sections(...project.es.content),
        client: project.client,
        year: project.year,
        coverImage: project.coverImage,
        projectType: projectTypeIdBySlug.get(project.projectType) as number,
        categories: projectCategoryIdBySlug.get(project.category) as number,
        tags: await Promise.all(project.tags.map(ensureTag)),
        websiteUrl: project.websiteUrl,
        sourceUrl: project.sourceUrl,
        toc: project.toc ?? 'inherit',
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
        content: sections(...project.en.content),
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
