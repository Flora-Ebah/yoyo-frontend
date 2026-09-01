import { cookies } from 'next/headers'

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_VERSION = process.env.API_VERSION || process.env.NEXT_PUBLIC_API_VERSION || 'v1'
const API_PATH = process.env.API_PATH || process.env.NEXT_PUBLIC_API_PATH || ''

// Construire le chemin de base : /coddyger-pentest/v1 ou /v1
// S'assurer que le chemin commence toujours par /
const API_BASE_PATH = API_PATH
  ? `/${API_VERSION}/${API_PATH.replace(/^\/+|\/+$/g, '')}`.replace(/\/+/g, '/')
  : `/${API_VERSION}`

// Utiliser une variable d'environnement serveur (sans NEXT_PUBLIC_)
// Fallback sur NEXT_PUBLIC_API_KEY pour la compatibilité
const API_KEY = process.env.API_KEY || process.env.PUBLIC_API_KEY || process.env.NEXT_PUBLIC_API_KEY

// Log de la configuration en développement
if (process.env.NODE_ENV === 'development') {
  console.log('[API Config]', {
    API_BASE_URL,
    API_PATH,
    API_VERSION,
    API_BASE_PATH,
    fullURL: `${API_BASE_URL}${API_BASE_PATH}`
  })
}

/**
 * Service API pour les Server Components et Server Actions
 * Utilise les cookies pour l'authentification au lieu de localStorage
 */
export class ApiServerService {
  private readonly baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL + API_BASE_PATH

