import type { Block } from 'payload'

export const Form: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      label: 'Choose a form to display',
    },
  ],
  labels: {
    plural: 'Form Blocks',
    singular: 'Form Block',
  },
}
