import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

async function run() {
  process.env.DISABLE_REVALIDATE = 'true'
  const payload = await getPayload({ config })

  payload.logger.info('Seeding Globals (Header and Footer)...')

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

  // 1. Header Global
  await payload.updateGlobal({
    slug: 'header',
    locale: 'es',
    context: { disableRevalidate: false },
    data: {
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

  // 2. Footer Global
  await payload.updateGlobal({
    slug: 'footer',
    locale: 'es',
    context: { disableRevalidate: false },
    data: {
      navItems: [
        { link: { type: 'custom' as const, label: 'Servicios', url: '/services' } },
        { link: { type: 'custom' as const, label: 'Portafolio', url: '/projects' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/blog' } },
        { link: { type: 'custom' as const, label: 'Nosotros', url: '/about' } },
        { link: { type: 'custom' as const, label: 'Contacto', url: '/contact' } },
      ],
      legalLinks: [
        { link: { type: 'custom' as const, label: 'Privacidad', url: '/privacy' } },
        { link: { type: 'custom' as const, label: 'Términos', url: '/terms' } },
      ],
      copyright: 'Viptel Comunicaciones S.A.S.',
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    locale: 'en',
    context: { disableRevalidate: false },
    data: {
      navItems: [
        { link: { type: 'custom' as const, label: 'Services', url: '/en/services' } },
        { link: { type: 'custom' as const, label: 'Portfolio', url: '/en/projects' } },
        { link: { type: 'custom' as const, label: 'Blog', url: '/en/blog' } },
        { link: { type: 'custom' as const, label: 'About', url: '/en/about' } },
        { link: { type: 'custom' as const, label: 'Contact', url: '/en/contact' } },
      ],
      legalLinks: [
        { link: { type: 'custom' as const, label: 'Privacy', url: '/en/privacy' } },
        { link: { type: 'custom' as const, label: 'Terms', url: '/en/terms' } },
      ],
      copyright: 'Viptel Comunicaciones S.A.S.',
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
