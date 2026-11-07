import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  process.env.DISABLE_REVALIDATE = 'true'
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Globals (SiteSettings, Header and Footer)...')

  // 1. SiteSettings Global
  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'es',
    context: { disableRevalidate: false },
    data: {
      name: 'Viptel Comunicaciones',
      description:
        'Soluciones empresariales de telecomunicaciones: PBX, VoIP, desarrollo web, marketing digital y software empresarial.',
      tagline: 'Soluciones integrales de telecomunicaciones',
      footerNote: 'Viptel Comunicaciones · Todos los derechos reservados',
      url: 'https://viptelcomunicaciones.com',
      email: 'info@viptel.com',
      phone: '+57 1 2345678',
      address: {
        street: 'Calle 100 # 15-20',
        city: 'Bogotá',
        state: 'Bogotá D.C.',
        zip: '110111',
        country: 'Colombia',
      },
      colors: {
        themeColor: '#0055aa',
        backgroundColor: '#ffffff',
      },
      defaultTheme: 'blue',
      defaultColorMode: 'system',
      enabledThemes: [
        'orange',
        'amber',
        'lime',
        'emerald',
        'teal',
        'cyan',
        'sky',
        'blue',
        'indigo',
        'violet',
        'purple',
        'magenta',
      ],
      blogImageOverlay: true,
      cursorTrail: true,
      socialLinks: [
        { label: 'LinkedIn', url: 'https://www.linkedin.com/company/viptel' },
        { label: 'X', url: 'https://x.com/viptel' },
      ],
      twitterSite: '@viptel',
      toc: {
        enabled: true,
        layout: 'auto',
        sidebarPosition: 'right',
        minHeadings: 3,
        maxDepth: '3',
      },
      comments: {
        enabled: false,
        provider: 'giscus',
      },
      blog: {
        postsPerPage: 12,
        tagCloudLimit: 0,
        rssMaxItems: 20,
      },
      projects: {
        perPage: 12,
        tagCloudLimit: 0,
      },
      schemas: {
        includeOrgSchema: true,
        includePersonSchema: true,
        includeProfessionalServiceSchema: false,
      },
    },
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    locale: 'en',
    context: { disableRevalidate: false },
    data: {
      name: 'Viptel Communications',
      description:
        'Enterprise telecommunications solutions: PBX, VoIP, web development, digital marketing, and enterprise software.',
      tagline: 'Integral telecommunications solutions',
      footerNote: 'Viptel Communications · All rights reserved',
      url: 'https://viptelcomunicaciones.com',
      email: 'info@viptel.com',
      phone: '+57 1 2345678',
      address: {
        street: 'Calle 100 # 15-20',
        city: 'Bogotá',
        state: 'Bogotá D.C.',
        zip: '110111',
        country: 'Colombia',
      },
    },
  })
  payload.logger.info('  ✓ SiteSettings global seeded (es/en)')

  // Service sub-links for dropdown
  const serviceSubLinksEs = [
    { link: { type: 'custom' as const, label: 'Conmutador en la nube (PBX)', url: '/services/conmutador-en-la-nube' } },
    { link: { type: 'custom' as const, label: 'Telefonía IP (VoIP)', url: '/services/telefonia-ip' } },
    { link: { type: 'custom' as const, label: 'Sitio Informativo (Web)', url: '/services/sitio-informativo' } },
    { link: { type: 'custom' as const, label: 'Comercio Electrónico', url: '/services/comercio-electronico' } },
    { link: { type: 'custom' as const, label: 'Marketing Digital y SEO', url: '/services/marketing-digital-y-seo' } },
  ]

  const serviceSubLinksEn = [
    { link: { type: 'custom' as const, label: 'Cloud PBX Switchboard', url: '/en/services/conmutador-en-la-nube' } },
    { link: { type: 'custom' as const, label: 'IP Telephony (VoIP)', url: '/en/services/telefonia-ip' } },
    { link: { type: 'custom' as const, label: 'Informational Website', url: '/en/services/sitio-informativo' } },
    { link: { type: 'custom' as const, label: 'E-commerce Store', url: '/en/services/comercio-electronico' } },
    { link: { type: 'custom' as const, label: 'Digital Marketing & SEO', url: '/en/services/marketing-digital-y-seo' } },
  ]

  // 2. Header Global
  await payload.updateGlobal({
    slug: 'header',
    locale: 'es',
    context: { disableRevalidate: false },
    data: {
      position: 'sticky',
      shape: 'bar',
      size: 'md',
      variant: 'default',
      colorScheme: 'default',
      layout: 'default',
      maxWidth: '6xl',
      showSearch: true,
      showThemeToggle: true,
      showThemeSelector: false,
      showLanguageSwitcher: true,
      showSocialLinks: false,
      showMobileMenu: true,
      showActiveState: true,
      hideLogo: false,
      showScrollProgress: false,
      autoHide: false,
      invertOnReturn: false,
      navItems: [
        { link: { type: 'custom' as const, label: 'Inicio', url: '/' } },
        { link: { type: 'custom' as const, label: 'Servicios', url: '/services' }, children: serviceSubLinksEs },
        { link: { type: 'custom' as const, label: 'Portafolio', url: '/projects' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/blog' } },
        { link: { type: 'custom' as const, label: 'Nosotros', url: '/about' } },
        { link: { type: 'custom' as const, label: 'Contacto', url: '/contact' } },
      ],
      cta: {
        showCta: true,
        link: { type: 'custom' as const, label: 'Comenzar', url: '/contact' },
      },
    },
  })

  await payload.updateGlobal({
    slug: 'header',
    locale: 'en',
    context: { disableRevalidate: false },
    data: {
      position: 'sticky',
      shape: 'bar',
      size: 'md',
      variant: 'default',
      colorScheme: 'default',
      layout: 'default',
      maxWidth: '6xl',
      showSearch: true,
      showThemeToggle: true,
      showThemeSelector: false,
      showLanguageSwitcher: true,
      showSocialLinks: false,
      showMobileMenu: true,
      showActiveState: true,
      hideLogo: false,
      showScrollProgress: false,
      autoHide: false,
      invertOnReturn: false,
      navItems: [
        { link: { type: 'custom' as const, label: 'Home', url: '/en' } },
        { link: { type: 'custom' as const, label: 'Services', url: '/en/services' }, children: serviceSubLinksEn },
        { link: { type: 'custom' as const, label: 'Portfolio', url: '/en/projects' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/en/blog' } },
        { link: { type: 'custom' as const, label: 'About', url: '/en/about' } },
        { link: { type: 'custom' as const, label: 'Contact', url: '/en/contact' } },
      ],
      cta: {
        showCta: true,
        link: { type: 'custom' as const, label: 'Get Started', url: '/en/contact' },
      },
    },
  })
  payload.logger.info('  ✓ Header global seeded (es/en)')

  // 3. Footer Global
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'es',
    context: { disableRevalidate: false },
    data: {
      layout: 'columns',
      columns: '3',
      background: 'default',
      maxWidth: '6xl',
      showSocial: true,
      showCopyright: true,
      hideLogo: false,
      tagline: 'Soluciones integrales de telecomunicaciones y desarrollo digital',
      copyright: 'Viptel Comunicaciones S.A.S. · Todos los derechos reservados',
      navItems: [
        { link: { type: 'custom' as const, label: 'Servicios', url: '/services' } },
        { link: { type: 'custom' as const, label: 'Portafolio', url: '/projects' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/blog' } },
        { link: { type: 'custom' as const, label: 'Nosotros', url: '/about' } },
        { link: { type: 'custom' as const, label: 'Contacto', url: '/contact' } },
      ],
      linkGroups: [
        {
          title: 'Servicios',
          links: [
            { link: { type: 'custom' as const, label: 'Conmutador en la nube', url: '/services/conmutador-en-la-nube' } },
            { link: { type: 'custom' as const, label: 'Telefonía IP', url: '/services/telefonia-ip' } },
            { link: { type: 'custom' as const, label: 'Desarrollo Web', url: '/services/sitio-informativo' } },
            { link: { type: 'custom' as const, label: 'Comercio Electrónico', url: '/services/comercio-electronico' } },
          ],
        },
        {
          title: 'Compañía',
          links: [
            { link: { type: 'custom' as const, label: 'Inicio', url: '/' } },
            { link: { type: 'custom' as const, label: 'Portafolio', url: '/projects' } },
            { link: { type: 'custom' as const, label: 'Blog y Artículos', url: '/blog' } },
            { link: { type: 'custom' as const, label: 'Sobre Nosotros', url: '/about' } },
            { link: { type: 'custom' as const, label: 'Contacto', url: '/contact' } },
          ],
        },
        {
          title: 'Legal',
          links: [
            { link: { type: 'custom' as const, label: 'Privacidad', url: '/privacy' } },
            { link: { type: 'custom' as const, label: 'Términos de Servicio', url: '/terms' } },
          ],
        },
      ],
      legalLinks: [
        { link: { type: 'custom' as const, label: 'Privacidad', url: '/privacy' } },
        { link: { type: 'custom' as const, label: 'Términos', url: '/terms' } },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    context: { disableRevalidate: false },
    data: {
      layout: 'columns',
      columns: '3',
      background: 'default',
      maxWidth: '6xl',
      showSocial: true,
      showCopyright: true,
      hideLogo: false,
      tagline: 'Integral telecommunications solutions and digital development',
      copyright: 'Viptel Comunicaciones S.A.S. · All rights reserved',
      navItems: [
        { link: { type: 'custom' as const, label: 'Services', url: '/en/services' } },
        { link: { type: 'custom' as const, label: 'Portfolio', url: '/en/projects' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/en/blog' } },
        { link: { type: 'custom' as const, label: 'About', url: '/en/about' } },
        { link: { type: 'custom' as const, label: 'Contact', url: '/en/contact' } },
      ],
      linkGroups: [
        {
          title: 'Services',
          links: [
            { link: { type: 'custom' as const, label: 'Cloud PBX', url: '/en/services/conmutador-en-la-nube' } },
            { link: { type: 'custom' as const, label: 'IP Telephony', url: '/en/services/telefonia-ip' } },
            { link: { type: 'custom' as const, label: 'Web Development', url: '/en/services/sitio-informativo' } },
            { link: { type: 'custom' as const, label: 'E-commerce', url: '/en/services/comercio-electronico' } },
          ],
        },
        {
          title: 'Company',
          links: [
            { link: { type: 'custom' as const, label: 'Home', url: '/en' } },
            { link: { type: 'custom' as const, label: 'Portfolio', url: '/en/projects' } },
            { link: { type: 'custom' as const, label: 'Blog', url: '/en/blog' } },
            { link: { type: 'custom' as const, label: 'About Us', url: '/en/about' } },
            { link: { type: 'custom' as const, label: 'Contact', url: '/en/contact' } },
          ],
        },
        {
          title: 'Legal',
          links: [
            { link: { type: 'custom' as const, label: 'Privacy Policy', url: '/en/privacy' } },
            { link: { type: 'custom' as const, label: 'Terms of Service', url: '/en/terms' } },
          ],
        },
      ],
      legalLinks: [
        { link: { type: 'custom' as const, label: 'Privacy', url: '/en/privacy' } },
        { link: { type: 'custom' as const, label: 'Terms', url: '/en/terms' } },
      ],
    },
  })
  payload.logger.info('  ✓ Footer global seeded (es/en)')

  payload.logger.info('Globals successfully seeded.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Error seeding globals:', err)
  process.exit(1)
})
