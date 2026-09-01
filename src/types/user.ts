/**
 * Types pour les données utilisateur
 * Basé sur proleague-web-old/types/auth.ts
 */

export interface User {
  id?: string
  _id?: string
  slug?: string
  name?: string
  username: string
  email: string
  createdAt?: string
  updatedAt?: string
  role?: 'admin' | 'user' | 'creator'
  avatar?: string
  address?: string
  country?: string
  gender?: string
  birthdate?: string
  firstname?: string
  lastname?: string
  favoriteTeam?: string
  googleId?: string
  documents?: unknown[]
  zones?: Array<{
    _id: string
    name: string
    slug: string
  }>
  
  // Propriétés gaming
  onlineId?: string
  level?: number
  experience?: number
  coins?: number
  gems?: number
  gamesPlayed?: number
  gamesWon?: number
  gamesLost?: number
  winRate?: number
  totalPlayTime?: number
  favoriteGames?: string[]
  language?: string
  timezone?: string
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'premium'
  isOnline?: boolean
  lastLogin?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  
  // Propriétés de l'API client
  contact?: string
  isDocumentVerified?: boolean
  isCertified?: boolean
  isPartner?: boolean
  accountVerificationCompletion?: number
  isPhoneConfirmed?: boolean
  isEmailConfirmed?: boolean
  documentVerificationStatus?: string
  authProvider?: 'local' | 'google' | 'facebook' | 'twitter' | 'github'
  authProviderId?: string
  profileCompleted?: boolean
  syncOAuthData?: boolean
  
  securityPreferences?: {
    deviceLogin?: boolean
    twoFactorEnabled: boolean
    twoFactorMethod: string
    loginNotifications: boolean
    sessionTimeout: number
    ipWhitelist: string[]
    ipBlacklist?: string[]
  }
  
  notificationPreferences?: {
    types: {
      news: boolean
      updates: boolean
      security: boolean
      marketing: boolean
      matches?: boolean
      tournaments?: boolean
      teams?: boolean
      zones?: boolean
      rankings?: boolean
      invitations?: boolean
      achievements?: boolean
    }
    email: boolean
    push: boolean
    sms: boolean
    frequency: string
  }
  
  [key: string]: unknown
}

