import type { Service } from '../types'

export const services: Service[] = [
  {
    name: 'Breakfast Signature',
    icon: 'spark',
    price: '$35',
    note: 'Chef selection, tea service, and fresh juice',
    status: 'Active',
  },
  {
    name: 'Private Chauffeur',
    icon: 'shield',
    price: '$80',
    note: 'Airport arrival or city transfer',
    status: 'Active',
  },
  {
    name: 'Wellness Ritual',
    icon: 'award',
    price: '$120',
    note: 'Spa treatment with private suite setup',
    status: 'Active',
  },
  {
    name: 'Late Checkout',
    icon: 'calendar',
    price: '$45',
    note: 'Extend room access until 4:00 PM',
    status: 'Paused',
  },
]
