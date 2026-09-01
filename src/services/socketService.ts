/**
 * Service de gestion des connexions Socket.IO
 * Gère la connexion, l'authentification et les événements Socket.IO
 */

import { io, Socket } from 'socket.io-client'
import { SocketConfig, SocketConnectionStatus } from '@/types/socket'
import { API } from '@/configs/constants'

class SocketService {
  private socket: Socket | null = null
  private config: SocketConfig
  private token?: string
  private status: SocketConnectionStatus = 'disconnected'
  private statusListeners: Set<(status: SocketConnectionStatus) => void> = new Set()
  private pendingHandlers: Map<string, Array<(data: unknown) => void>> = new Map()

  constructor() {
    // Vérifier si Socket.IO est désactivé
    const socketEnabled = process.env.NEXT_PUBLIC_SOCKET_ENABLED !== 'false'
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (socketEnabled ? API.baseUrl : '') || ''

    this.config = {
      url: socketUrl,
      options: {
        transports: ['websocket', 'polling'],
        reconnection: socketEnabled,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true, // Ne pas se connecter automatiquement
      },
    }
  }

  /**
   * Connexion au serveur Socket.IO
   * @param token Token JWT pour l'authentification
   */
  connect(token?: string): void {
    // Vérifier si Socket.IO est désactivé
    if (process.env.NEXT_PUBLIC_SOCKET_ENABLED === 'false') {
      console.log('ℹ️ Socket.IO est désactivé')
      return
    }

    // Vérifier si l'URL est valide
    if (!this.config.url || this.config.url.trim() === '') {
      console.warn('⚠️ URL Socket.IO non configurée, connexion annulée')
      this.updateStatus('error')
      return
    }

    // Vérifier si on est dans un environnement navigateur
    if (typeof window === 'undefined') {
      return
    }

    if (this.socket?.connected) {
      console.log('Socket déjà connecté')
      return
    }

    if (this.socket) {
      this.disconnect()
    }

    if (token) {
      this.token = token
    }

    try {
      const auth = token ? { token } : undefined

      this.socket = io(this.config.url, {
        ...this.config.options,
        auth,
      })

      this.setupEventHandlers()
      this.updateStatus('connecting')
    } catch (error) {
      // Erreur silencieuse - le serveur Socket.IO peut ne pas être disponible
      console.warn('⚠️ Erreur lors de l\'initialisation de Socket.IO (serveur peut être indisponible):', error)
      this.updateStatus('error')
    }
  }

