import type { ConsentConfig } from '@/lib/consent.types';

const consentConfig: ConsentConfig = {
  version: 1,
  mode: 'consent_mode_v2',
  storageKey: 'cookie-consent',

  categories: {
    necessary: {
      label: 'Necesarias',
      description: 'Cookies esenciales para el funcionamiento del sitio. No se pueden desactivar.',
      required: true,
      defaultEnabled: true,
      gcmTypes: ['security_storage'],
    },
    analytics: {
      label: 'Analíticas',
      description: 'Nos ayudan a entender cómo los visitantes interactúan con el sitio mediante datos anónimos de uso.',
      required: false,
      defaultEnabled: false,
      gcmTypes: ['analytics_storage'],
    },
    marketing: {
      label: 'Marketing',
      description: 'Utilizadas para mostrar anuncios relevantes y medir el rendimiento de campañas.',
      required: false,
      defaultEnabled: false,
      gcmTypes: ['ad_storage', 'ad_user_data', 'ad_personalization'],
    },
    preferences: {
      label: 'Preferencias',
      description: 'Permiten que el sitio recuerde tus elecciones, como idioma o región.',
      required: false,
      defaultEnabled: false,
      gcmTypes: ['functionality_storage', 'personalization_storage'],
    },
  },

  ui: {
    heading: 'Preferencias de cookies',
    description: 'Usamos cookies para mejorar tu experiencia de navegación y analizar nuestro tráfico.',
    acceptAll: 'Aceptar todas',
    declineAll: 'Rechazar todas',
    customize: 'Personalizar',
    savePreferences: 'Guardar preferencias',
    settingsHeading: 'Configuración de privacidad',
    alwaysOnLabel: 'Siempre activo',
    privacyPolicyLabel: 'Política de privacidad',
    bannerAriaLabel: 'Consentimiento de cookies',
    reopenerAriaLabel: 'Abrir configuración de cookies',
  },

  showDelay: 500,
};

export default consentConfig;
