import 'dotenv/config'
import type { Payload, RequiredDataFromCollectionSlug } from 'payload'
import { getPayload } from 'payload'

import config from '../payload.config'

// ---------- Lexical helpers ----------
const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

const paragraph = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  type: 'paragraph',
  version: 1,
})

const heading = (text: string) => ({
  children: [textNode(text)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag: 'h2',
  type: 'heading',
  version: 1,
})

const richText = (paras: string[]): Record<string, unknown> => ({
  root: {
    children: paras.filter(Boolean).map(paragraph),
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

const ctaBlock = (headingText: string, text: string, label: string) => ({
  blockType: 'cta',
  richText: {
    root: {
      children: [heading(headingText), paragraph(text)],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  },
  links: [
    {
      link: {
        type: 'custom',
        url: '/contact',
        newTab: false,
        label,
        appearance: 'default',
      },
    },
  ],
})

// ---------- Content types ----------
type FeatureDef = { title: string; description?: string; icon: string }
type FaqDef = { question: string; answer: string }
type PlanDef = {
  planName: string
  features?: string[]
  highlighted?: boolean
  ctaLabel?: string
}

type LocaleContent = {
  title?: string
  shortDescription?: string
  description: string[]
  features?: FeatureDef[]
  faq?: FaqDef[]
  pricing?: PlanDef[]
  cta: { heading: string; text: string; label: string }
}

type ServiceSeed = {
  slug: string
  parentSlug?: string
  icon?: string
  es: LocaleContent
  en: LocaleContent
}

const plan = (planName: string, features: string[], highlighted = false): PlanDef => ({
  planName,
  features,
  highlighted,
  ctaLabel: 'Cotizar',
})

const planEn = (planName: string, features: string[], highlighted = false): PlanDef => ({
  planName,
  features,
  highlighted,
  ctaLabel: 'Get a quote',
})

// ---------- Services content ----------
const services: ServiceSeed[] = [
  // ============ VIPTEL-PBX ============
  {
    slug: 'viptel-pbx',
    icon: 'phone',
    es: {
      description: [
        'Centrales telefónicas virtuales en la nube para empresas de todos los tamaños. Desde el PBX básico para micro y pequeñas empresas hasta la central avanzada con capacidades de call center, monitoreo en tiempo real y reportes de productividad.',
        'Sin equipos físicos ni infraestructura compleja: el equipo atiende desde la oficina, remoto o móvil usando Internet, manteniendo una imagen corporativa profesional y un único número de contacto.',
      ],
      faq: [
        { question: '¿Qué es un PBX virtual?', answer: 'Es una central telefónica alojada en la nube que gestiona las llamadas de tu empresa por Internet, sin necesidad de comprar equipos físicos ni contratar infraestructura propia.' },
        { question: '¿Puedo conservar mi número actual?', answer: 'Sí. Podemos portar tu número fijo o móvil existente a nuestra plataforma para que tus clientes sigan marcándote igual.' },
        { question: '¿Qué diferencia hay entre el PBX básico y el avanzado?', answer: 'El avanzado incluye todo lo del básico y añade colas de llamadas, grabación, monitoreo en tiempo real, reportes de productividad e integración con CRM. También puede activarse el módulo de call center.' },
        { question: '¿El equipo puede trabajar desde casa?', answer: 'Sí. Cada colaborador recibe una extensión que funciona desde un teléfono IP, un softphone en el PC o una app móvil, en la oficina o en remoto.' },
      ],
      cta: { heading: '¿Listo para modernizar tu telefonía?', text: 'Cotiza tu central telefónica en la nube y empieza a atender como una empresa grande.', label: 'Cotizar PBX' },
    },
    en: {
      description: [
        'Virtual cloud phone systems for companies of all sizes. From the basic PBX for micro and small businesses to the advanced switchboard with call center capabilities, real-time monitoring and productivity reports.',
        'No physical equipment or complex infrastructure: your team can take calls from the office, remotely or on mobile using the Internet, keeping a professional corporate image and a single point of contact.',
      ],
      faq: [
        { question: 'What is a virtual PBX?', answer: 'It is a cloud-hosted phone system that manages your company calls over the Internet, without buying physical equipment or setting up your own infrastructure.' },
        { question: 'Can I keep my current number?', answer: 'Yes. We can port your existing landline or mobile number to our platform so your customers keep dialing the same number.' },
        { question: 'What is the difference between basic and advanced PBX?', answer: 'Advanced includes everything in basic plus call queues, call recording, real-time monitoring, productivity reports and CRM integration. A call center module can also be added.' },
        { question: 'Can the team work from home?', answer: 'Yes. Each employee gets an extension that works from an IP phone, a softphone on the PC or a mobile app — in the office or remotely.' },
      ],
      cta: { heading: 'Ready to modernize your telephony?', text: 'Get a quote for your cloud phone system and start answering like a big company.', label: 'Quote PBX' },
    },
  },
  {
    slug: 'basica',
    parentSlug: 'viptel-pbx',
    icon: 'phone-call',
    es: {
      shortDescription: 'Hasta 10 extensiones. Ideal para pequeñas empresas y startups.',
      description: [
        'Solución de PBX IP virtual en la nube diseñada para micro y pequeñas empresas que desean una central telefónica profesional sin invertir en equipos físicos ni infraestructura compleja.',
        'Permite que el equipo atienda llamadas desde la oficina o en remoto usando Internet, manteniendo una imagen corporativa organizada con un único número principal.',
      ],
      features: [
        { title: 'Extensiones internas', description: 'Una extensión por colaborador: oficina, remoto o móvil.', icon: 'users' },
        { title: 'Número principal', description: 'Recepción de todas las llamadas a través del número corporativo.', icon: 'phone' },
        { title: 'Troncales SIP', description: 'Llamadas entrantes y salientes a cualquier destino nacional e internacional.', icon: 'network' },
        { title: 'IVR sencillo', description: 'Mensaje de bienvenida y menú de opciones básico.', icon: 'voicemail' },
        { title: 'Transferencia de llamadas', description: 'Entre extensiones y grupos de timbrado.', icon: 'phone-call' },
        { title: 'Buzón de voz por extensión', description: 'Con envío de los mensajes al correo electrónico.', icon: 'mail' },
        { title: 'Multiplataforma', description: 'Teléfonos IP, softphones en PC y aplicaciones móviles.', icon: 'smartphone' },
        { title: 'Panel web de administración', description: 'Gestión de extensiones y reglas de enrutamiento.', icon: 'monitor' },
      ],
      faq: [
        { question: '¿Para qué tamaño de empresa es el PBX básico?', answer: 'Está pensado para micro y pequeñas empresas de hasta 10 extensiones que quieren profesionalizar su atención telefónica.' },
        { question: '¿Necesito comprar equipos?', answer: 'No. Funciona con teléfonos IP, softphones en el PC o apps móviles. Solo necesitas una conexión a Internet estable.' },
        { question: '¿Puedo crecer más adelante?', answer: 'Sí. Cuando necesites más de 10 extensiones o funciones avanzadas, migramos tu configuración al PBX avanzado sin perder tus números ni reglas.' },
        { question: '¿Recibo el buzón de voz en mi correo?', answer: 'Sí, cada buzón de voz por extensión puede configurarse para enviar el audio al correo electrónico del colaborador.' },
      ],
      pricing: [
        plan('Básico', ['Hasta 5 extensiones', '1 troncal SIP', 'IVR sencillo', 'Buzón de voz por extensión']),
        plan('Emprendedor', ['Hasta 10 extensiones', '2 troncales SIP', 'Panel web de administración', 'Soporte en horario laboral'], true),
        plan('Personalizado', ['Más de 10 extensiones', 'Troncales adicionales', 'Migración asistida desde PBX anterior']),
      ],
      cta: { heading: 'Una central profesional sin hardware', text: 'Empieza hoy con tu PBX en la nube y atiende desde cualquier lugar.', label: 'Cotizar PBX básico' },
    },
    en: {
      shortDescription: 'Up to 10 extensions. Ideal for small businesses and startups.',
      description: [
        'Virtual cloud PBX IP solution designed for micro and small businesses that want a professional phone system without investing in physical equipment or complex infrastructure.',
        'It lets the team take calls from the office or remotely over the Internet, keeping an organized corporate image with a single main number.',
      ],
      features: [
        { title: 'Internal extensions', description: 'One extension per employee: office, remote or mobile.', icon: 'users' },
        { title: 'Main number', description: 'All calls are received through the corporate number.', icon: 'phone' },
        { title: 'SIP trunks', description: 'Inbound and outbound calls to any national and international destination.', icon: 'network' },
        { title: 'Simple IVR', description: 'Welcome message and basic option menu.', icon: 'voicemail' },
        { title: 'Call transfer', description: 'Between extensions and ring groups.', icon: 'phone-call' },
        { title: 'Per-extension voicemail', description: 'With delivery of messages to email.', icon: 'mail' },
        { title: 'Multi-platform', description: 'IP phones, PC softphones and mobile apps.', icon: 'smartphone' },
        { title: 'Web admin panel', description: 'Extension and routing rule management.', icon: 'monitor' },
      ],
      faq: [
        { question: 'What company size is the basic PBX for?', answer: 'It is designed for micro and small businesses with up to 10 extensions that want to professionalize their phone service.' },
        { question: 'Do I need to buy equipment?', answer: 'No. It works with IP phones, PC softphones or mobile apps. You only need a stable Internet connection.' },
        { question: 'Can I grow later?', answer: 'Yes. When you need more than 10 extensions or advanced features, we migrate your setup to the advanced PBX without losing your numbers or rules.' },
        { question: 'Do I receive voicemail in my email?', answer: 'Yes, each per-extension voicemail can be configured to deliver the audio to the employee\u2019s email.' },
      ],
      pricing: [
        planEn('Basic', ['Up to 5 extensions', '1 SIP trunk', 'Simple IVR', 'Per-extension voicemail']),
        planEn('Entrepreneur', ['Up to 10 extensions', '2 SIP trunks', 'Web admin panel', 'Business-hours support'], true),
        planEn('Custom', ['More than 10 extensions', 'Additional trunks', 'Assisted migration from previous PBX']),
      ],
      cta: { heading: 'A professional switchboard without hardware', text: 'Start today with your cloud PBX and take calls from anywhere.', label: 'Quote basic PBX' },
    },
  },
  {
    slug: 'avanzada',
    parentSlug: 'viptel-pbx',
    icon: 'headset',
    es: {
      shortDescription: 'Extensiones ilimitadas, IVR, grabación de llamadas y reportes.',
      description: [
        'Central telefónica IP avanzada en la nube orientada a empresas con mayor volumen de llamadas, áreas comerciales y mesas de servicio que requieren control, monitoreo y reportes detallados.',
        'Integra funciones de call center y puede conectarse con CRM y otros sistemas corporativos. Incluye además el Módulo Call Center CE para gestionar campañas entrantes y salientes con marcador predictivo, supervisión en tiempo real y reportes automatizados.',
      ],
      features: [
        { title: 'Todo el PBX básico', description: 'Extensiones, troncales SIP, IVR, buzón de voz y panel web.', icon: 'circle-check' },
        { title: 'Colas de llamadas', description: 'Grupos de timbrado y priorización de atención.', icon: 'users' },
        { title: 'IVR por horario o campaña', description: 'Mensajes personalizados según la hora, el área o la campaña.', icon: 'voicemail' },
        { title: 'Grabación de llamadas', description: 'Entrantes y salientes para respaldo y calidad.', icon: 'radio-tower' },
        { title: 'Monitoreo en tiempo real', description: 'Escucha, susurro y conferencia para supervisar la operación.', icon: 'headphones' },
        { title: 'Reportes de productividad', description: 'Llamadas, tiempos de espera, duración y nivel de servicio.', icon: 'chart-bar' },
        { title: 'Integración con CRM', description: 'Click-to-call y registro automático de interacciones.', icon: 'database' },
        { title: 'Marcador predictivo', description: 'Campañas outbound con modos predictivo, progresivo y preview.', icon: 'zap' },
        { title: 'Campañas entrantes ACD', description: 'Distribución automática al próximo agente libre.', icon: 'network' },
        { title: 'Panel de supervisor', description: 'Campañas activas, agentes conectados y tiempos de espera.', icon: 'monitor' },
        { title: 'Formulario web por campaña', description: 'Recolección de información documentada durante cada llamada.', icon: 'clipboard-list' },
        { title: 'Reportes de IVR y troncales', description: 'Cuellos de botella, uso de canales y desempeño.', icon: 'bar-chart-3' },
      ],
      faq: [
        { question: '¿Incluye el módulo de call center?', answer: 'Sí, el Módulo Call Center CE puede activarse para gestionar campañas entrantes y salientes con marcador predictivo, paneles de supervisor y reportes por agente.' },
        { question: '¿Qué es el marcador predictivo?', answer: 'El sistema marca automáticamente los números de tu base de contactos y conecta la llamada con un agente libre, maximizando la productividad del equipo comercial.' },
        { question: '¿Puedo escuchar las llamadas de mi equipo?', answer: 'Sí, el monitoreo en tiempo real permite escucha silenciosa, susurro al agente y conferencia para acompañamiento.' },
        { question: '¿Se integra con mi CRM?', answer: 'Sí. Incluye click-to-call y registro automático de interacciones para unificar la gestión de clientes.' },
        { question: '¿Cómo mido la productividad del equipo?', answer: 'Con reportes de llamadas, tiempos de espera, duración, nivel de servicio y desglose por agente, disponibles desde el panel web.' },
      ],
      pricing: [
        plan('Empresa', ['Extensiones ilimitadas', 'Colas y priorización', 'Grabación de llamadas', 'Reportes de productividad']),
        plan('Corporativo', ['Todo Empresa', 'Módulo Call Center', 'Monitoreo en tiempo real', 'Integración con CRM'], true),
        plan('Custom', ['Campañas masivas', 'Integraciones a medida', 'Múltiples sedes']),
      ],
      cta: { heading: 'Control total de tu operación telefónica', text: 'Descubre la central avanzada con call center y reportes que tu empresa necesita.', label: 'Cotizar PBX avanzado' },
    },
    en: {
      shortDescription: 'Unlimited extensions, IVR, call recording and reports.',
      description: [
        'Advanced cloud IP phone system aimed at companies with high call volume, commercial areas and service desks that require control, monitoring and detailed reports.',
        'It integrates call center features and can connect with CRM and other corporate systems. It also includes the CE Call Center Module to manage inbound and outbound campaigns with predictive dialing, real-time supervision and automated reports.',
      ],
      features: [
        { title: 'All basic PBX features', description: 'Extensions, SIP trunks, IVR, voicemail and web panel.', icon: 'circle-check' },
        { title: 'Call queues', description: 'Ring groups and service prioritization.', icon: 'users' },
        { title: 'IVR by schedule or campaign', description: 'Custom messages by time, area or campaign.', icon: 'voicemail' },
        { title: 'Call recording', description: 'Inbound and outbound for backup and quality.', icon: 'radio-tower' },
        { title: 'Real-time monitoring', description: 'Listen, whisper and barge-in to supervise the operation.', icon: 'headphones' },
        { title: 'Productivity reports', description: 'Calls, wait times, duration and service level.', icon: 'chart-bar' },
        { title: 'CRM integration', description: 'Click-to-call and automatic interaction logging.', icon: 'database' },
        { title: 'Predictive dialer', description: 'Outbound campaigns with predictive, progressive and preview modes.', icon: 'zap' },
        { title: 'Inbound ACD campaigns', description: 'Automatic distribution to the next available agent.', icon: 'network' },
        { title: 'Supervisor panel', description: 'Active campaigns, connected agents and wait times.', icon: 'monitor' },
        { title: 'Per-campaign web form', description: 'Documented data collection during each call.', icon: 'clipboard-list' },
        { title: 'IVR and trunk reports', description: 'Bottlenecks, channel usage and performance.', icon: 'bar-chart-3' },
      ],
      faq: [
        { question: 'Does it include the call center module?', answer: 'Yes, the CE Call Center Module can be enabled to manage inbound and outbound campaigns with predictive dialing, supervisor panels and per-agent reports.' },
        { question: 'What is a predictive dialer?', answer: 'The system automatically dials numbers from your contact base and connects the call to an available agent, maximizing sales team productivity.' },
        { question: 'Can I listen to my team\u2019s calls?', answer: 'Yes, real-time monitoring supports silent listening, agent whisper and conference coaching.' },
        { question: 'Does it integrate with my CRM?', answer: 'Yes. It includes click-to-call and automatic interaction logging to unify customer management.' },
        { question: 'How do I measure team productivity?', answer: 'With reports on calls, wait times, duration, service level and per-agent breakdown, available from the web panel.' },
      ],
      pricing: [
        planEn('Company', ['Unlimited extensions', 'Queues and prioritization', 'Call recording', 'Productivity reports']),
        planEn('Corporate', ['Everything in Company', 'Call Center module', 'Real-time monitoring', 'CRM integration'], true),
        planEn('Custom', ['Massive campaigns', 'Custom integrations', 'Multiple sites']),
      ],
      cta: { heading: 'Total control of your phone operation', text: 'Discover the advanced switchboard with call center and reports your company needs.', label: 'Quote advanced PBX' },
    },
  },

  // ============ VIPTEL-VOIP ============
  {
    slug: 'viptel-voip',
    icon: 'signal',
    es: {
      description: [
        'Telefonía IP de alta calidad para empresas: terminación de llamadas con las mejores tarifas a todo destino y números DID locales e internacionales para tener presencia telefónica donde tus clientes estén.',
        'Compatible con PBX IP como Issabel, Asterisk, FreePBX y 3CX, y con softphones en PC o móvil. Control total del consumo desde un panel web con reportes detallados.',
      ],
      faq: [
        { question: '¿Qué necesito para usar los servicios VoIP?', answer: 'Una central PBX IP o un softphone compatible con SIP y una conexión a Internet. Nosotros configuramos las troncales y el enrutamiento por ti.' },
        { question: '¿Puedo combinar minutos y números DID?', answer: 'Sí, ambos servicios se integran en la misma plataforma y se administran desde un único panel.' },
        { question: '¿La calidad de las llamadas es estable?', answer: 'Sí, soportamos codecs estándar (G.711, G.729) y monitoreamos las troncales para mantener la calidad de audio.' },
        { question: '¿Cómo controlo el gasto en telefonía?', answer: 'El panel web muestra consumo, tarifas y detalle de llamadas (CDR) por fecha, destino y extensión.' },
      ],
      cta: { heading: 'Telefonía IP que reduce costos', text: 'Cotiza tus minutos y números DID y ahorra frente a la telefonía tradicional.', label: 'Cotizar VoIP' },
    },
    en: {
      description: [
        'High-quality IP telephony for businesses: call termination at the best rates to any destination and local/international DID numbers to have a phone presence wherever your customers are.',
        'Compatible with IP PBX platforms such as Issabel, Asterisk, FreePBX and 3CX, and with PC or mobile softphones. Full consumption control from a web panel with detailed reports.',
      ],
      faq: [
        { question: 'What do I need to use the VoIP services?', answer: 'An IP PBX or a SIP-compatible softphone and an Internet connection. We configure the trunks and routing for you.' },
        { question: 'Can I combine minutes and DID numbers?', answer: 'Yes, both services integrate on the same platform and are managed from a single panel.' },
        { question: 'Is call quality stable?', answer: 'Yes, we support standard codecs (G.711, G.729) and monitor trunks to keep audio quality.' },
        { question: 'How do I control telephony spending?', answer: 'The web panel shows usage, rates and call detail records (CDR) by date, destination and extension.' },
      ],
      cta: { heading: 'IP telephony that cuts costs', text: 'Quote your minutes and DID numbers and save versus traditional telephony.', label: 'Quote VoIP' },
    },
  },
  {
    slug: 'minutos',
    parentSlug: 'viptel-voip',
    icon: 'clock',
    es: {
      shortDescription: 'Terminación de llamadas nacionales e internacionales con la mejor tarifa.',
      description: [
        'Servicio de terminación de llamadas de voz sobre IP que permite realizar llamadas nacionales e internacionales usando troncales SIP conectadas a tu PBX IP o softphones.',
        'Diseñado para reducir los costos de telefonía frente a las líneas tradicionales, mantener una calidad de audio estable y ofrecer control del consumo por área, extensión o campaña.',
      ],
      features: [
        { title: 'Troncales SIP', description: 'Provisionadas para llamadas salientes desde tu PBX o softphones autorizados.', icon: 'network' },
        { title: 'Codecs estándar', description: 'G.711 y G.729 para optimizar calidad y consumo de ancho de banda.', icon: 'signal' },
        { title: 'Límite de llamadas simultáneas', description: 'Configurable por troncal según la capacidad contratada.', icon: 'sliders-horizontal' },
        { title: 'Panel web de administración', description: 'Consulta de consumo, tarifas y detalle de llamadas (CDR).', icon: 'monitor' },
        { title: 'Enrutamiento por prefijos', description: 'Planes de marcación específicos para nacional, móvil e internacional.', icon: 'route' },
        { title: 'Integración con PBX', description: 'Issabel, Asterisk, FreePBX, 3CX y softphones compatibles con SIP.', icon: 'server' },
        { title: 'Autenticación segura', description: 'Usuario/clave e IP autorizada en cada troncal.', icon: 'shield' },
      ],
      faq: [
        { question: '¿Qué destinos puedo llamar?', answer: 'Nacionales e internacionales. El enrutamiento por prefijos define el plan de marcación para cada tipo de destino.' },
        { question: '¿Puedo seguir usando mi PBX actual?', answer: 'Sí. El servicio se integra con Issabel, Asterisk, FreePBX, 3CX y cualquier plataforma compatible con SIP.' },
        { question: '¿Cómo se factura el consumo?', answer: 'Por minuto consumido, con reportes detallados por fecha, destino y extensión disponibles en el panel.' },
        { question: '¿Cuántas llamadas simultáneas puedo hacer?', answer: 'Depende del plan contratado; el límite se configura por troncal y puede ampliarse cuando lo necesites.' },
      ],
      pricing: [
        plan('Nacional', ['Llamadas locales y nacionales', '1 troncal SIP', 'Panel de consumo', 'CDR detallado']),
        plan('Nacional + Móvil', ['Todo Nacional', 'Tráfico a móviles', 'Límite simultáneo configurable']),
        plan('Internacional', ['Todo Nacional + Móvil', 'Destinos internacionales', 'Enrutamiento por prefijos', 'Soporte prioritario'], true),
      ],
      cta: { heading: 'La mejor tarifa por minuto', text: 'Reduce tus costos de telefonía sin sacrificar calidad de audio.', label: 'Cotizar minutos' },
    },
    en: {
      shortDescription: 'National and international call termination at the best rate.',
      description: [
        'Voice over IP call termination service that lets you make national and international calls using SIP trunks connected to your IP PBX or softphones.',
        'Designed to reduce telephony costs versus traditional lines, keep stable audio quality and offer usage control by area, extension or campaign.',
      ],
      features: [
        { title: 'SIP trunks', description: 'Provisioned for outbound calls from your PBX or authorized softphones.', icon: 'network' },
        { title: 'Standard codecs', description: 'G.711 and G.729 to optimize quality and bandwidth usage.', icon: 'signal' },
        { title: 'Simultaneous call limit', description: 'Configurable per trunk according to contracted capacity.', icon: 'sliders-horizontal' },
        { title: 'Web admin panel', description: 'Usage, rates and call detail records (CDR).', icon: 'monitor' },
        { title: 'Prefix routing', description: 'Specific dial plans for national, mobile and international.', icon: 'route' },
        { title: 'PBX integration', description: 'Issabel, Asterisk, FreePBX, 3CX and SIP-compatible softphones.', icon: 'server' },
        { title: 'Secure authentication', description: 'User/password and authorized IP on every trunk.', icon: 'shield' },
      ],
      faq: [
        { question: 'Which destinations can I call?', answer: 'National and international. Prefix routing defines the dial plan for each destination type.' },
        { question: 'Can I keep using my current PBX?', answer: 'Yes. The service integrates with Issabel, Asterisk, FreePBX, 3CX and any SIP-compatible platform.' },
        { question: 'How is usage billed?', answer: 'Per consumed minute, with detailed reports by date, destination and extension available in the panel.' },
        { question: 'How many simultaneous calls can I make?', answer: 'It depends on your plan; the limit is configured per trunk and can be expanded when needed.' },
      ],
      pricing: [
        planEn('National', ['Local and national calls', '1 SIP trunk', 'Usage panel', 'Detailed CDR']),
        planEn('National + Mobile', ['Everything in National', 'Mobile traffic', 'Configurable simultaneous limit']),
        planEn('International', ['Everything in National + Mobile', 'International destinations', 'Prefix routing', 'Priority support'], true),
      ],
      cta: { heading: 'The best per-minute rate', text: 'Cut your telephony costs without sacrificing audio quality.', label: 'Quote minutes' },
    },
  },
  {
    slug: 'did',
    parentSlug: 'viptel-voip',
    icon: 'globe',
    es: {
      shortDescription: 'Números fijos virtuales locales e internacionales con enrutamiento a tu PBX.',
      description: [
        'Número DID (Direct Inward Dialing): numeración telefónica virtual que permite a tu empresa disponer de números fijos locales o internacionales que reciben llamadas a través de VoIP y se enrutan hacia tu PBX IP, softphones o aplicaciones móviles.',
        'Así puedes tener presencia telefónica en diferentes ciudades o países sin requerir infraestructura física en cada ubicación.',
      ],
      features: [
        { title: 'Números fijos virtuales', description: 'DID nacionales e internacionales según disponibilidad por país y ciudad.', icon: 'globe' },
        { title: 'Enrutamiento flexible', description: 'Hacia extensiones, colas, IVR o grupos de timbrado de tu PBX.', icon: 'route' },
        { title: 'Compatible con SIP', description: 'Issabel, Asterisk, FreePBX, 3CX y otras plataformas.', icon: 'server' },
        { title: 'Desvíos de contingencia', description: 'Hacia móviles o fijos externos cuando sea necesario.', icon: 'phone-call' },
        { title: 'Múltiples canales simultáneos', description: 'Por número DID según el plan contratado.', icon: 'signal' },
        { title: 'Panel web', description: 'Administración de números, revisión de llamadas y cambios de enrutamiento en tiempo real.', icon: 'monitor' },
        { title: 'Integración con la suite VIPTEL', description: 'Grabación, reportes y CRM junto con VIPTEL PBX.', icon: 'database' },
      ],
      faq: [
        { question: '¿Puedo tener números en varias ciudades?', answer: 'Sí. Puedes contratar números locales en Bogotá, Medellín, Cali u otras ciudades, y atender todas las llamadas desde una sola central en la nube.' },
        { question: '¿Sirve para clientes en otros países?', answer: 'Sí, los DID internacionales permiten que tus clientes te marquen como número local, generando confianza y facilitando la comunicación.' },
        { question: '¿Necesito una PBX para usar un DID?', answer: 'El número se enruta hacia tu PBX IP, softphone o app móvil. Si no tienes central, te la proveemos con VIPTEL PBX.' },
        { question: '¿Puedo cambiar el enrutamiento yo mismo?', answer: 'Sí, el panel web permite cambiar el destino de cada número en tiempo real.' },
      ],
      pricing: [
        plan('Local', ['1 número local (Bogotá, Medellín, Cali...)', '2 canales simultáneos', 'Enrutamiento a PBX', 'Panel web']),
        plan('Multi-ciudad', ['Números en varias ciudades', '5 canales por número', 'Desvíos de contingencia']),
        plan('Internacional', ['Números internacionales', 'Canales escalables', 'Reportes y grabación con VIPTEL PBX'], true),
      ],
      cta: { heading: 'Presencia local sin oficinas', text: 'Proyecta presencia en nuevas ciudades y países con un número local.', label: 'Cotizar DID' },
    },
    en: {
      shortDescription: 'Local and international virtual numbers routed to your PBX.',
      description: [
        'DID numbers (Direct Inward Dialing): virtual phone numbering that lets your company have local or international landline numbers receiving calls over VoIP and routing them to your IP PBX, softphones or mobile apps.',
        'This way you can have a phone presence in different cities or countries without physical infrastructure in each location.',
      ],
      features: [
        { title: 'Virtual landline numbers', description: 'National and international DIDs based on availability by country and city.', icon: 'globe' },
        { title: 'Flexible routing', description: 'To extensions, queues, IVR or ring groups in your PBX.', icon: 'route' },
        { title: 'SIP compatible', description: 'Issabel, Asterisk, FreePBX, 3CX and other platforms.', icon: 'server' },
        { title: 'Contingency forwarding', description: 'To external mobiles or landlines when needed.', icon: 'phone-call' },
        { title: 'Multiple simultaneous channels', description: 'Per DID number according to the contracted plan.', icon: 'signal' },
        { title: 'Web panel', description: 'Number management, call review and real-time routing changes.', icon: 'monitor' },
        { title: 'VIPTEL suite integration', description: 'Recording, reports and CRM together with VIPTEL PBX.', icon: 'database' },
      ],
      faq: [
        { question: 'Can I have numbers in several cities?', answer: 'Yes. You can hire local numbers in Bogotá, Medellín, Cali and other cities, and answer all calls from a single cloud switchboard.' },
        { question: 'Does it work for customers abroad?', answer: 'Yes, international DIDs let your customers dial you as a local number, building trust and easing communication.' },
        { question: 'Do I need a PBX to use a DID?', answer: 'The number routes to your IP PBX, softphone or mobile app. If you don\u2019t have a switchboard, we provide one with VIPTEL PBX.' },
        { question: 'Can I change routing myself?', answer: 'Yes, the web panel lets you change the destination of each number in real time.' },
      ],
      pricing: [
        planEn('Local', ['1 local number (Bogotá, Medellín, Cali...)', '2 simultaneous channels', 'PBX routing', 'Web panel']),
        planEn('Multi-city', ['Numbers in several cities', '5 channels per number', 'Contingency forwarding']),
        planEn('International', ['International numbers', 'Scalable channels', 'Reports and recording with VIPTEL PBX'], true),
      ],
      cta: { heading: 'Local presence without offices', text: 'Project presence in new cities and countries with a local number.', label: 'Quote DID' },
    },
  },

  // ============ VIPTEL-WEB ============
  {
    slug: 'viptel-web',
    icon: 'monitor',
    es: {
      description: [
        'Desarrollo web profesional construido con frameworks modernos, principios CLEAN CODE y SOLID: sitios informativos y corporativos, tiendas virtuales básicas y avanzadas con automatización e IA, y plataformas a la medida para digitalizar tus procesos.',
        'Cada solución es autosostenible: tu equipo administra el contenido desde un CMS sin tocar código, y la arquitectura queda lista para crecer con integraciones, módulos y nuevos canales.',
      ],
      faq: [
        { question: '¿Qué tecnologías usan?', answer: 'Frameworks y librerías web modernos seleccionados según los requerimientos de cada proyecto, con arquitectura por capas y código limpio.' },
        { question: '¿Puedo administrar el contenido yo mismo?', answer: 'Sí. Todos los sitios incluyen un CMS con panel de administración para editar textos, imágenes y secciones sin tocar el código fuente.' },
        { question: '¿El sitio queda preparado para crecer?', answer: 'Sí, la arquitectura modular permite añadir blog, landing pages, CRM, pasarelas de pago e integraciones sin rehacer el proyecto.' },
        { question: '¿Incluyen SEO y seguridad?', answer: 'Sí: SEO on-page, URLs amigables, sitemap, HTTPS/SSL y copias de seguridad periódicas.' },
      ],
      cta: { heading: 'Tu presencia web profesional', text: 'Cotiza el sitio que tu negocio necesita y empieza a vender en línea.', label: 'Cotizar desarrollo web' },
    },
    en: {
      description: [
        'Professional web development built with modern frameworks and CLEAN CODE and SOLID principles: informational and corporate sites, basic and advanced e-commerce stores with automation and AI, and custom platforms to digitize your processes.',
        'Every solution is self-sustaining: your team manages content from a CMS without touching code, and the architecture is ready to grow with integrations, modules and new channels.',
      ],
      faq: [
        { question: 'Which technologies do you use?', answer: 'Modern web frameworks and libraries selected per project requirements, with layered architecture and clean code.' },
        { question: 'Can I manage the content myself?', answer: 'Yes. Every site includes a CMS with an admin panel to edit texts, images and sections without touching the source code.' },
        { question: 'Is the site ready to grow?', answer: 'Yes, the modular architecture lets you add a blog, landing pages, CRM, payment gateways and integrations without rebuilding the project.' },
        { question: 'Do you include SEO and security?', answer: 'Yes: on-page SEO, friendly URLs, sitemap, HTTPS/SSL and periodic backups.' },
      ],
      cta: { heading: 'Your professional web presence', text: 'Quote the site your business needs and start selling online.', label: 'Quote web development' },
    },
  },
  {
    slug: 'sitio-informativo',
    parentSlug: 'viptel-web',
    icon: 'layout-grid',
    es: {
      shortDescription: 'Sitio corporativo con CMS, SEO y formulario de contacto.',
      description: [
        'Sitio web corporativo desarrollado con CLEAN CODE y principios SOLID para presentar la marca, los servicios, la ubicación y los datos de contacto de tu empresa de forma profesional y segura.',
        'Incluye CMS para administrar el contenido sin tocar código, formulario de contacto conectado al correo de la empresa y una base lista para escalar.',
      ],
      features: [
        { title: 'Arquitectura SOLID', description: 'Código modular, desacoplado y fácil de extender sin romper lo existente.', icon: 'building-2' },
        { title: 'Secciones estándar', description: 'Inicio, Quiénes somos, Servicios, Contacto y opcionales como Testimonios y FAQ.', icon: 'layout-grid' },
        { title: 'Diseño responsive', description: 'Visualización correcta en computador, tablet y móvil.', icon: 'smartphone' },
        { title: 'CMS integrado', description: 'Panel protegido para editar textos, imágenes y secciones clave.', icon: 'database' },
        { title: 'Formulario de contacto', description: 'Validación de campos y envío a los correos definidos.', icon: 'send' },
        { title: 'Integraciones de contacto', description: 'Mapa, botones de llamada, email y WhatsApp.', icon: 'message-circle' },
        { title: 'Seguridad', description: 'SSL (HTTPS), configuración de servidor y copias de seguridad.', icon: 'shield' },
        { title: 'SEO on-page', description: 'Meta-etiquetas, URLs amigables y sitemap para buscadores.', icon: 'trending-up' },
      ],
      faq: [
        { question: '¿En cuánto tiempo está listo?', answer: 'Un sitio informativo estándar suele estar listo en 2 a 4 semanas según la cantidad de contenido y secciones.' },
        { question: '¿Puedo editarlo sin saber programar?', answer: 'Sí, el CMS incluye un panel de administración para editar textos, imágenes y secciones sin tocar código.' },
        { question: '¿Incluye el formulario de contacto?', answer: 'Sí, con validación de campos y envío a los correos que definas, listo para extender a un CRM.' },
        { question: '¿El sitio aparece en Google?', answer: 'Sí, incluye SEO on-page, URLs amigables y sitemap para facilitar la indexación.' },
      ],
      pricing: [
        plan('Landing', ['1 página de presentación', 'Formulario de contacto', 'Responsive y SEO básico']),
        plan('Informativo', ['Hasta 5 secciones', 'CMS integrado', 'Mapa y WhatsApp', 'SEO on-page'], true),
        plan('Personalizado', ['Secciones ilimitadas', 'Integraciones a medida', 'Mantenimiento mensual']),
      ],
      cta: { heading: 'Un sitio profesional para tu empresa', text: 'Presenta tu marca con un sitio administrable, seguro y listo para crecer.', label: 'Cotizar sitio informativo' },
    },
    en: {
      shortDescription: 'Corporate site with CMS, SEO and contact form.',
      description: [
        'Corporate website built with CLEAN CODE and SOLID principles to present your brand, services, location and contact details professionally and securely.',
        'It includes a CMS to manage content without touching code, a contact form connected to the company email and a base ready to scale.',
      ],
      features: [
        { title: 'SOLID architecture', description: 'Modular, decoupled code that is easy to extend without breaking existing parts.', icon: 'building-2' },
        { title: 'Standard sections', description: 'Home, About us, Services, Contact and optional ones like Testimonials and FAQ.', icon: 'layout-grid' },
        { title: 'Responsive design', description: 'Correct display on desktop, tablet and mobile.', icon: 'smartphone' },
        { title: 'Integrated CMS', description: 'Protected panel to edit texts, images and key sections.', icon: 'database' },
        { title: 'Contact form', description: 'Field validation and delivery to defined email addresses.', icon: 'send' },
        { title: 'Contact integrations', description: 'Map, call buttons, email and WhatsApp.', icon: 'message-circle' },
        { title: 'Security', description: 'SSL (HTTPS), server configuration and backups.', icon: 'shield' },
        { title: 'On-page SEO', description: 'Meta tags, friendly URLs and sitemap for search engines.', icon: 'trending-up' },
      ],
      faq: [
        { question: 'How long does it take?', answer: 'A standard informational site usually takes 2 to 4 weeks depending on the amount of content and sections.' },
        { question: 'Can I edit it without coding?', answer: 'Yes, the CMS includes an admin panel to edit texts, images and sections without touching code.' },
        { question: 'Does it include the contact form?', answer: 'Yes, with field validation and delivery to the emails you define, ready to extend to a CRM.' },
        { question: 'Will the site appear on Google?', answer: 'Yes, it includes on-page SEO, friendly URLs and a sitemap to ease indexing.' },
      ],
      pricing: [
        planEn('Landing', ['1 presentation page', 'Contact form', 'Responsive and basic SEO']),
        planEn('Informational', ['Up to 5 sections', 'Integrated CMS', 'Map and WhatsApp', 'On-page SEO'], true),
        planEn('Custom', ['Unlimited sections', 'Custom integrations', 'Monthly maintenance']),
      ],
      cta: { heading: 'A professional site for your company', text: 'Present your brand with a manageable, secure site ready to grow.', label: 'Quote informational site' },
    },
  },
  {
    slug: 'sitio-corporativo',
    parentSlug: 'viptel-web',
    icon: 'building',
    es: {
      shortDescription: 'Centro digital empresarial con secciones avanzadas e integraciones.',
      description: [
        'Sitio web empresarial avanzado, desarrollado con frameworks modernos y principios CLEAN CODE y SOLID, adaptado a los requerimientos específicos de cada proyecto.',
        'Pensado para organizaciones que necesitan un centro digital robusto: múltiples secciones, tipos de contenido, menús flexibles, CMS con roles y permisos, e integraciones con marketing, analítica y CRM.',
      ],
      features: [
        { title: 'Arquitectura a la medida', description: 'Frameworks seleccionados según necesidades, contenido e integraciones.', icon: 'building' },
        { title: 'Secciones ampliadas', description: 'Inicio, Servicios, Casos de éxito, Blog, Equipo, Testimonios, FAQ, Contacto y más.', icon: 'layout-grid' },
        { title: 'Tipos de contenido', description: 'Noticias, proyectos, artículos y documentos modelados por organización.', icon: 'files' },
        { title: 'Menús y submenús', description: 'Estructuras corporativas complejas, flexibles.', icon: 'menu' },
        { title: 'CMS avanzado', description: 'Publicación sin tocar código y roles para el equipo editorial.', icon: 'users' },
        { title: 'Marketing y analítica', description: 'Google Analytics, Meta Pixel y plataformas de automatización.', icon: 'chart-bar' },
        { title: 'Formularios de negocio', description: 'Cotización, PQRS, soporte, talento humano con validación en cliente y servidor.', icon: 'clipboard-list' },
        { title: 'Rendimiento y seguridad', description: 'Lazy loading, cache, CDN, HTTPS y backups.', icon: 'shield' },
        { title: 'SEO y escalabilidad', description: 'Sitemap automático y arquitectura lista para portales o tienda.', icon: 'trending-up' },
      ],
      faq: [
        { question: '¿En qué se diferencia del sitio informativo?', answer: 'El corporativo añade secciones ampliadas (casos de éxito, blog, equipo), tipos de contenido, roles en el CMS e integraciones con marketing, analítica y CRM.' },
        { question: '¿Puedo tener varios editores con permisos distintos?', answer: 'Sí, el CMS avanzado permite configurar roles y permisos para que distintos miembros gestionen el sitio de forma ordenada.' },
        { question: '¿Se integra con Google Analytics y Meta Pixel?', answer: 'Sí, de forma nativa o por APIs, junto con plataformas de automatización de marketing.' },
        { question: '¿Está preparado para un portal o tienda a futuro?', answer: 'Sí, la arquitectura permite añadir módulos como portal de clientes, áreas privadas o tienda virtual.' },
      ],
      pricing: [
        plan('Corporativo estándar', ['Hasta 10 secciones', 'CMS con roles', 'Analítica integrada', 'Formularios avanzados']),
        plan('Corporativo plus', ['Secciones ilimitadas', 'Blog y tipos de contenido', 'Integraciones CRM/marketing'], true),
        plan('Enterprise', ['Portal de clientes', 'Áreas privadas', 'Integraciones a medida']),
      ],
      cta: { heading: 'Tu centro digital corporativo', text: 'Un sitio robusto que refleja tu organización y está listo para crecer.', label: 'Cotizar sitio corporativo' },
    },
    en: {
      shortDescription: 'Enterprise digital hub with advanced sections and integrations.',
      description: [
        'Advanced corporate website, built with modern frameworks and CLEAN CODE and SOLID principles, adapted to each project\u2019s specific requirements.',
        'Designed for organizations that need a robust digital hub: multiple sections, content types, flexible menus, a CMS with roles and permissions, and integrations with marketing, analytics and CRM.',
      ],
      features: [
        { title: 'Custom architecture', description: 'Frameworks selected by needs, content and integrations.', icon: 'building' },
        { title: 'Extended sections', description: 'Home, Services, Case studies, Blog, Team, Testimonials, FAQ, Contact and more.', icon: 'layout-grid' },
        { title: 'Content types', description: 'News, projects, articles and documents modeled per organization.', icon: 'files' },
        { title: 'Flexible menus', description: 'Complex corporate structures with menus and submenus.', icon: 'menu' },
        { title: 'Advanced CMS', description: 'Publishing without code and roles for the editorial team.', icon: 'users' },
        { title: 'Marketing and analytics', description: 'Google Analytics, Meta Pixel and automation platforms.', icon: 'chart-bar' },
        { title: 'Business forms', description: 'Quote, PQRS, support, HR with client and server validation.', icon: 'clipboard-list' },
        { title: 'Performance and security', description: 'Lazy loading, cache, CDN, HTTPS and backups.', icon: 'shield' },
        { title: 'SEO and scalability', description: 'Automatic sitemap and architecture ready for portals or a store.', icon: 'trending-up' },
      ],
      faq: [
        { question: 'How does it differ from the informational site?', answer: 'The corporate site adds extended sections (case studies, blog, team), content types, CMS roles and integrations with marketing, analytics and CRM.' },
        { question: 'Can I have several editors with different permissions?', answer: 'Yes, the advanced CMS allows configuring roles and permissions so different members manage the site in an organized way.' },
        { question: 'Does it integrate with Google Analytics and Meta Pixel?', answer: 'Yes, natively or via APIs, together with marketing automation platforms.' },
        { question: 'Is it ready for a portal or store later?', answer: 'Yes, the architecture allows adding modules such as a client portal, private areas or an online store.' },
      ],
      pricing: [
        planEn('Standard corporate', ['Up to 10 sections', 'CMS with roles', 'Integrated analytics', 'Advanced forms']),
        planEn('Corporate plus', ['Unlimited sections', 'Blog and content types', 'CRM/marketing integrations'], true),
        planEn('Enterprise', ['Client portal', 'Private areas', 'Custom integrations']),
      ],
      cta: { heading: 'Your corporate digital hub', text: 'A robust site that reflects your organization and is ready to grow.', label: 'Quote corporate site' },
    },
  },
  {
    slug: 'tienda-basica',
    parentSlug: 'viptel-web',
    icon: 'shopping-cart',
    es: {
      shortDescription: 'E-commerce para empezar a vender en línea de forma rápida y segura.',
      description: [
        'Solución de comercio electrónico desarrollada con frameworks modernos y buenas prácticas de arquitectura (CLEAN CODE, SOLID), orientada a negocios que quieren empezar a vender en línea de forma rápida, segura y escalable.',
        'Incluye catálogo de productos, carrito persistente, checkout simplificado, pasarelas de pago colombianas y panel de pedidos.',
      ],
      features: [
        { title: 'Catálogo de productos', description: 'Nombre, descripción, precio, imágenes, SKU, categoría y estado.', icon: 'package' },
        { title: 'Categorías y subcategorías', description: 'Organización del catálogo por niveles.', icon: 'layout-grid' },
        { title: 'Control de stock', description: 'Stock básico y visibilidad de productos agotados.', icon: 'boxes' },
        { title: 'Carrito persistente', description: 'El cliente no pierde su carrito entre visitas.', icon: 'shopping-cart' },
        { title: 'Checkout simplificado', description: 'Flujo de compra rápido con validaciones y costos adicionales.', icon: 'credit-card' },
        { title: 'Pasarelas colombianas', description: 'PayU, ePayco, Wompi, PSE y tarjetas de crédito.', icon: 'wallet' },
        { title: 'Panel de pedidos', description: 'Visualización de pedidos, estados y exportación CSV/Excel.', icon: 'monitor' },
        { title: 'Seguridad', description: 'HTTPS (SSL) y protección de datos en todo el proceso de pago.', icon: 'shield' },
      ],
      faq: [
        { question: '¿Qué métodos de pago puedo activar?', answer: 'PayU, ePayco, Wompi, PSE y tarjetas de crédito, con manejo de estados de pago y confirmación por callback.' },
        { question: '¿Puedo migrar mi catálogo actual?', answer: 'Sí, importamos tus productos, categorías e imágenes desde un archivo CSV o desde otra plataforma.' },
        { question: '¿La tienda funciona en celulares?', answer: 'Sí, la interfaz es responsive y está optimizada para compras desde el móvil.' },
        { question: '¿Puedo pasar después a la tienda avanzada?', answer: 'Sí, la tienda básica es la base de la avanzada: migras sin perder catálogo, pedidos ni clientes.' },
      ],
      pricing: [
        plan('Tienda inicial', ['Hasta 50 productos', '1 pasarela de pago', 'Checkout simplificado', 'Panel de pedidos']),
        plan('Tienda estándar', ['Hasta 300 productos', '2 pasarelas de pago', 'Exportación CSV/Excel', 'Soporte prioritario'], true),
        plan('Personalizado', ['Productos ilimitados', 'Integraciones a medida', 'Mantenimiento mensual']),
      ],
      cta: { heading: 'Empieza a vender en línea', text: 'Tu primera tienda online profesional, segura y lista para crecer.', label: 'Cotizar tienda básica' },
    },
    en: {
      shortDescription: 'E-commerce to start selling online quickly and securely.',
      description: [
        'E-commerce solution built with modern frameworks and good architecture practices (CLEAN CODE, SOLID), aimed at businesses that want to start selling online quickly, securely and at scale.',
        'It includes a product catalog, persistent cart, simplified checkout, Colombian payment gateways and an orders panel.',
      ],
      features: [
        { title: 'Product catalog', description: 'Name, description, price, images, SKU, category and status.', icon: 'package' },
        { title: 'Categories and subcategories', description: 'Multi-level catalog organization.', icon: 'layout-grid' },
        { title: 'Stock control', description: 'Basic stock and sold-out product visibility.', icon: 'boxes' },
        { title: 'Persistent cart', description: 'Customers keep their cart between visits.', icon: 'shopping-cart' },
        { title: 'Simplified checkout', description: 'Fast purchase flow with validations and additional costs.', icon: 'credit-card' },
        { title: 'Colombian gateways', description: 'PayU, ePayco, Wompi, PSE and credit cards.', icon: 'wallet' },
        { title: 'Orders panel', description: 'Order views, statuses and CSV/Excel export.', icon: 'monitor' },
        { title: 'Security', description: 'HTTPS (SSL) and data protection across the payment process.', icon: 'shield' },
      ],
      faq: [
        { question: 'Which payment methods can I enable?', answer: 'PayU, ePayco, Wompi, PSE and credit cards, with payment state handling and callback confirmation.' },
        { question: 'Can I migrate my current catalog?', answer: 'Yes, we import your products, categories and images from a CSV file or another platform.' },
        { question: 'Does the store work on mobile?', answer: 'Yes, the interface is responsive and optimized for mobile purchases.' },
        { question: 'Can I upgrade to the advanced store later?', answer: 'Yes, the basic store is the foundation of the advanced one: you migrate without losing catalog, orders or customers.' },
      ],
      pricing: [
        planEn('Starter store', ['Up to 50 products', '1 payment gateway', 'Simplified checkout', 'Orders panel']),
        planEn('Standard store', ['Up to 300 products', '2 payment gateways', 'CSV/Excel export', 'Priority support'], true),
        planEn('Custom', ['Unlimited products', 'Custom integrations', 'Monthly maintenance']),
      ],
      cta: { heading: 'Start selling online', text: 'Your first professional online store, secure and ready to grow.', label: 'Quote basic store' },
    },
  },
  {
    slug: 'tienda-avanzada',
    parentSlug: 'viptel-web',
    icon: 'bot',
    es: {
      shortDescription: 'Tienda automatizada con n8n, chat IA y promociones avanzadas.',
      description: [
        'E-commerce de siguiente nivel que parte de la Tienda Virtual Básica y la lleva a un modelo automatizado: flujos con n8n, chat con IA para soporte y ventas, promociones y reglas avanzadas.',
        'Construida sobre frameworks modernos y principios CLEAN CODE y SOLID, preparada para integrarse con el ecosistema VIPTEL y herramientas de terceros.',
      ],
      features: [
        { title: 'Todo la tienda básica', description: 'Catálogo, carrito, checkout y pasarelas de pago.', icon: 'circle-check' },
        { title: 'Métodos de envío avanzados', description: 'Múltiples opciones con reglas por producto o zona.', icon: 'truck' },
        { title: 'Promociones y cupones', description: 'Cupones, precios por volumen y combos.', icon: 'tag' },
        { title: 'Inventario avanzado', description: 'Variantes de producto y alertas de reabastecimiento.', icon: 'boxes' },
        { title: 'Automatización con n8n', description: 'Correos/WhatsApp automáticos, sincronización con CRM y alertas internas.', icon: 'workflow' },
        { title: 'Chat con IA', description: 'Asistente entrenado con el catálogo que asiste en navegación y compra.', icon: 'bot' },
        { title: 'Escalado a agente humano', description: 'El chat crea leads, tickets o deriva a un agente vía n8n.', icon: 'headset' },
        { title: 'Panel mejorado', description: 'Ventas por periodo, productos más vendidos y administración de promociones.', icon: 'chart-bar' },
      ],
      faq: [
        { question: '¿Qué es la automatización con n8n?', answer: 'Flujos automáticos que orquestan procesos clave: envío de correos/WhatsApp al cliente, sincronización con CRM, alertas internas y más.' },
        { question: '¿El chat con IA puede vender?', answer: 'Sí, el asistente conoce el catálogo, responde preguntas frecuentes y asiste en el proceso de compra; puede crear leads, tickets o escalar a un agente humano.' },
        { question: '¿Qué promociones puedo configurar?', answer: 'Cupones, precios por volumen, combos y reglas de descuento por cliente o categoría.' },
        { question: '¿Funciona 24/7?', answer: 'Sí, el chat con IA atiende soporte y ventas a cualquier hora, derivando a un humano cuando es necesario.' },
      ],
      pricing: [
        plan('Automatizada', ['Tienda avanzada', '5 flujos n8n', 'Chat IA básico', 'Promociones y cupones']),
        plan('Automatizada plus', ['Flujos n8n ilimitados', 'Chat IA entrenado con catálogo', 'Escalado a agente humano'], true),
        plan('Enterprise', ['Integración CRM/ERP', 'Multi-bodega', 'Analítica avanzada']),
      ],
      cta: { heading: 'Tu tienda automática e inteligente', text: 'Convierte tu e-commerce en una máquina de ventas 24/7 con IA y automatización.', label: 'Cotizar tienda avanzada' },
    },
    en: {
      shortDescription: 'Automated store with n8n, AI chat and advanced promotions.',
      description: [
        'Next-level e-commerce that builds on the Basic Virtual Store and takes it to an automated model: n8n workflows, AI chat for support and sales, and advanced promotions and rules.',
        'Built on modern frameworks and CLEAN CODE and SOLID principles, ready to integrate with the VIPTEL ecosystem and third-party tools.',
      ],
      features: [
        { title: 'Everything in basic store', description: 'Catalog, cart, checkout and payment gateways.', icon: 'circle-check' },
        { title: 'Advanced shipping methods', description: 'Multiple options with rules per product or zone.', icon: 'truck' },
        { title: 'Promotions and coupons', description: 'Coupons, volume pricing and bundles.', icon: 'tag' },
        { title: 'Advanced inventory', description: 'Product variants and restock alerts.', icon: 'boxes' },
        { title: 'n8n automation', description: 'Automatic email/WhatsApp, CRM sync and internal alerts.', icon: 'workflow' },
        { title: 'AI chat', description: 'Assistant trained on the catalog that helps with browsing and purchasing.', icon: 'bot' },
        { title: 'Human agent escalation', description: 'The chat creates leads, tickets or hands off to an agent via n8n.', icon: 'headset' },
        { title: 'Enhanced panel', description: 'Sales per period, best sellers and promotion management.', icon: 'chart-bar' },
      ],
      faq: [
        { question: 'What is n8n automation?', answer: 'Automatic workflows that orchestrate key processes: sending email/WhatsApp to the customer, CRM sync, internal alerts and more.' },
        { question: 'Can the AI chat sell?', answer: 'Yes, the assistant knows the catalog, answers FAQs and assists the purchase process; it can create leads, tickets or escalate to a human agent.' },
        { question: 'Which promotions can I configure?', answer: 'Coupons, volume pricing, bundles and discount rules per customer or category.' },
        { question: 'Does it work 24/7?', answer: 'Yes, the AI chat handles support and sales at any time, handing off to a human when needed.' },
      ],
      pricing: [
        planEn('Automated', ['Advanced store', '5 n8n workflows', 'Basic AI chat', 'Promotions and coupons']),
        planEn('Automated plus', ['Unlimited n8n workflows', 'AI chat trained on catalog', 'Human agent escalation'], true),
        planEn('Enterprise', ['CRM/ERP integration', 'Multi-warehouse', 'Advanced analytics']),
      ],
      cta: { heading: 'Your automatic, intelligent store', text: 'Turn your e-commerce into a 24/7 sales machine with AI and automation.', label: 'Quote advanced store' },
    },
  },
  {
    slug: 'plataforma-a-la-medida',
    parentSlug: 'viptel-web',
    icon: 'code-2',
    es: {
      title: 'Plataforma Web a la Medida',
      shortDescription: 'Desarrollo de software personalizado para digitalizar tus procesos.',
      description: [
        'Solución de desarrollo personalizado diseñada para adaptarse a los requerimientos específicos de cada cliente cuando las opciones estándar no son suficientes.',
        'Se construye con frameworks y tecnologías modernas, aplicando principios CLEAN CODE y SOLID: portales, sistemas internos, plataformas SaaS, dashboards y módulos a la medida.',
      ],
      features: [
        { title: 'Stack adaptado', description: 'Frontend, backend y base de datos seleccionados según los requerimientos.', icon: 'code-2' },
        { title: 'Arquitectura SOLID', description: 'Diseño modular por capas con responsabilidades claras y sin deuda técnica.', icon: 'building-2' },
        { title: 'Modelado a la medida', description: 'Levantamiento de requisitos, modelo de datos, formularios, permisos y pantallas.', icon: 'database' },
        { title: 'Integraciones', description: 'Conexión con sistemas internos o externos mediante APIs, webhooks o conectores.', icon: 'plug' },
        { title: 'UI responsive', description: 'Interfaz diseñada para el tipo de usuario final, con componentes reutilizables.', icon: 'smartphone' },
        { title: 'Seguridad y roles', description: 'Autenticación, autorización por roles y protección de datos.', icon: 'shield' },
        { title: 'Escalabilidad', description: 'Optimización para el crecimiento en usuarios y datos.', icon: 'trending-up' },
      ],
      faq: [
        { question: '¿Qué tipo de proyectos entran aquí?', answer: 'Portales de clientes o proveedores, sistemas internos de gestión, plataformas SaaS multiusuario, dashboards y módulos que se integran con sistemas existentes.' },
        { question: '¿Cómo es el proceso de levantamiento?', answer: 'Analizamos procesos, roles, flujos y reglas de negocio, luego diseñamos el modelo de datos, formularios, permisos y pantallas antes de desarrollar.' },
        { question: '¿Se integra con lo que ya uso?', answer: 'Sí, mediante APIs, webhooks o conectores, sincronizando datos y manteniendo consistencia con tus sistemas actuales.' },
        { question: '¿Queda documentado y mantenible?', answer: 'Sí, el código se entrega organizado por capas, con buenas prácticas que reducen riesgos y facilitan evoluciones futuras.' },
      ],
      pricing: [
        plan('Módulo', ['Alcance acotado', 'Entrega por hitos', 'Garantía de 3 meses']),
        plan('Plataforma', ['Sistema completo', 'Roles y permisos', 'Integraciones incluidas'], true),
        plan('Evolución continua', ['Equipo dedicado', 'Nuevas funcionalidades por sprint', 'Soporte y monitoreo']),
      ],
      cta: { heading: 'Software exactamente como lo necesitas', text: 'Cuando lo estándar no alcanza, desarrollamos la plataforma a la medida de tus procesos.', label: 'Cotizar desarrollo a la medida' },
    },
    en: {
      title: 'Custom Web Platform',
      shortDescription: 'Custom software development to digitize your processes.',
      description: [
        'Custom development solution designed to fit each client\u2019s specific requirements when standard options are not enough.',
        'Built with modern frameworks and technologies, applying CLEAN CODE and SOLID principles: portals, internal systems, SaaS platforms, dashboards and custom modules.',
      ],
      features: [
        { title: 'Adapted stack', description: 'Frontend, backend and database selected according to requirements.', icon: 'code-2' },
        { title: 'SOLID architecture', description: 'Modular layered design with clear responsibilities and no technical debt.', icon: 'building-2' },
        { title: 'Custom modeling', description: 'Requirements gathering, data model, forms, permissions and screens.', icon: 'database' },
        { title: 'Integrations', description: 'Connection with internal or external systems via APIs, webhooks or connectors.', icon: 'plug' },
        { title: 'Responsive UI', description: 'Interface designed for the end user, with reusable components.', icon: 'smartphone' },
        { title: 'Security and roles', description: 'Authentication, role-based authorization and data protection.', icon: 'shield' },
        { title: 'Scalability', description: 'Optimization for growth in users and data.', icon: 'trending-up' },
      ],
      faq: [
        { question: 'Which projects fit here?', answer: 'Client or supplier portals, internal management systems, multi-tenant SaaS platforms, dashboards and modules that integrate with existing systems.' },
        { question: 'How does the discovery process work?', answer: 'We analyze processes, roles, flows and business rules, then design the data model, forms, permissions and screens before developing.' },
        { question: 'Does it integrate with what I already use?', answer: 'Yes, via APIs, webhooks or connectors, syncing data and keeping consistency with your current systems.' },
        { question: 'Is it documented and maintainable?', answer: 'Yes, the code is delivered organized by layers with best practices that reduce risk and ease future evolution.' },
      ],
      pricing: [
        planEn('Module', ['Bounded scope', 'Milestone delivery', '3-month warranty']),
        planEn('Platform', ['Complete system', 'Roles and permissions', 'Integrations included'], true),
        planEn('Continuous evolution', ['Dedicated team', 'New features per sprint', 'Support and monitoring']),
      ],
      cta: { heading: 'Software exactly as you need it', text: 'When standard is not enough, we build the platform around your processes.', label: 'Quote custom development' },
    },
  },

  // ============ VIPTEL-MARKETING ============
  {
    slug: 'viptel-marketing',
    icon: 'megaphone',
    es: {
      description: [
        'Plataforma de marketing multicanal para enviar campañas masivas por SMS, voz, email y WhatsApp de forma eficiente, medible y escalable.',
        'Panel web unificado con roles, control de costos por uso y reportes detallados. Cada canal se contrata de forma independiente o combinada, sin instalar software en tu infraestructura.',
      ],
      faq: [
        { question: '¿Puedo contratar un solo canal?', answer: 'Sí, cada módulo (SMS, audios, email o WhatsApp) se ofrece de forma independiente o combinada, con panel unificado.' },
        { question: '¿Necesito instalar software?', answer: 'No. Todo se gestiona desde un panel web SaaS, incluyendo carga de contactos, programación, envío y reportes.' },
        { question: '¿Cómo se factura?', answer: 'Por uso, con facturación transparente y planes escalables según el volumen de cada campaña.' },
        { question: '¿Se integra con mi CRM o e-commerce?', answer: 'Sí, mediante APIs y webhooks para disparar campañas desde tus sistemas.' },
      ],
      cta: { heading: 'Comunícate con tus clientes a escala', text: 'Campañas masivas por SMS, voz, email y WhatsApp desde un solo panel.', label: 'Cotizar marketing' },
    },
    en: {
      description: [
        'Multi-channel marketing platform to send mass SMS, voice, email and WhatsApp campaigns efficiently, measurably and at scale.',
        'Unified web panel with roles, usage-based cost control and detailed reports. Each channel is hired independently or combined, without installing software on your infrastructure.',
      ],
      faq: [
        { question: 'Can I hire a single channel?', answer: 'Yes, each module (SMS, voice, email or WhatsApp) is offered independently or combined, with a unified panel.' },
        { question: 'Do I need to install software?', answer: 'No. Everything is managed from a SaaS web panel, including contact upload, scheduling, sending and reports.' },
        { question: 'How is it billed?', answer: 'Per usage, with transparent billing and scalable plans according to each campaign volume.' },
        { question: 'Does it integrate with my CRM or e-commerce?', answer: 'Yes, via APIs and webhooks to trigger campaigns from your systems.' },
      ],
      cta: { heading: 'Communicate with customers at scale', text: 'Mass SMS, voice, email and WhatsApp campaigns from a single panel.', label: 'Quote marketing' },
    },
  },
  {
    slug: 'sms-masivo',
    parentSlug: 'viptel-marketing',
    icon: 'message-square',
    es: {
      shortDescription: 'Campañas masivas de SMS para promociones y recordatorios.',
      description: [
        'Envío de mensajes de texto masivos a listas de contactos, ideal para promociones, recordatorios, notificaciones transaccionales y campañas de marketing directo.',
        'Soporta mensajes de tipo marketing, informativos y transaccionales, con gestión de grandes volúmenes bajo políticas de uso responsable.',
      ],
      features: [
        { title: 'Envío masivo segmentado', description: 'Listas con personalización de campos.', icon: 'users' },
        { title: 'Programación de campañas', description: 'Fechas y horarios específicos para cada envío.', icon: 'calendar' },
        { title: 'Reportes por campaña', description: 'Entregas y costos detallados.', icon: 'chart-bar' },
        { title: 'API para envíos', description: 'Envío programático desde sistemas externos.', icon: 'plug' },
      ],
      faq: [
        { question: '¿Para qué casos sirve?', answer: 'Promociones, lanzamientos, recordatorios de pagos, citas, vencimientos y notificaciones rápidas de estados de servicio.' },
        { question: '¿Puedo personalizar cada mensaje?', answer: 'Sí, con campos variables por contacto (nombre, valor, fecha).' },
        { question: '¿Puedo programar el envío?', answer: 'Sí, las campañas se programan en fechas y horarios específicos.' },
        { question: '¿Se integra con mis sistemas?', answer: 'Sí, a través de una API para envíos programáticos.' },
      ],
      pricing: [
        plan('Eventual', ['Hasta 5.000 SMS/mes', '1 usuario', 'Reportes básicos']),
        plan('Crecimiento', ['Hasta 50.000 SMS/mes', '3 usuarios', 'API incluida'], true),
        plan('Volumen', ['SMS ilimitados', 'Usuarios ilimitados', 'Soporte prioritario']),
      ],
      cta: { heading: 'Llega al celular de tus clientes', text: 'Campañas de SMS masivas, medibles y programadas a la medida.', label: 'Cotizar SMS masivo' },
    },
    en: {
      shortDescription: 'Mass SMS campaigns for promotions and reminders.',
      description: [
        'Mass text messaging to contact lists, ideal for promotions, reminders, transactional notifications and direct marketing campaigns.',
        'Supports marketing, informational and transactional messages, managing large volumes under responsible-use policies.',
      ],
      features: [
        { title: 'Segmented mass sending', description: 'Lists with per-field personalization.', icon: 'users' },
        { title: 'Campaign scheduling', description: 'Specific dates and times for each send.', icon: 'calendar' },
        { title: 'Per-campaign reports', description: 'Detailed deliveries and costs.', icon: 'chart-bar' },
        { title: 'API for sends', description: 'Programmatic sending from external systems.', icon: 'plug' },
      ],
      faq: [
        { question: 'Which use cases fit?', answer: 'Promotions, launches, payment reminders, appointments, due dates and quick service status notifications.' },
        { question: 'Can I personalize each message?', answer: 'Yes, with per-contact variable fields (name, amount, date).' },
        { question: 'Can I schedule the send?', answer: 'Yes, campaigns are scheduled for specific dates and times.' },
        { question: 'Does it integrate with my systems?', answer: 'Yes, through an API for programmatic sends.' },
      ],
      pricing: [
        planEn('Occasional', ['Up to 5,000 SMS/month', '1 user', 'Basic reports']),
        planEn('Growth', ['Up to 50,000 SMS/month', '3 users', 'API included'], true),
        planEn('Volume', ['Unlimited SMS', 'Unlimited users', 'Priority support']),
      ],
      cta: { heading: 'Reach your customers\u2019 phones', text: 'Measurable, scheduled mass SMS campaigns built to fit.', label: 'Quote mass SMS' },
    },
  },
  {
    slug: 'audio-masivo',
    parentSlug: 'viptel-marketing',
    icon: 'mic',
    es: {
      shortDescription: 'Llamadas automatizadas con mensajes de voz pregrabados.',
      description: [
        'Campañas de llamadas automatizadas con mensajes de voz pregrabados, ideal para comunicaciones donde el receptor no depende del texto.',
        'Difusión de mensajes unidireccionales a móviles y fijos, con foco en volumen y alcance.',
      ],
      features: [
        { title: 'Carga de audio', description: 'Archivos MP3/WAV para crear campañas.', icon: 'file-audio' },
        { title: 'Marcación automática', description: 'Llamadas automáticas a las listas de contactos.', icon: 'phone-call' },
        { title: 'Reportes de llamadas', description: 'Realizadas, contestadas y no contestadas.', icon: 'chart-bar' },
        { title: 'Listas de exclusión', description: 'Control para no molestar a quien no desea recibir.', icon: 'shield' },
      ],
      faq: [
        { question: '¿Para qué casos sirve?', answer: 'Campañas políticas o institucionales, avisos de cortes de servicio, emergencias y recordatorios críticos de salud, educación o citas.' },
        { question: '¿Qué formato de audio acepta?', answer: 'MP3 y WAV.' },
        { question: '¿Puedo excluir números?', answer: 'Sí, con manejo de listas de exclusión para respetar a quienes no desean recibir llamadas.' },
      ],
      pricing: [
        plan('Eventual', ['Hasta 10.000 llamadas/mes', '1 campaña activa', 'Reportes básicos']),
        plan('Crecimiento', ['Hasta 100.000 llamadas/mes', 'Campañas simultáneas', 'Listas de exclusión'], true),
        plan('Volumen', ['Llamadas ilimitadas', 'Soporte prioritario', 'API de integración']),
      ],
      cta: { heading: 'Tu mensaje de voz a miles de personas', text: 'Difusión masiva con reportes claros de alcance y recepción.', label: 'Cotizar audios masivos' },
    },
    en: {
      shortDescription: 'Automated calls with pre-recorded voice messages.',
      description: [
        'Automated call campaigns with pre-recorded voice messages, ideal for communications where the receiver does not depend on text.',
        'One-way voice broadcast to mobiles and landlines, focused on volume and reach.',
      ],
      features: [
        { title: 'Audio upload', description: 'MP3/WAV files to create campaigns.', icon: 'file-audio' },
        { title: 'Automatic dialing', description: 'Automatic calls to contact lists.', icon: 'phone-call' },
        { title: 'Call reports', description: 'Placed, answered and unanswered.', icon: 'chart-bar' },
        { title: 'Exclusion lists', description: 'Control to respect those who do not wish to receive calls.', icon: 'shield' },
      ],
      faq: [
        { question: 'Which use cases fit?', answer: 'Political or institutional campaigns, service outage notices, emergencies and critical health, education or appointment reminders.' },
        { question: 'Which audio format is accepted?', answer: 'MP3 and WAV.' },
        { question: 'Can I exclude numbers?', answer: 'Yes, with exclusion lists to respect those who do not wish to receive calls.' },
      ],
      pricing: [
        planEn('Occasional', ['Up to 10,000 calls/month', '1 active campaign', 'Basic reports']),
        planEn('Growth', ['Up to 100,000 calls/month', 'Simultaneous campaigns', 'Exclusion lists'], true),
        planEn('Volume', ['Unlimited calls', 'Priority support', 'Integration API']),
      ],
      cta: { heading: 'Your voice message to thousands', text: 'Mass broadcasting with clear reach and reception reports.', label: 'Quote mass voice' },
    },
  },
  {
    slug: 'email-masivo',
    parentSlug: 'viptel-marketing',
    icon: 'mail',
    es: {
      shortDescription: 'Email marketing con editor visual y automatizaciones.',
      description: [
        'Email marketing con editor visual y automatizaciones básicas para nutrir leads, mantener comunicación con clientes y ejecutar campañas de fidelización.',
        'Envío a bases opt-in, con segmentación por atributos y reportes de aperturas, clics, rebotes y bajas.',
      ],
      features: [
        { title: 'Editor drag & drop', description: 'Plantillas responsive sin escribir código.', icon: 'layout-template' },
        { title: 'Segmentación', description: 'Listas segmentadas por atributos del contacto.', icon: 'users' },
        { title: 'Automatizaciones', description: 'Bienvenida, seguimiento y recuperación de carritos.', icon: 'workflow' },
        { title: 'Reportes', description: 'Aperturas, clics, rebotes y bajas.', icon: 'chart-bar' },
      ],
      faq: [
        { question: '¿Para qué casos sirve?', answer: 'Boletines mensuales, noticias corporativas, secuencias de correos para leads y programas de fidelización, cross-selling y up-selling.' },
        { question: '¿Necesito saber de diseño?', answer: 'No, el editor drag & drop permite crear plantillas responsive visualmente.' },
        { question: '¿Puedo automatizar correos?', answer: 'Sí, con automatizaciones básicas de bienvenida, seguimiento y recuperación de carritos.' },
      ],
      pricing: [
        plan('Eventual', ['Hasta 5.000 correos/mes', 'Editor drag & drop', 'Reportes básicos']),
        plan('Crecimiento', ['Hasta 50.000 correos/mes', 'Automatizaciones', 'Segmentación avanzada'], true),
        plan('Volumen', ['Correos ilimitados', 'Soporte prioritario', 'Integración CRM']),
      ],
      cta: { heading: 'Nutre y fideliza por email', text: 'Campañas de email con diseño profesional y resultados medibles.', label: 'Cotizar email masivo' },
    },
    en: {
      shortDescription: 'Email marketing with visual editor and automations.',
      description: [
        'Email marketing with a visual editor and basic automations to nurture leads, keep in touch with customers and run loyalty campaigns.',
        'Sending to opt-in bases, with segmentation by attributes and reports on opens, clicks, bounces and unsubscribes.',
      ],
      features: [
        { title: 'Drag & drop editor', description: 'Responsive templates without writing code.', icon: 'layout-template' },
        { title: 'Segmentation', description: 'Lists segmented by contact attributes.', icon: 'users' },
        { title: 'Automations', description: 'Welcome, follow-up and cart recovery.', icon: 'workflow' },
        { title: 'Reports', description: 'Opens, clicks, bounces and unsubscribes.', icon: 'chart-bar' },
      ],
      faq: [
        { question: 'Which use cases fit?', answer: 'Monthly newsletters, corporate news, lead email sequences and loyalty, cross-selling and up-selling programs.' },
        { question: 'Do I need design skills?', answer: 'No, the drag & drop editor lets you create responsive templates visually.' },
        { question: 'Can I automate emails?', answer: 'Yes, with basic welcome, follow-up and cart recovery automations.' },
      ],
      pricing: [
        planEn('Occasional', ['Up to 5,000 emails/month', 'Drag & drop editor', 'Basic reports']),
        planEn('Growth', ['Up to 50,000 emails/month', 'Automations', 'Advanced segmentation'], true),
        planEn('Volume', ['Unlimited emails', 'Priority support', 'CRM integration']),
      ],
      cta: { heading: 'Nurture and retain via email', text: 'Email campaigns with professional design and measurable results.', label: 'Quote mass email' },
    },
  },
  {
    slug: 'whatsapp-masivo',
    parentSlug: 'viptel-marketing',
    icon: 'message-circle',
    es: {
      shortDescription: 'Campañas por WhatsApp Business API con plantillas aprobadas.',
      description: [
        'Gestión de campañas y comunicaciones por WhatsApp Business API, el canal que más utilizan tus clientes.',
        'Uso de plantillas aprobadas, envío a contactos con consentimiento y comunicación informativa, comercial y transaccional.',
      ],
      features: [
        { title: 'Plantillas aprobadas', description: 'WhatsApp Business API con mensajes pre-aprobados.', icon: 'badge-check' },
        { title: 'Envío masivo personalizado', description: 'Variables dinámicas por contacto.', icon: 'send' },
        { title: 'Segmentación y programación', description: 'Listas segmentadas y envíos programados.', icon: 'calendar' },
        { title: 'Gestión de respuestas', description: 'Visualización y seguimiento de respuestas en el panel.', icon: 'inbox' },
      ],
      faq: [
        { question: '¿Para qué casos sirve?', answer: 'Confirmación de pedidos, actualizaciones de envío, campañas de marketing directo con mensajes personalizados y comunicación de alta prioridad.' },
        { question: '¿Necesito plantillas aprobadas?', answer: 'Sí, usamos plantillas de WhatsApp Business API aprobadas y envío solo a contactos con consentimiento.' },
        { question: '¿Puedo ver las respuestas de los clientes?', answer: 'Sí, el panel gestiona y visualiza las respuestas de cada campaña.' },
      ],
      pricing: [
        plan('Eventual', ['Hasta 5.000 mensajes/mes', '2 plantillas', 'Reportes básicos']),
        plan('Crecimiento', ['Hasta 50.000 mensajes/mes', 'Plantillas ilimitadas', 'Gestión de respuestas'], true),
        plan('Volumen', ['Mensajes ilimitados', 'Integración CRM/ERP', 'Soporte prioritario']),
      ],
      cta: { heading: 'Habla con tus clientes donde están', text: 'Campañas por WhatsApp Business API con plantillas aprobadas y resultados medibles.', label: 'Cotizar WhatsApp masivo' },
    },
    en: {
      shortDescription: 'WhatsApp Business API campaigns with approved templates.',
      description: [
        'Campaign and communication management via WhatsApp Business API, the channel your customers use the most.',
        'Approved templates, sending to opted-in contacts and informational, commercial and transactional communication.',
      ],
      features: [
        { title: 'Approved templates', description: 'WhatsApp Business API with pre-approved messages.', icon: 'badge-check' },
        { title: 'Personalized mass sending', description: 'Dynamic variables per contact.', icon: 'send' },
        { title: 'Segmentation and scheduling', description: 'Segmented lists and scheduled sends.', icon: 'calendar' },
        { title: 'Response management', description: 'View and follow up on replies in the panel.', icon: 'inbox' },
      ],
      faq: [
        { question: 'Which use cases fit?', answer: 'Order confirmations, shipping updates, direct marketing campaigns with personalized messages and high-priority communication.' },
        { question: 'Do I need approved templates?', answer: 'Yes, we use approved WhatsApp Business API templates and only send to opted-in contacts.' },
        { question: 'Can I see customer replies?', answer: 'Yes, the panel manages and displays replies for every campaign.' },
      ],
      pricing: [
        planEn('Occasional', ['Up to 5,000 messages/month', '2 templates', 'Basic reports']),
        planEn('Growth', ['Up to 50,000 messages/month', 'Unlimited templates', 'Response management'], true),
        planEn('Volume', ['Unlimited messages', 'CRM/ERP integration', 'Priority support']),
      ],
      cta: { heading: 'Talk to customers where they are', text: 'WhatsApp Business API campaigns with approved templates and measurable results.', label: 'Quote mass WhatsApp' },
    },
  },

  // ============ VIPTEL-SOFTWARE ============
  {
    slug: 'viptel-software',
    icon: 'server',
    es: {
      description: [
        'Software empresarial completo para unificar la operación de tu organización: VIPTEL ERP para integrar contabilidad, inventarios, ventas y RRHH, y VIPTEL CRM para gestionar toda la relación con tus clientes desde un solo lugar.',
        'Plataformas web con apps móviles, adaptadas a empresas en crecimiento y operaciones multi-sucursal.',
      ],
      faq: [
        { question: '¿ERP y CRM son lo mismo?', answer: 'No. El ERP gestiona la operación interna (contabilidad, inventarios, compras, ventas, nómina) y el CRM gestiona la relación con clientes (contactos, oportunidades, soporte, marketing). Se integran entre sí.' },
        { question: '¿Puedo empezar con un módulo?', answer: 'Sí, ambos son modulares: puedes empezar por el módulo que más te duele y crecer después.' },
        { question: '¿Funciona en móvil?', answer: 'Sí, el CRM tiene app para Android y iOS, y el ERP es responsive desde cualquier dispositivo.' },
        { question: '¿Se integran con mi PBX o tienda?', answer: 'Sí, ambos se integran con el ecosistema VIPTEL: telefonía (click-to-call), WhatsApp, tienda virtual y marketing.' },
      ],
      cta: { heading: 'Una sola fuente de verdad', text: 'ERP y CRM unificados para gestionar tu empresa con datos en tiempo real.', label: 'Cotizar software empresarial' },
    },
    en: {
      description: [
        'Complete enterprise software to unify your organization\u2019s operation: VIPTEL ERP to integrate accounting, inventory, sales and HR, and VIPTEL CRM to manage the whole customer relationship from one place.',
        'Web platforms with mobile apps, adapted to growing companies and multi-branch operations.',
      ],
      faq: [
        { question: 'Are ERP and CRM the same?', answer: 'No. The ERP manages internal operations (accounting, inventory, purchasing, sales, payroll) and the CRM manages customer relationships (contacts, opportunities, support, marketing). They integrate with each other.' },
        { question: 'Can I start with one module?', answer: 'Yes, both are modular: start with the module that hurts the most and grow later.' },
        { question: 'Does it work on mobile?', answer: 'Yes, the CRM has Android and iOS apps, and the ERP is responsive on any device.' },
        { question: 'Do they integrate with my PBX or store?', answer: 'Yes, both integrate with the VIPTEL ecosystem: telephony (click-to-call), WhatsApp, online store and marketing.' },
      ],
      cta: { heading: 'A single source of truth', text: 'Unified ERP and CRM to manage your company with real-time data.', label: 'Quote enterprise software' },
    },
  },
  {
    slug: 'erp',
    parentSlug: 'viptel-software',
    icon: 'server',
    es: {
      shortDescription: 'ERP modular: contabilidad, inventarios, ventas, nómina y más.',
      description: [
        'VIPTEL ERP unifica y sincroniza todas las operaciones de tu organización en una única plataforma centralizada: contabilidad, inventarios, compras, ventas, manufactura, proyectos, soporte y recursos humanos.',
        'Entorno web moderno, ágil y altamente modular, con una única fuente de verdad para la operación diaria y la toma de decisiones. Escala desde empresas en crecimiento hasta operaciones multi-sucursal.',
      ],
      features: [
        { title: 'Contabilidad y finanzas', description: 'Libros contables, control fiscal, facturación, conciliación bancaria y estados financieros.', icon: 'calculator' },
        { title: 'Inventarios', description: 'Existencias en tiempo real, multi-bodega, series, lotes y reabastecimiento automático.', icon: 'boxes' },
        { title: 'Compras y abastecimiento', description: 'Del pedido de compra al control de facturas de proveedor.', icon: 'shopping-cart' },
        { title: 'Ventas', description: 'Clientes, cotizaciones, órdenes, entregas y facturación electrónica.', icon: 'trending-up' },
        { title: 'Manufactura', description: 'Planificación MRP, listas de materiales multi-nivel y órdenes de trabajo.', icon: 'factory' },
        { title: 'Proyectos', description: 'Diagramas de Gantt, recursos y timesheets vinculados a costos.', icon: 'kanban' },
        { title: 'Soporte y clientes', description: 'Tickets, SLAs, base de conocimientos y embudo de oportunidades.', icon: 'headset' },
        { title: 'RRHH y nómina', description: 'Ciclo de vida del colaborador, asistencia, permisos, vacaciones y nómina.', icon: 'users' },
        { title: 'HRMS', description: 'Expedientes digitales, asistencias con biometría y motor de nómina configurable.', icon: 'user-check' },
        { title: 'Helpdesk', description: 'Tickets desde correo/formularios, SLAs con escalamiento y portal del cliente.', icon: 'life-buoy' },
        { title: 'Insights (BI)', description: 'Dashboards ejecutivos, consultas visuales y editor SQL avanzado.', icon: 'chart-bar' },
        { title: 'Print Designer', description: 'Diseñador visual de facturas, órdenes y cotizaciones con códigos QR.', icon: 'printer' },
        { title: 'Lending', description: 'Gestión completa de créditos: amortizaciones, intereses y conciliación.', icon: 'hand-coins' },
        { title: 'Payments', description: 'Hub de pasarelas (Stripe, PayPal, Razorpay) y conciliación automática.', icon: 'credit-card' },
        { title: 'CRM integrado', description: 'Pipeline visual con tableros Kanban y asignación automática de leads.', icon: 'kanban' },
        { title: 'Integración telefónica', description: 'Click-to-call, pop-up de llamadas y registro automático en el ERP.', icon: 'phone-call' },
        { title: 'Integración WhatsApp', description: 'Meta Cloud API, plantillas sincronizadas y chatbot con IA.', icon: 'message-circle' },
      ],
      faq: [
        { question: '¿Es un ERP de código abierto?', answer: 'Se basa en tecnología open source (Frappe/ERPNext), sin licencias restrictivas por usuario y con personalizaciones avanzadas sin alterar el código base.' },
        { question: '¿Puedo usarlo multi-sucursal?', answer: 'Sí, escala desde empresas en crecimiento hasta operaciones multi-sucursal con consolidación de información.' },
        { question: '¿Incluye facturación electrónica colombiana?', answer: 'Sí, el módulo de ventas incluye trazabilidad del ciclo comercial con facturación electrónica.' },
        { question: '¿Tiene BI y reportes?', answer: 'Sí, el módulo Insights ofrece dashboards ejecutivos en tiempo real, consultas visuales no-code y editor SQL.' },
        { question: '¿Se integra con WhatsApp y telefonía?', answer: 'Sí: WhatsApp Business API con chatbot y el conector de telefonía con click-to-call, pop-ups y registro automático de llamadas.' },
      ],
      pricing: [
        plan('Esencial', ['Contabilidad + Inventarios', 'Ventas y facturación', '5 usuarios', 'Soporte en horario laboral']),
        plan('Empresarial', ['Todos los módulos core', 'Usuarios ilimitados', 'HRMS + Helpdesk', 'Dashboards Insights'], true),
        plan('Corporativo', ['Todo Empresarial', 'Lending + Payments', 'Integraciones a medida', 'Soporte prioritario 24/7']),
      ],
      cta: { heading: 'La transformación digital de tu empresa', text: 'Unifica tu operación en un ERP modular, flexible y sin licencias restrictivas.', label: 'Cotizar ERP' },
    },
    en: {
      shortDescription: 'Modular ERP: accounting, inventory, sales, payroll and more.',
      description: [
        'VIPTEL ERP unifies and syncs all your organization\u2019s operations in a single centralized platform: accounting, inventory, purchasing, sales, manufacturing, projects, support and human resources.',
        'Modern, agile, highly modular web environment with a single source of truth for daily operations and decision-making. It scales from growing companies to multi-branch operations.',
      ],
      features: [
        { title: 'Accounting and finance', description: 'Ledgers, tax control, invoicing, bank reconciliation and financial statements.', icon: 'calculator' },
        { title: 'Inventory', description: 'Real-time stock, multi-warehouse, serials, batches and automatic replenishment.', icon: 'boxes' },
        { title: 'Purchasing', description: 'From purchase order to supplier invoice control.', icon: 'shopping-cart' },
        { title: 'Sales', description: 'Customers, quotes, orders, deliveries and electronic invoicing.', icon: 'trending-up' },
        { title: 'Manufacturing', description: 'MRP planning, multi-level BOMs and work orders.', icon: 'factory' },
        { title: 'Projects', description: 'Gantt charts, resources and timesheets linked to costs.', icon: 'kanban' },
        { title: 'Support and customers', description: 'Tickets, SLAs, knowledge base and opportunity funnel.', icon: 'headset' },
        { title: 'HR and payroll', description: 'Employee lifecycle, attendance, leaves, vacations and payroll.', icon: 'users' },
        { title: 'HRMS', description: 'Digital records, biometric attendance and configurable payroll engine.', icon: 'user-check' },
        { title: 'Helpdesk', description: 'Tickets from email/forms, SLAs with escalation and client portal.', icon: 'life-buoy' },
        { title: 'Insights (BI)', description: 'Executive dashboards, visual queries and advanced SQL editor.', icon: 'chart-bar' },
        { title: 'Print Designer', description: 'Visual designer for invoices, orders and quotes with QR codes.', icon: 'printer' },
        { title: 'Lending', description: 'Full credit management: amortization, interest and reconciliation.', icon: 'hand-coins' },
        { title: 'Payments', description: 'Gateway hub (Stripe, PayPal, Razorpay) and automatic reconciliation.', icon: 'credit-card' },
        { title: 'Integrated CRM', description: 'Visual pipeline with Kanban boards and automatic lead assignment.', icon: 'kanban' },
        { title: 'Telephony integration', description: 'Click-to-call, call pop-ups and automatic ERP logging.', icon: 'phone-call' },
        { title: 'WhatsApp integration', description: 'Meta Cloud API, synced templates and AI chatbot.', icon: 'message-circle' },
      ],
      faq: [
        { question: 'Is it an open-source ERP?', answer: 'It is based on open-source technology (Frappe/ERPNext), with no restrictive per-user licenses and advanced customizations without altering the base code.' },
        { question: 'Can I use it across branches?', answer: 'Yes, it scales from growing companies to multi-branch operations with consolidated information.' },
        { question: 'Does it include Colombian electronic invoicing?', answer: 'Yes, the sales module includes full commercial cycle traceability with electronic invoicing.' },
        { question: 'Does it have BI and reports?', answer: 'Yes, the Insights module offers real-time executive dashboards, no-code visual queries and a SQL editor.' },
        { question: 'Does it integrate with WhatsApp and telephony?', answer: 'Yes: WhatsApp Business API with chatbot and the telephony connector with click-to-call, pop-ups and automatic call logging.' },
      ],
      pricing: [
        planEn('Essential', ['Accounting + Inventory', 'Sales and invoicing', '5 users', 'Business-hours support']),
        planEn('Business', ['All core modules', 'Unlimited users', 'HRMS + Helpdesk', 'Insights dashboards'], true),
        planEn('Corporate', ['Everything in Business', 'Lending + Payments', 'Custom integrations', '24/7 priority support']),
      ],
      cta: { heading: 'Your company\u2019s digital transformation', text: 'Unify your operation in a modular, flexible ERP without restrictive licenses.', label: 'Quote ERP' },
    },
  },
  {
    slug: 'crm',
    parentSlug: 'viptel-software',
    icon: 'users',
    es: {
      shortDescription: 'CRM unificado: ventas, soporte, marketing y analítica.',
      description: [
        'VIPTEL CRM une todas las herramientas de comunicación y gestión empresarial en un solo sistema: contactos, oportunidades, pedidos, soporte, marketing y analítica, con reportes y dashboards para la toma de decisiones.',
        'Disponible en versión web y app para Android y iOS, con integraciones con WhatsApp, telefonía y el ecosistema VIPTEL.',
      ],
      features: [
        { title: 'Gestión de contactos', description: 'Base centralizada con segmentación por criterios.', icon: 'users' },
        { title: 'Oportunidades', description: 'Pipeline comercial con tareas, etapas y progreso medible.', icon: 'kanban' },
        { title: 'Pedidos y compras', description: 'Pedidos, órdenes de compra, stock y seguimiento de envíos.', icon: 'shopping-cart' },
        { title: 'Gestión de clientes', description: 'Categorización por importancia, sector o perfil con historial.', icon: 'user-check' },
        { title: 'Lead nurturing', description: 'Enrutamiento automático y campañas de conversión.', icon: 'target' },
        { title: 'Cadena de suministro', description: 'Proveedores, precios, stock y entregas.', icon: 'boxes' },
        { title: 'Analítica', description: 'Informes de desempeño, dashboards en tiempo real y tendencias.', icon: 'chart-bar' },
        { title: 'Soporte al cliente', description: 'Incidencias, asignación automática e historial.', icon: 'headset' },
        { title: 'Marketing', description: 'Campañas por email y SMS con segmentación.', icon: 'megaphone' },
        { title: 'Redes sociales', description: 'Publicación, monitoreo y resolución de quejas en redes.', icon: 'share-2' },
        { title: 'Integraciones', description: 'Google Workspace, Teams, Slack, SAP, Salesforce y más.', icon: 'plug' },
        { title: 'Seguridad', description: 'Roles, cifrado y autenticación multifactor.', icon: 'shield' },
        { title: 'App móvil', description: 'iOS y Android con las mismas funcionalidades.', icon: 'smartphone' },
        { title: 'Automatización', description: 'Flujos de trabajo, alertas y notificaciones.', icon: 'workflow' },
        { title: 'WhatsApp API', description: 'Conversaciones con colas, enrutamiento y supervisión tipo PBX.', icon: 'message-circle' },
        { title: 'ViptelPBX', description: 'Click-to-call, registro automático y pop-up del cliente en llamadas.', icon: 'phone-call' },
        { title: 'ViptelBot', description: 'Asistentes IA conectados al CRM con escalamiento a agente humano.', icon: 'bot' },
        { title: 'WhatsApp Call', description: 'Llamadas de voz y video por WhatsApp registradas en el historial.', icon: 'video' },
      ],
      faq: [
        { question: '¿Qué incluye el módulo de WhatsApp API?', answer: 'Enrutamiento de conversaciones, colas con estados, panel de supervisores, bandeja integrada y enlace con oportunidades, tickets y pedidos.' },
        { question: '¿Puedo llamar desde el CRM?', answer: 'Sí, ViptelPBX integra click-to-call, registro automático de llamadas y pop-ups con los datos del cliente.' },
        { question: '¿Tiene app móvil?', answer: 'Sí, para Android y iOS, con las mismas funcionalidades desde cualquier dispositivo.' },
        { question: '¿Se integra con WhatsApp Call?', answer: 'Sí, las llamadas de voz y video por WhatsApp quedan registradas en el historial del contacto con métricas por agente.' },
        { question: '¿Automatiza procesos?', answer: 'Sí, con flujos de trabajo automáticos, alertas y notificaciones, incluyendo ViptelBot para atención inicial con IA.' },
      ],
      pricing: [
        plan('Equipo', ['Hasta 5 usuarios', 'Contactos y oportunidades', 'Soporte y tareas', 'App móvil']),
        plan('Empresa', ['Usuarios ilimitados', 'WhatsApp API + ViptelPBX', 'Marketing y analítica', 'Automatizaciones'], true),
        plan('Corporativo', ['Todo Empresa', 'ViptelBot con IA', 'Integraciones SAP/Salesforce', 'Soporte prioritario 24/7']),
      ],
      cta: { heading: 'Toda tu relación con clientes en un solo lugar', text: 'Gestiona ventas, soporte y marketing con un CRM unificado y con IA.', label: 'Cotizar CRM' },
    },
    en: {
      shortDescription: 'Unified CRM: sales, support, marketing and analytics.',
      description: [
        'VIPTEL CRM joins all communication and business management tools in one system: contacts, opportunities, orders, support, marketing and analytics, with reports and dashboards for decision-making.',
        'Available on web and as Android and iOS apps, with WhatsApp, telephony and VIPTEL ecosystem integrations.',
      ],
      features: [
        { title: 'Contact management', description: 'Centralized base with segmentation by criteria.', icon: 'users' },
        { title: 'Opportunities', description: 'Sales pipeline with tasks, stages and measurable progress.', icon: 'kanban' },
        { title: 'Orders and purchases', description: 'Orders, purchase orders, stock and shipment tracking.', icon: 'shopping-cart' },
        { title: 'Customer management', description: 'Categorization by importance, sector or profile with history.', icon: 'user-check' },
        { title: 'Lead nurturing', description: 'Automatic routing and conversion campaigns.', icon: 'target' },
        { title: 'Supply chain', description: 'Suppliers, prices, stock and deliveries.', icon: 'boxes' },
        { title: 'Analytics', description: 'Performance reports, real-time dashboards and trends.', icon: 'chart-bar' },
        { title: 'Customer support', description: 'Incidents, automatic assignment and history.', icon: 'headset' },
        { title: 'Marketing', description: 'Email and SMS campaigns with segmentation.', icon: 'megaphone' },
        { title: 'Social media', description: 'Publishing, monitoring and complaint resolution on social networks.', icon: 'share-2' },
        { title: 'Integrations', description: 'Google Workspace, Teams, Slack, SAP, Salesforce and more.', icon: 'plug' },
        { title: 'Security', description: 'Roles, encryption and multi-factor authentication.', icon: 'shield' },
        { title: 'Mobile app', description: 'iOS and Android with the same features.', icon: 'smartphone' },
        { title: 'Automation', description: 'Workflows, alerts and notifications.', icon: 'workflow' },
        { title: 'WhatsApp API', description: 'Conversations with PBX-style queues, routing and supervision.', icon: 'message-circle' },
        { title: 'ViptelPBX', description: 'Click-to-call, automatic logging and customer pop-up on calls.', icon: 'phone-call' },
        { title: 'ViptelBot', description: 'AI assistants connected to the CRM with human agent escalation.', icon: 'bot' },
        { title: 'WhatsApp Call', description: 'WhatsApp voice and video calls recorded in the history.', icon: 'video' },
      ],
      faq: [
        { question: 'What does the WhatsApp API module include?', answer: 'Conversation routing, queues with statuses, supervisor panel, integrated inbox and linking to opportunities, tickets and orders.' },
        { question: 'Can I call from the CRM?', answer: 'Yes, ViptelPBX integrates click-to-call, automatic call logging and customer data pop-ups.' },
        { question: 'Does it have a mobile app?', answer: 'Yes, for Android and iOS, with the same features on any device.' },
        { question: 'Does it integrate with WhatsApp Call?', answer: 'Yes, WhatsApp voice and video calls are recorded in the contact history with per-agent metrics.' },
        { question: 'Does it automate processes?', answer: 'Yes, with automatic workflows, alerts and notifications, including ViptelBot for AI-powered first contact.' },
      ],
      pricing: [
        planEn('Team', ['Up to 5 users', 'Contacts and opportunities', 'Support and tasks', 'Mobile app']),
        planEn('Company', ['Unlimited users', 'WhatsApp API + ViptelPBX', 'Marketing and analytics', 'Automations'], true),
        planEn('Corporate', ['Everything in Company', 'ViptelBot with AI', 'SAP/Salesforce integrations', '24/7 priority support']),
      ],
      cta: { heading: 'All your customer relationships in one place', text: 'Manage sales, support and marketing with a unified, AI-powered CRM.', label: 'Quote CRM' },
    },
  },
]

// ---------- Upsert helpers ----------
const pricingToData = (plans: PlanDef[] = [], locale: string) =>
  plans.map((p) => ({
    planName: p.planName,
    price: 0,
    currency: locale === 'es' ? 'COP' : 'USD',
    period: locale === 'es' ? '/mes' : '/month',
    features: (p.features ?? []).map((feature) => ({ feature })),
    highlighted: p.highlighted ?? false,
    ctaLabel: p.ctaLabel,
  }))

const upsertService = async (
  payload: Payload,
  seed: ServiceSeed,
  parentsBySlug: Map<string, number>,
) => {
  const parentId = seed.parentSlug ? parentsBySlug.get(seed.parentSlug) : undefined

  const existing = await payload.find({
    collection: 'services',
    where: { slug: { equals: seed.slug } },
    limit: 1,
  })

  const locales = ['es', 'en'] as const

  const buildData = (locale: 'es' | 'en') => {
    const c = seed[locale]
    return {
      ...(c.title ? { title: c.title } : {}),
      ...(c.shortDescription ? { shortDescription: c.shortDescription } : {}),
      description: richText(c.description),
      features: (c.features ?? []).map((f) => ({
        title: f.title,
        description: f.description,
        icon: f.icon,
      })),
      faq: (c.faq ?? []).map((f) => ({ question: f.question, answer: richText([f.answer]) })),
      pricing: pricingToData(c.pricing, locale),
      layout: [ctaBlock(c.cta.heading, c.cta.text, c.cta.label)],
    } as unknown as Partial<RequiredDataFromCollectionSlug<'services'>>
  }

  if (existing.docs.length > 0) {
    const id = existing.docs[0].id
    for (const locale of locales) {
      await payload.update({
        collection: 'services',
        id,
        locale,
        context: { disableRevalidate: true },
        data: buildData(locale),
      })
    }
    // non-localized fields (default locale)
    await payload.update({
      collection: 'services',
      id,
      locale: 'es',
      context: { disableRevalidate: true },
      data: {
        icon: seed.icon,
        ...(parentId ? { parent: parentId } : {}),
      } as unknown as Partial<RequiredDataFromCollectionSlug<'services'>>,
    })
    payload.logger.info(`  ✓ updated: ${seed.slug}`)
    return
  }

  await payload.create({
    collection: 'services',
    locale: 'es',
    context: { disableRevalidate: true },
    data: {
      slug: seed.slug,
      icon: seed.icon,
      ...(parentId ? { parent: parentId } : {}),
      ...buildData('es'),
    } as unknown as RequiredDataFromCollectionSlug<'services'>,
  })
  const created = await payload.find({ collection: 'services', where: { slug: { equals: seed.slug } }, limit: 1 })
  const id = created.docs[0].id
  await payload.update({
    collection: 'services',
    id,
    locale: 'en',
    context: { disableRevalidate: true },
    data: buildData('en'),
  })
  // publish both locales
  for (const locale of locales) {
    await payload.update({
      collection: 'services',
      id,
      locale,
      context: { disableRevalidate: true },
      data: { _status: 'published' },
    })
  }
  payload.logger.info(`  + created: ${seed.slug}`)
}

// ---------- Main ----------
process.env.DISABLE_REVALIDATE = 'true'
const payload = await getPayload({ config })

payload.logger.info('Seeding services content (es/en)...')

const parentsBySlug = new Map<string, number>()
for (const seed of services.filter((s) => !s.parentSlug)) {
  const found = await payload.find({ collection: 'services', where: { slug: { equals: seed.slug } }, limit: 1 })
  if (found.docs[0]) parentsBySlug.set(seed.slug, found.docs[0].id as number)
}

for (const seed of services) {
  await upsertService(payload, seed, parentsBySlug)
}

payload.logger.info('Done. Services content seeded.')
process.exit(0)