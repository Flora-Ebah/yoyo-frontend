'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  authService,
  type AdminLoginCredentials,
  type GoogleLoginCredentials,
  type LoginCredentials
} from '@/services/auth.service'
import { sessionService } from '@/services/session.service'
import { userService } from '@/services/user.service'
import { apiServer } from '@/services/api.server'
import { abilityAllows } from '@/configs/permissions'

/**
 * Détermine, de façon AUTORITAIRE (abilities backend), la route d'atterrissage
 * après connexion. Un commercial (droit `create pros` sans `read dashboard`) va
 * TOUJOURS vers /commercial, quel que soit le paramètre `redirect` (qui peut être
 * périmé, ex. /dashboard?tab=vue). En cas d'indétermination (panne réseau), on
 * retombe sur la cible demandée interne, sinon /dashboard — les gardes client
 * servent de filet de sécurité.
 */
export async function resolveLandingRoute(requested?: string): Promise<string> {
  const safeRequested =
    requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : undefined

  const abilities = await apiServer.getAbilities()

  if (!abilities) return safeRequested || '/dashboard'

  const isCommercial = abilityAllows(abilities, 'create', 'pros') && !abilityAllows(abilities, 'read', 'dashboard')

  if (isCommercial) return '/commercial'

  // Admin : honorer la cible demandée, sauf si elle pointe vers l'espace commercial.
  if (safeRequested && !safeRequested.startsWith('/commercial')) return safeRequested

  return '/dashboard'
}

/**
 * Server Action pour la connexion utilisateur.
 * Dans le backoffice, nous utilisons le flux admin.
 */
export async function loginAction(credentials: LoginCredentials) {
  try {
    const adminCredentials: AdminLoginCredentials = {
      email: credentials.login,
      password: credentials.password,
      rememberMe: credentials.rememberMe
    }

    const authResponse = await authService.loginAdmin(adminCredentials)

    await sessionService.createSession(authResponse, credentials.rememberMe)

    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      user: authResponse.user
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la connexion',
      details: error.details
    }
  }
}

/**
 * Server Action pour la connexion administrateur
 */
export async function loginAdminAction(credentials: AdminLoginCredentials) {
  try {
    const authResponse = await authService.loginAdmin(credentials)

    await sessionService.createSession(authResponse, credentials.rememberMe)

    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      user: authResponse.user
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la connexion administrateur',
      details: error.details
    }
  }
}

/**
 * Server Action pour la deconnexion avec redirection
 */
export async function logoutAction() {
  try {
    const session = await sessionService.getSession()

    if (session?.connectionId) {
      await authService.logout(session.connectionId)
    }

    await sessionService.destroySession()

    redirect('/login')
  } catch {
    await sessionService.destroySession()
    redirect('/login')
  }
}

/**
 * Server Action pour la deconnexion sans redirection
 */
export async function logoutActionWithoutRedirect() {
  try {
    const session = await sessionService.getSession()

    if (session?.connectionId) {
      await authService.logout(session.connectionId)
    }

    await sessionService.destroySession()

    return { success: true }
  } catch (error: any) {
    await sessionService.destroySession()

    return {
      success: false,
      error: error.message || 'Erreur lors de la deconnexion'
    }
  }
}

/**
 * Server Action pour la connexion Google
 */
export async function loginGoogleAction(credentials: GoogleLoginCredentials) {
  try {
    const authResponse = await authService.loginGoogle(credentials)

    await sessionService.createSession(authResponse, credentials.rememberMe)

    revalidatePath('/')
    revalidatePath('/dashboard')

    return {
      success: true,
      user: authResponse.user
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors de la connexion Google',
      details: error.details
    }
  }
}

/**
 * Server Action pour verifier la session
 */
export async function checkSessionAction() {
  const session = await sessionService.ensureValidSession()

  return {
    isAuthenticated: !!session,
    user: session?.user
  }
}

/**
 * Server Action pour rafraichir la session explicitement
 */
export async function refreshSessionAction() {
  try {
    const refreshed = await sessionService.refreshSession()

    if (refreshed) {
      const session = await sessionService.getSession()

      return {
        success: true,
        token: session?.token
      }
    }

    return { success: false }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erreur lors du rafraichissement de la session'
    }
  }
}

/**
 * Server Action pour l'inscription
 */
export async function registerAction(data: {
  email: string
  password: string
  username: string
  country: string
  role?: 'user' | 'creator'
  firstname?: string
  lastname?: string
  contact?: string
  birthdate?: string
  gender?: string
  favoriteTeam?: string
  recaptchaToken?: string
}) {
  try {
    const response = await userService.register(data)

    return {
      success: true,
      message: response.message || 'Inscription reussie',
      user: response.user
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Erreur lors de l'inscription",
      details: error.details
    }
  }
}

/**
 * Server Action pour verifier la disponibilite d'un email
 */
export async function checkEmailAvailabilityAction(email: string) {
  try {
    const result = await userService.checkEmailAvailability(email)

    return result
  } catch (error: any) {
    return {
      available: false,
      message: error.message || 'Erreur lors de la verification'
    }
  }
}

/**
 * Server Action pour verifier la disponibilite d'un nom d'utilisateur
 */
export async function checkUsernameAvailabilityAction(username: string) {
  try {
    const result = await userService.checkUsernameAvailability(username)

    return result
  } catch (error: any) {
    return {
      available: false,
      message: error.message || 'Erreur lors de la verification'
    }
  }
}

/**
 * Server Action pour generer un token public
 */
export async function generatePublicTokenAction(): Promise<{ token: string | null; error?: string }> {
  try {
    const response = await authService.generatePublicToken()

    if (response && response.token) {
      return {
        token: response.token
      }
    }

    return {
      token: null,
      error: 'Token non trouve dans la reponse'
    }
  } catch (error: any) {
    console.error('Erreur lors de la generation du token public:', error)

    return {
      token: null,
      error: error.message || 'Erreur lors de la generation du token public'
    }
  }
}
