'use server'

// Service Imports
import { userService } from '@/services/user.service'
import { otpService } from '@/services/otp.service'

// Type Imports
import type { User, ConnectionsResponse } from '@/services/user.service'

/**
 * Server Action pour récupérer les données de l'utilisateur connecté
 * GET /user/me
 */
export async function getUserProfileAction(): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.getConnectedUser()

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error)

    // Gérer différents types d'erreurs
    let errorMessage = 'Erreur lors de la récupération du profil'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.statusCode === 404) {
      errorMessage = 'Profil utilisateur introuvable.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour récupérer l'historique des connexions
 * GET /login/me
 */
export async function getMyConnectionsAction(
  page: number = 1,
  limit: number = 10,
  status?: 'success' | 'failed' | 'revoked'
): Promise<{ connections: ConnectionsResponse | null; error?: string }> {
  try {
    const connections = await userService.getMyConnections(page, limit, status)

    return { connections }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des connexions:', error)

    let errorMessage = 'Erreur lors de la récupération des connexions'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      connections: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour mettre à jour le profil
 * PUT /user/me
 */
export async function updateProfileAction(data: {
  firstname?: string
  lastname?: string
  address?: string
  birthdate?: string
  country?: string
  gender?: string
  favoriteTeam?: string
  syncOAuthData?: boolean
}): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.updateProfile(data)

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error)

    let errorMessage = 'Erreur lors de la mise à jour du profil'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.statusCode === 409) {
      errorMessage = error.message || 'Cette information est déjà utilisée'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour mettre à jour les préférences de sécurité
 * PUT /user/me/security-preferences
 */
export async function updateSecurityPreferencesAction(data: {
  deviceLogin?: boolean
  twoFactorEnabled?: boolean
  twoFactorMethod?: 'email' | 'sms' | 'authenticator'
  loginNotifications?: boolean
  sessionTimeout?: number
  ipWhitelist?: string[]
  ipBlacklist?: string[]
}): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.updateSecurityPreferences(data)

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des préférences de sécurité:', error)

    let errorMessage = 'Erreur lors de la mise à jour des préférences de sécurité'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour mettre à jour les préférences de notifications
 * PUT /user/me/notification-preferences
 */
export async function updateNotificationPreferencesAction(data: {
  email?: boolean
  push?: boolean
  sms?: boolean
  frequency?: 'immediate' | 'daily' | 'weekly'
  types?: {
    news?: boolean
    updates?: boolean
    security?: boolean
    marketing?: boolean
    matches?: boolean
    tournaments?: boolean
    teams?: boolean
    zones?: boolean
    rankings?: boolean
    invitations?: boolean
    achievements?: boolean
  }
}): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.updateNotificationPreferences(data)

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour des préférences de notifications:', error)

    let errorMessage = 'Erreur lors de la mise à jour des préférences de notifications'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour modifier le mot de passe
 * PUT /user/me/password
 */
export async function updatePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<{ message?: string; error?: string }> {
  try {
        await userService.updatePassword({
      password: currentPassword,
      newPassword,
      confirmPassword: newPassword
    })

    return { message: 'Mot de passe mis à jour avec succès' }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error)

    let errorMessage = 'Erreur lors de la mise à jour du mot de passe'

    if (error?.statusCode === 401) {
      errorMessage = error?.message?.includes('incorrect') || error?.message?.includes('incorrect')
        ? 'Mot de passe actuel incorrect'
        : 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.statusCode === 400) {
      errorMessage = error?.message || 'Données invalides'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      error: errorMessage
    }
  }
}

/**
 * Server Action pour générer un OTP pour le changement d'email
 * POST /otp/generate
 */
export async function generateEmailChangeOtpAction(
  email: string,
  appCheckToken?: string | null
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const result = await otpService.generate(
      {
        login: email,
        messageType: 'ACCOUNT_UPDATED'
      },
      appCheckToken
    )

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Erreur lors de la génération de l\'OTP:', error)

    let errorMessage = 'Erreur lors de l\'envoi du code OTP'

    if (error?.statusCode === 400) {
      errorMessage = error.message || 'Email invalide.'
    } else if (error?.statusCode === 409) {
      errorMessage = error.message || 'Cet email est déjà utilisé.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour convertir un compte OAuth en compte local
 * POST /user/me/convert-to-local
 */
export async function convertToLocalAccountAction(password: string): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.convertToLocalAccount(password)

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la conversion du compte:', error)

    let errorMessage = 'Erreur lors de la conversion du compte'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.statusCode === 400) {
      errorMessage = error.message || 'Le mot de passe est invalide.'
    } else if (error?.statusCode === 403) {
      errorMessage = error.message || 'Ce compte est déjà un compte local.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour mettre à jour l'email
 * PUT /user/me/email
 */
export async function updateEmailAction(email: string, otp: string): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.updateEmail(email, otp)

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'email:', error)

    let errorMessage = 'Erreur lors de la mise à jour de l\'email'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.statusCode === 400) {
      errorMessage = error.message || 'Code OTP invalide ou expiré.'
    } else if (error?.statusCode === 409) {
      errorMessage = error.message || 'Cet email est déjà utilisé.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}

/**
 * Server Action pour mettre à jour le rôle
 * PUT /user/me/role
 */
export async function updateRoleAction(role: 'user' | 'creator'): Promise<{ user: User | null; error?: string }> {
  try {
    const user = await userService.updateMyRole(role === 'creator' ? 'provider' : role)

    return { user }
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du rôle:', error)

    let errorMessage = 'Erreur lors de la mise à jour du rôle'

    if (error?.statusCode === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.'
    } else if (error?.statusCode === 400) {
      errorMessage = error.message || 'Rôle invalide.'
    } else if (error?.statusCode === 403) {
      errorMessage = error.message || 'Vous n\'avez pas la permission de modifier votre rôle.'
    } else if (error?.message) {
      errorMessage = error.message
    }

    return {
      user: null,
      error: errorMessage
    }
  }
}