  /**
   * Configuration des handlers d'événements Socket.IO
   */
  private setupEventHandlers(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connecté')
      this.updateStatus('connected')

      // Enregistrer les handlers en attente
      if (this.pendingHandlers.size > 0) {
        console.log(`📋 Application de ${this.pendingHandlers.size} handlers en attente`)
        this.pendingHandlers.forEach((callbacks, event) => {
          console.log(`📋 Application de ${callbacks.length} handler(s) pour l'événement "${event}"`)
          callbacks.forEach(callback => {
            this.socket?.on(event, callback)
            console.log(`✅ Handler "${event}" enregistré après connexion`)
          })
        })
        this.pendingHandlers.clear()
      }
    })

    this.socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket.IO déconnecté:', reason)
      this.updateStatus('disconnected')
    })

    this.socket.on('connect_error', (error: Error) => {
      // Ne pas logger les erreurs de connexion comme des erreurs critiques
      // Cela peut arriver si le serveur Socket.IO n'est pas disponible
      console.warn('⚠️ Erreur de connexion Socket.IO (serveur peut être indisponible):', error.message)
      this.updateStatus('error')
    })

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`🔄 Socket.IO reconnecté après ${attemptNumber} tentatives`)
      this.updateStatus('connected')
    })

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`🔄 Tentative de reconnexion ${attemptNumber}`)
      this.updateStatus('connecting')
    })

    this.socket.on('reconnect_error', (error: Error) => {
      console.error('❌ Erreur de reconnexion Socket.IO:', error)
      this.updateStatus('error')
    })

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Échec de la reconnexion Socket.IO')
      this.updateStatus('error')
    })

    // Écouter les erreurs d'authentification
    const handleAuthError = (error: { message: string }) => {
      console.error('❌ Erreur d\'authentification Socket.IO:', error)
      // Ne pas déconnecter automatiquement, laisser l'utilisateur réessayer
    }

    this.socket.on('auth:error', handleAuthError)
    this.socket.on('authentication-error', handleAuthError)
  }

  /**
   * Déconnexion du serveur Socket.IO
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.updateStatus('disconnected')
    }
  }

  /**
   * Émettre un événement vers le serveur
   * @param event Nom de l'événement
   * @param data Données à envoyer
   */
  emit<T = unknown>(event: string, data?: T): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Tentative d\'émission sur socket non connecté:', event)
      return
    }

    this.socket.emit(event, data)
  }

  /**
   * Écouter un événement du serveur
   * @param event Nom de l'événement
   * @param callback Fonction de callback
   */
  on<T = unknown>(event: string, callback: (data: T) => void): void {
    if (!this.socket || !this.socket.connected) {
      console.log(`📋 Handler "${event}" mis en file d'attente (socket non connecté)`)
      // Mettre en file d'attente pour enregistrement après connexion
      if (!this.pendingHandlers.has(event)) {
        this.pendingHandlers.set(event, [])
      }
      this.pendingHandlers.get(event)?.push(callback as (data: unknown) => void)
      return
    }

    console.log(`📡 Enregistrement du handler pour l'événement "${event}"`)
    this.socket.on(event, callback)
    console.log(`✅ Handler "${event}" enregistré avec succès`)
  }

  /**
   * Arrêter d'écouter un événement
   * @param event Nom de l'événement
   * @param callback Fonction de callback (optionnelle)
   */
  off<T = unknown>(event: string, callback?: (data: T) => void): void {
    if (!this.socket) {
      return
    }

    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  /**
   * Obtenir le statut de la connexion
   */
  getStatus(): SocketConnectionStatus {
    return this.status
  }

  /**
   * Vérifier si le socket est connecté
   */
  isConnected(): boolean {
    return this.socket?.connected === true
  }

  /**
   * Obtenir l'instance du socket (pour usage avancé)
   */
  getSocket(): Socket | null {
    return this.socket
  }

  /**
   * S'abonner aux changements de statut
   * @param listener Fonction appelée lors des changements de statut
   * @returns Fonction pour se désabonner
   */
  onStatusChange(listener: (status: SocketConnectionStatus) => void): () => void {
    this.statusListeners.add(listener)
    // Notifier immédiatement du statut actuel
    listener(this.status)

    return () => {
      this.statusListeners.delete(listener)
    }
  }

  /**
   * Mettre à jour le statut et notifier les listeners
   */
  private updateStatus(status: SocketConnectionStatus): void {
    if (this.status !== status) {
      this.status = status
      this.statusListeners.forEach(listener => listener(status))
    }
  }

  /**
   * Reconnecter avec un nouveau token
   * @param token Nouveau token JWT
   */
  reconnectWithToken(token: string): void {
    this.disconnect()
    this.connect(token)
  }

  /**
   * Authentifier le socket et rejoindre la room de l'utilisateur
   * @param userId ID de l'utilisateur
   * @param token Token JWT optionnel (recommandé pour la sécurité)
   */
  authenticate(userId: string, token?: string): void {
    if (!this.socket?.connected) {
      console.warn('⚠️ Tentative d\'authentification sur socket non connecté')
      return
    }

    if (!userId) {
      console.warn('⚠️ userId requis pour l\'authentification socket')
      return
    }

    // Vérifier si déjà authentifié pour éviter les appels multiples
    if ((this.socket as any).authenticated) {
      console.log('✅ Socket déjà authentifié')
      return
    }

    console.log(`[SocketService] Authentification avec userId: ${userId}`, token ? '(avec token)' : '(sans token)')

    // Écouter la confirmation d'authentification (une seule fois)
    const handleAuthenticated = (data: { room: string; userId: string; role?: string }) => {
      console.log(`✅ Socket authentifié et rejoint la room: ${data.room}`, { userId: data.userId, role: data.role })
      ;(this.socket as any).authenticated = true
    }

    // Écouter les erreurs d'authentification (une seule fois)
    const handleAuthError = (error: { message: string }) => {
      console.error('❌ Erreur d\'authentification socket:', error.message)
      ;(this.socket as any).authenticated = false
    }

    this.socket.once('authenticated', handleAuthenticated)
    this.socket.once('auth:error', handleAuthError)
    this.socket.once('authentication-error', handleAuthError)

    // Envoyer la requête d'authentification avec token si disponible
    this.socket.emit('authenticate', token ? { userId, token } : { userId })
  }
}

// Instance singleton
const socketService = new SocketService()
export default socketService