    // Log pour déboguer en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('[API Server] Base URL:', this.baseURL)
    }
  }

  /**
   * Récupère le token d'authentification depuis les cookies
   */
  private async getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies()

    return cookieStore.get('auth_token')?.value || null
  }

  /**
   * Récupère le token public depuis les cookies ou le génère
   */
  public async getPublicToken(): Promise<string | null> {
    const cookieStore = await cookies()
    const publicToken = cookieStore.get('public_token')?.value
    const publicTokenExpiry = cookieStore.get('public_token_expiry')?.value

    // Vérifier si le token public existe et n'est pas expiré
    if (publicToken && publicTokenExpiry) {
      const expiry = parseInt(publicTokenExpiry, 10)

      if (Date.now() < expiry) {
        return publicToken
      }
    }

    // Générer un nouveau token public si nécessaire
    if (!API_KEY) {
      return null
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_BASE_PATH}/get-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({ apikey: API_KEY })
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      const token = typeof data?.data === 'string' ? data.data : data?.data?.token || data?.token

      if (token) {
        // Note: Le stockage dans les cookies doit être fait par le middleware ou une Server Action
        // car on ne peut pas modifier les cookies directement depuis un service serveur
        // Le token est retourné pour être utilisé dans les headers de la requête actuelle
        return token
      }
    } catch (error) {
      console.error('Erreur lors de la génération du token public:', error)
    }

    return null
  }

  /**
   * Construit les headers pour une requête
   */
  private async buildHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    if (includeAuth) {
      // Ajouter le token d'authentification si disponible
      const authToken = await this.getAuthToken()

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      } else {
        // Sinon, utiliser le token public
        const publicToken = await this.getPublicToken()

        if (publicToken) {
          headers['Authorization'] = `Bearer ${publicToken}`
        }
      }
    }

    // Ajouter la clé API si disponible
    if (API_KEY) {
      headers['x-api-key'] = API_KEY
    }

    return headers
  }

  /**
   * Construit l'URL complète d'un endpoint
   */
  private getEndpointUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

    return `${this.baseURL}${cleanEndpoint}`
  }

  /**
   * Gère les erreurs de réponse
   */
  private async handleError(response: Response, endpoint?: string): Promise<never> {
    let error: any

    try {
      error = await response.json()
    } catch {
      error = { message: `Erreur ${response.status}` }
    }

    // Log pour déboguer
    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${endpoint || 'Unknown'}:`, {
        status: response.status,
        statusText: response.statusText,
        error: error.message || error
      })
    }

    // Si 401 (Unauthorized), détruire la session et forcer la déconnexion
    if (response.status === 401) {
      try {
        const { sessionService } = await import('./session.service')

        await sessionService.destroySession()
      } catch (sessionError) {
        console.error('Erreur lors de la destruction de la session:', sessionError)
      }
    }

    const apiError = {
      message: error.message || `Erreur ${response.status}`,
      error: error.error,
      details: error.details,
      statusCode: response.status,
      isUnauthorized: response.status === 401
    }

    throw apiError
  }

  /**
   * Effectue une requête GET
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }
  ): Promise<T> {
    const headers = await this.buildHeaders(!options?.skipAuth)
    const url = this.getEndpointUrl(endpoint)

    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...headers,
        ...options?.headers
      },
      ...options
    }

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body)
    }

    let response = await fetch(url, fetchOptions)

    if (response.status === 401 && !options?.skipAuth && !options?.skipRefresh) {
      const shouldAttemptRefresh = !endpoint.includes('/login/refresh-token')

      if (shouldAttemptRefresh) {
        try {
          const { sessionService } = await import('./session.service')
          const refreshed = await sessionService.refreshSession()

          if (refreshed) {
            const refreshedHeaders = await this.buildHeaders(true)

            response = await fetch(url, {
              ...fetchOptions,
              headers: {
                ...refreshedHeaders,
                ...options?.headers
              }
            })
          }
        } catch {}
      }
    }

    if (!response.ok) {
      await this.handleError(response, endpoint)
    }

    if (response.status === 204) {
      return {} as T
    }

    const data = await response.json()

    return (data.data !== undefined && !data.pagination ? data.data : data) as T
  }

  async get<T = unknown>(endpoint: string, options?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  /**
   * Vérifie de façon AUTORITAIRE que le token httpOnly courant appartient bien à un
   * compte admin, en interrogeant `GET /admin/me` (le backend valide le Bearer).
   *
   * Ne se fie PAS au cookie `user` (éditable côté client). N'a AUCUN effet de bord
   * (pas de refresh ni de destruction de session) — utilisable pendant le rendu d'un
   * Server Component.
   *
   * - 'ok'        : token valide sur un compte admin.
   * - 'forbidden' : token absent / rejeté (401/403) → pas admin.
   * - 'unknown'   : backend injoignable (réseau/5xx) → l'appelant peut faire un repli dégradé.
   */
  async verifyAdmin(): Promise<'ok' | 'forbidden' | 'unknown'> {
    const token = await this.getAuthToken()

    if (!token) return 'forbidden'

    try {
      const res = await fetch(this.getEndpointUrl('/admin/me'), {
        method: 'GET',
        headers: await this.buildHeaders(true),
        cache: 'no-store'
      })

      if (res.ok) return 'ok'
      if (res.status === 401 || res.status === 403) return 'forbidden'

      return 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * Récupère les abilities RBAC de l'admin connecté (source autoritaire : backend).
   * Retourne null si indéterminable (pas de token, panne réseau, réponse inattendue),
   * pour que l'appelant puisse choisir un repli sûr.
   */
  async getAbilities(): Promise<Array<{ action: string; subject: string }> | null> {
    const token = await this.getAuthToken()

    if (!token) return null

    try {
      const res = await fetch(this.getEndpointUrl('/admin/me'), {
        method: 'GET',
        headers: await this.buildHeaders(true),
        cache: 'no-store'
      })

      if (!res.ok) return null

      const body = await res.json()

      // L'enveloppe backend place la charge utile dans `data` ; `message` est souvent
      // juste un statut ("OK"). On privilégie donc `data`, puis un `message` objet.
      const data =
        body?.data ?? (body?.message && typeof body.message === 'object' ? body.message : null) ?? body
      const profile = data?.profile ?? data

      const ability = profile && typeof profile === 'object' ? profile.ability : null

      return Array.isArray(ability) ? ability : []
    } catch {
      return null
    }
  }

  /**
   * Effectue une requête POST
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }
  ): Promise<T> {
    return this.request<T>('POST', endpoint, body, options)
  }

  /**
   * Effectue une requête PUT
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, body, options)
  }

  /**
   * Effectue une requête PATCH
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, body, options)
  }

  /**
   * Effectue une requête DELETE
   */
  async delete<T = unknown>(
    endpoint: string,
    options?: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean }
  ): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options)
  }
}

// Instance singleton pour les Server Components
export const apiServer = new ApiServerService()
