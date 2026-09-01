import { cookies } from 'next/headers'

import { authService, type AuthResponse } from './auth.service'

/**
 * Types pour la session
 */
export interface Session {
  user: {
    id: string
    username: string
    email: string
    role: string
    firstname?: string
    lastname?: string
    [key: string]: unknown
  }
  token?: string // Token d'authentification pour les requêtes API
  isAuthenticated: boolean
  expiresAt?: number
  connectionId?: string
}

/**
 * Service de gestion de session
 * Centralise toute la logique de gestion des sessions utilisateur
 */
export class SessionService {
  private readonly SESSION_COOKIE = 'user'
  private readonly AUTH_TOKEN_COOKIE = 'auth_token'
  private readonly REFRESH_TOKEN_COOKIE = 'refresh_token'
  private readonly REFRESH_BEFORE_MS = 5 * 60 * 1000 // 5 minutes

  private parseDurationToSeconds(value?: string, fallbackSeconds: number = 24 * 60 * 60): number {
    if (!value || typeof value !== 'string') return fallbackSeconds

    const trimmed = value.trim()
    const match = trimmed.match(/^(\d+)\s*([smhd])$/i)

    if (!match) return fallbackSeconds

    const amount = parseInt(match[1], 10)
    const unit = match[2].toLowerCase()

    const unitToSeconds: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60
    }

    return amount * (unitToSeconds[unit] || fallbackSeconds)
  }

  /**
   * Récupère la session actuelle depuis les cookies
   */
  async getSession(): Promise<Session | null> {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(this.SESSION_COOKIE)

    if (!sessionCookie?.value) {
      return null
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value)

      return {
        user: sessionData.user,
        token: sessionData.token, // Récupérer le token depuis le cookie
        isAuthenticated: true,
        expiresAt: sessionData.expiresAt,
        connectionId: sessionData.connectionId
      }
    } catch {
      return null
    }
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.ensureValidSession()

    return session?.isAuthenticated ?? false
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  async hasRole(role: string): Promise<boolean> {
    const session = await this.ensureValidSession()

    return session?.user.role === role
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  async isAdmin(): Promise<boolean> {
    return this.hasRole('admin')
  }

  /**
   * Crée une session après une connexion réussie
   * Cette méthode est appelée par les Server Actions
   */
  async createSession(authResponse: AuthResponse, rememberMe: boolean = false): Promise<void> {
    const cookieStore = await cookies()
    const fallbackAccessMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
    const accessMaxAge = this.parseDurationToSeconds((authResponse as any).expiresIn, fallbackAccessMaxAge)
    const refreshMaxAge = this.parseDurationToSeconds((authResponse as any).refreshTokenExpiresIn, 30 * 24 * 60 * 60)

    // L'API de refresh peut ne pas renvoyer l'objet user.
    // On reutilise alors l'utilisateur deja present en session.
    const existingSession = await this.getSession()

    // Extraire le token une seule fois
    const accessToken = authResponse.token || (authResponse as any).accessToken

    // S'assurer que le rôle est présent dans l'objet user stocké
    // L'API peut retourner le rôle à la racine de la réponse, pas forcément dans l'objet user
    const userFromResponse = authResponse.user
    const fallbackUser = existingSession?.user

    const userToStore = {
      ...(userFromResponse || fallbackUser || {}),
      role: userFromResponse?.role || (authResponse as any).role || fallbackUser?.role
    }

    // Cookie de session (non-HttpOnly : lisible côté client pour l'affichage user/role).
    // SÉCURITÉ (#1) : il NE contient PLUS le token d'accès. Le token vit uniquement dans
    // le cookie httpOnly `auth_token` (ci-dessous), utilisé par le proxy `/api/proxy` et
    // les Server Actions. Un XSS ne peut donc plus voler le token via `document.cookie`.
    cookieStore.set(
      this.SESSION_COOKIE,
      JSON.stringify({
        user: userToStore,
        connectionId: authResponse.connectionId || existingSession?.connectionId,
        expiresAt: Date.now() + accessMaxAge * 1000
      }),
      {
        httpOnly: false, // Accessible côté client pour l'affichage (nom, rôle) — sans token
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: accessMaxAge,
        path: '/'
      }
    )

    // Cookie auth_token (HttpOnly pour sécurité)
    if (accessToken) {
      cookieStore.set(this.AUTH_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: accessMaxAge,
        path: '/'
      })
    }

    // Cookie refresh_token (HttpOnly pour sécurité)
    // Ne créer le cookie que si refreshToken existe et n'est pas vide
    // Vérifier aussi refresh_token (snake_case)
    const refreshToken = authResponse.refreshToken || (authResponse as any).refresh_token

    if (refreshToken && refreshToken.trim() !== '') {
      cookieStore.set(this.REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshMaxAge,
        path: '/'
      })
    }
  }

  /**
   * Supprime la session (déconnexion)
   */
  async destroySession(): Promise<void> {
    const cookieStore = await cookies()

    // Supprimer tous les cookies de session
    cookieStore.delete(this.SESSION_COOKIE)
    cookieStore.delete(this.AUTH_TOKEN_COOKIE)
    cookieStore.delete(this.REFRESH_TOKEN_COOKIE)
  }

  /**
   * Récupère le refresh token depuis les cookies
   */
  async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies()

    return cookieStore.get(this.REFRESH_TOKEN_COOKIE)?.value || null
  }

  /**
   * Rafraîchit la session en utilisant le refresh token
   */
  async refreshSession(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken()

    if (!refreshToken) {
      return false
    }

    try {
      const authResponse = await authService.refreshToken(refreshToken)

      if (authResponse) {
        await this.createSession(authResponse, true) // Conserver rememberMe

        return true
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error)

      // Si le refresh échoue, détruire la session
      await this.destroySession()
    }

    return false
  }

  /**
   * Vérifie si la session est expirée et la rafraîchit si nécessaire
   */
  async ensureValidSession(): Promise<Session | null> {
    const session = await this.getSession()

    if (!session) {
      return null
    }

    // On ne déconnecte QUE si la session est réellement expirée.
    // Le cas « proche de l'expiration » reste valide : le rafraîchissement se fait
    // automatiquement au prochain appel API (flux 401 → refresh_token httpOnly dans
    // api.client / api.server). Renvoyer `null` ici déconnectait l'utilisateur à la
    // simple navigation alors que son refresh_token est encore valide.
    if (session.expiresAt) {
      const isExpired = Date.now() > session.expiresAt

      return isExpired ? null : session
    }

    return session
  }
}

// Instance singleton
export const sessionService = new SessionService()
