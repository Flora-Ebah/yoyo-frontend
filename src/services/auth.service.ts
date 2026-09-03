import { apiServer } from './api.server'

/**
 * Interface pour les credentials de connexion
 */
export interface LoginCredentials {
  login: string // Email, username ou contact
  password: string
  rememberMe?: boolean
}

/**
 * Interface pour les credentials de connexion admin
 */
export interface AdminLoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Interface pour les credentials de connexion Google
 */
export interface GoogleLoginCredentials {
  credential: string
  rememberMe?: boolean
}

/**
 * Interface pour la reponse d'authentification
 */
export interface AuthResponse {
  token?: string
  accessToken?: string
  refreshToken?: string
  refresh_token?: string
  role?: 'admin' | 'user' | 'provider'
  user: {
    _id: string
    email?: string
    username?: string
    firstname?: string
    lastname?: string
    role?: 'admin' | 'user' | 'provider'
    [key: string]: any
  }
  connectionId?: string
  expiresIn?: string
  refreshTokenExpiresIn?: string
}

/**
 * Service pour les operations d'authentification
 */
export class AuthService {
  private normalizeAuthResponse(payload: any, fallbackRole?: AuthResponse['role']): AuthResponse {
    const rawData =
      payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
        ? payload.data
        : payload

    const accessToken =
      rawData?.accessToken ||
      rawData?.token?.accessToken ||
      rawData?.token ||
      payload?.accessToken ||
      payload?.token?.accessToken ||
      payload?.token
    const refreshToken =
      rawData?.refreshToken ||
      rawData?.refresh_token ||
      rawData?.token?.refreshToken ||
      payload?.refreshToken ||
      payload?.refresh_token ||
      payload?.token?.refreshToken
    const connectionId = rawData?.connectionId || rawData?.loginId || payload?.connectionId || payload?.loginId

    const userFromPayload = rawData?.user || payload?.user || {}
    const inferredRole =
      userFromPayload?.role ||
      rawData?.role ||
      payload?.role ||
      (userFromPayload?.isAdmin || rawData?.isAdmin ? 'admin' : undefined) ||
      fallbackRole
    const normalizedUser = {
      ...userFromPayload,
      role: inferredRole
    }

    return {
      ...payload,
      ...rawData,
      token: accessToken,
      accessToken,
      refreshToken,
      connectionId,
      user: normalizedUser
    }
  }

  /**
   * Connexion utilisateur (client)
   * POST /client/login
   */
  async login(credentials: LoginCredentials, appCheckToken?: string | null): Promise<AuthResponse> {
    const response = await apiServer.post<any>(
      '/client/login',
      {
        login: credentials.login,
        password: credentials.password
      },
      appCheckToken ? { headers: { 'X-Firebase-AppCheck': appCheckToken } } : undefined
    )

    return this.normalizeAuthResponse(response, 'user')
  }

  /**
   * Connexion administrateur
   * POST /admin/login
   */
  async loginAdmin(credentials: AdminLoginCredentials, appCheckToken?: string | null): Promise<AuthResponse> {
    const response = await apiServer.post<any>(
      '/admin/login',
      {
        email: credentials.email,
        password: credentials.password
      },
      appCheckToken ? { headers: { 'X-Firebase-AppCheck': appCheckToken } } : undefined
    )

    return this.normalizeAuthResponse(response, 'admin')
  }

  /**
   * Connexion Google non exposee sur l'API YoYo actuelle
   */
  async loginGoogle(_credentials: GoogleLoginCredentials): Promise<AuthResponse> {
    throw new Error('Connexion Google non disponible sur cette API')
  }

  /**
   * Deconnexion
   * POST /client/logout
   */
  async logout(connectionId?: string): Promise<void> {
    if (!connectionId) {
      return
    }

    await apiServer.post('/client/logout', { loginId: connectionId })
  }

  /**
   * Renouvelle un access token
   * GET /refresh-token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiServer.get<any>('/refresh-token', {
      skipAuth: true,
      skipRefresh: true,
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    })

    return this.normalizeAuthResponse(response)
  }

  /**
   * Verification simple d'un token via le endpoint refresh
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const response = await this.refreshToken(token)

      return {
        valid: !!response.token,
        user: response.user
      }
    } catch {
      return { valid: false }
    }
  }
}

// Instance pour les Server Actions (utilise apiServer)
export const authService = new AuthService()
