# Task 4: Backend — Update seed script with services

## Files
- Modify: `backend/src/scripts/seed.ts`

## Requirements

### 1. Add 'services' to collections array (line ~21-29)

Add `'services'` to the collections array so it gets cleared before re-seeding.

### 2. Add services seed block

Insert the service seeding code AFTER the projects seed loop (after the last `for (const project of projectsData)` block, before the line `payload.logger.info('- Seeding globals...')`).

Use the exact code below:

```ts
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
```

## Verification
Run: `pnpm --filter ./backend run seed`
Expected: Seeds all 5 categories + 14 sub-services, logs success.
