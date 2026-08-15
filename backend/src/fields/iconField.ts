import type { Field } from 'payload'

export const iconField = (): Field => ({
  name: 'icon',
  type: 'text',
  admin: {
    components: {
      Field: '@/components/IconPicker/IconPickerField#IconPickerField',
    },
    description: 'Selecciona un icono de la librería Lucide.',
  },
})
