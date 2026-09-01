import packageJson from '../../package.json'

// Configuration de l'application
export const APP_CONFIG = {
  name: packageJson.name,
  title: process.env.NEXT_PUBLIC_APP_TITLE || 'YoYo Admin',
  version: packageJson.version,
  description: process.env.NEXT_APP_DESCRIPTION || (packageJson as any).description || '',
  contact: {
    email: process.env.NEXT_APP_CONTACT_EMAIL,
    phone: process.env.NEXT_APP_CONTACT_PHONE,
    address: process.env.NEXT_APP_CONTACT_ADDRESS,
    hours: process.env.NEXT_APP_CONTACT_HOURS,
    social: {
      facebook: process.env.NEXT_PUBLIC_APP_CONTACT_SOCIAL_FACEBOOK || '',
      linkedin: process.env.NEXT_PUBLIC_APP_CONTACT_SOCIAL_LINKEDIN || '',
      youtube: process.env.NEXT_PUBLIC_APP_CONTACT_SOCIAL_YOUTUBE || ''
    }
  }
}

// Configuration de l'API (côté client : PAS de clé API — elle reste serveur-only,
// ajoutée par le proxy `/api/proxy`).
export const API = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  version: process.env.NEXT_PUBLIC_API_VERSION,
  path: process.env.NEXT_PUBLIC_API_PATH
}

// ============================================
// ROUTES DE L'APPLICATION
// ============================================
export const ROUTES = {
  // Pages principales
  home: '/',
  dashboard: '/dashboard',

  // Coeur YoYo
  monitoring: {
    clients: '/clients',
    pros: '/pros',
    transactions: '/transactions',
    moderation: '/moderation'
  },

  // Modules secondaires / legacy
  commercial: {
    stores: '/stores',
    categories: '/categories',
    packs: '/packs',
    products: '/products',
    soins: '/soins'
  },

  // Paiements legacy
  payments: {
    purchases: '/purchases',
    subscriptions: '/subscriptions',
    transactions: '/transactions'
  },

  // Utilisateurs legacy
  users: {
    list: '/user',
    profiles: '/profile',
    roles: '/roles'
  },

  // Communications
  communications: {
    notifications: '/notifications',
    messages: '/messages',
    faq: '/faq'
  },

  // Administration
  administration: {
    settings: '/account-settings',
    statistics: '/dashboard'
  },

  // Authentification
  auth: {
    login: '/login',
    register: '/register',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resetPassword: '/auth/reset-password'
  },

  // Autres
  notFound: '/404'
} as const
