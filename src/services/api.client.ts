'use client'

import { toast } from 'react-toastify'

type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean
  rawResponse?: boolean
}

/**
 * Service API pour les Client Components
 * Utilise localStorage pour l'authentification
 */
export class ApiClientService {
  private readonly baseURL: string
  private isRefreshing = false
  private failedQueue: {
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }[] = []

  constructor() {
    // SÉCURITÉ (#1) : on ne tape plus le backend directement depuis le navigateur.
    // Toutes les requêtes passent par le proxy same-origin `/api/proxy`, qui injecte
    // le Bearer depuis le cookie httpOnly côté serveur. Le token ne transite jamais par le JS.
    this.baseURL = '/api/proxy'
  }

  /**
   * Récupère le token d'authentification depuis localStorage
   * @deprecated L'authentification utilise désormais des cookies HttpOnly
   */
  private getAuthToken(): string | null {
    // On garde cette méthode au cas où un token serait stocké manuellement,
    // mais pour l'authentification principale, c'est le cookie qui prime.
    if (typeof window === 'undefined') {
      return null
    }

    return localStorage.getItem('auth_token')
  }

  /**
   * Vérifie si l'utilisateur est vraiment authentifié
   */
  private isUserAuthenticated(): boolean {
    if (typeof window === 'undefined') return false

    // Vérifier si un token est dans localStorage
    const localToken = this.getAuthToken()

    if (localToken) {
      return true
    }

    // Vérifier si une session cookie existe et contient un token valide
    const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='))

    if (userCookie) {
      try {
        const cookieValue = decodeURIComponent(userCookie.split('=')[1])
        const sessionData = JSON.parse(cookieValue)

        // Si le token est présent dans le cookie user, l'utilisateur est authentifié
        if (sessionData && sessionData.token) {
          return true
        }
      } catch {
        // Erreur de parsing, cookie invalide
        return false
      }
    }

    return false
  }


  /**
   * Construit les headers pour une requête.
   *
   * SÉCURITÉ (#1) : plus aucun token ni clé API côté client. L'authentification est
   * ajoutée par le proxy `/api/proxy` (cookie httpOnly). Pour un appel public
   * (skipAuth), on le signale au proxy via l'en-tête `x-proxy-skip-auth`.
   */
  private async buildHeaders(includeAuth: boolean = true, endpoint?: string): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (!includeAuth) {
      headers['x-proxy-skip-auth'] = '1'
    }

    // Firebase App Check — atteste l'origine (le navigateur), indépendamment de l'authentification.
    // Import dynamique : évite d'entraîner le SDK Firebase dans un bundle serveur. Le proxy
    // `/api/proxy` relaie ensuite l'en-tête `X-Firebase-AppCheck` vers le backend.
    try {
      const { getAppCheckToken, getLimitedUseAppCheckToken, requiresLimitedUseToken } = await import('@/libs/appCheck')
      const appCheckToken = requiresLimitedUseToken(endpoint) ? await getLimitedUseAppCheckToken() : await getAppCheckToken()

      if (appCheckToken) {
        headers['X-Firebase-AppCheck'] = appCheckToken
      }
    } catch {
      // Attestation indisponible : la requête part sans en-tête (le backend est en observation).
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
   * Traite la file d'attente des requêtes en attente de rafraîchissement
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve(token)
      }
    })

    this.failedQueue = []
  }

  /**
   * Tente de rafraîchir le token en cas d'erreur 401
   */
  private async handle401(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      })
    }

    this.isRefreshing = true

    try {
      const { refreshSessionAction } = await import('@/app/actions/auth.actions')
      const result = await refreshSessionAction()

      if (result.success && result.token) {
        this.processQueue(null, result.token)
        toast.success('Session prolongée avec succès')
        return result.token
      } else {
        throw new Error(result.error || 'Échec du rafraîchissement de la session')
      }
    } catch (error) {
      this.processQueue(error, null)
      throw error
    } finally {
      this.isRefreshing = false
    }
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
      console.error(`[API Client Error] ${endpoint || 'Unknown'}:`, {
        status: response.status,
        statusText: response.statusText,
        error: error.message || error
      })
    }

    // Si 401 (Unauthorized), déclencher la déconnexion automatique
    if (response.status === 401) {
      try {
        // Nettoyer le localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }

        // Appeler l'action de déconnexion (sans redirection pour éviter les conflits)
        const { logoutActionWithoutRedirect } = await import('@/app/actions/auth.actions')

        await logoutActionWithoutRedirect()

        // Rediriger vers la page de login après un court délai
        if (typeof window !== 'undefined') {
          const { ROUTES } = await import('@/configs/constants')
          const currentPath = window.location.pathname
          const loginPath = ROUTES.auth.login
          const redirectUrl =

            currentPath !== loginPath ? `${loginPath}?redirect=${encodeURIComponent(currentPath)}` : loginPath

          // Utiliser setTimeout pour éviter les problèmes de navigation pendant le traitement
          setTimeout(() => {
            window.location.href = redirectUrl
          }, 100)
        }
      } catch (logoutError) {
        console.error('Erreur lors de la déconnexion automatique:', logoutError)
        // Même en cas d'erreur, rediriger vers login


        if (typeof window !== 'undefined') {
          const { ROUTES } = await import('@/configs/constants')

          window.location.href = ROUTES.auth.login
        }
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
   * Méthode générique pour effectuer une requête avec gestion du rafraîchissement de token
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    try {
      const headers = await this.buildHeaders(!options?.skipAuth, endpoint)
      const url = this.getEndpointUrl(endpoint)
      const { skipAuth: _skipAuth, rawResponse, ...restOptions } = options || {}

      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...headers,
          ...restOptions.headers
        },
        ...restOptions
      }

      if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body)
      }

      // Le refresh 401 est géré côté serveur par le proxy (`/api/proxy`).
      // Un 401 qui parvient ici signifie que le refresh a échoué → handleError déconnecte.
      const response = await fetch(url, fetchOptions)

      if (!response.ok) {
        await this.handleError(response, endpoint)
      }

      // Gestion des réponses vides (204 No Content)
      if (response.status === 204) {
        return {} as T
      }

      const data = await response.json()

      if (rawResponse) {
        return data as T
      }

      return (data.data !== undefined && !data.pagination ? data.data : data) as T
    } catch (error: any) {
      // Gérer les erreurs réseau (CORS, timeout, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error(
          `Erreur réseau: Impossible de se connecter au serveur. Vérifiez votre connexion et que l'API est accessible à ${this.baseURL}`
        )

        networkError.name = 'NetworkError'

        throw networkError
      }

      throw error
    }
  }

  /**
   * Effectue une requête GET
   */
  async get<T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  /**
   * Effectue une requête POST
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>('POST', endpoint, body, options)
  }

  /**
   * Effectue une requête PUT
   */
  async put<T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, body, options)
  }

  /**
   * Effectue une requête PATCH
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, body, options)
  }

  /**
   * Effectue une requête DELETE
   */
  async delete<T = unknown>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options)
  }
}

// Instance singleton pour les Client Components
export const apiClient = new ApiClientService()
