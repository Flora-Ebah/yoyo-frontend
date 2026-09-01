'use client'

// React Imports
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'

// Service Imports
import socketService from '@/services/socketService'

// Hook Imports
import { useSession } from '@/hooks/useSession'

// Type Imports
import type { SocketConnectionStatus } from '@/types/socket'

interface SocketContextType {
  socket: ReturnType<typeof socketService.getSocket>
  isConnected: boolean
  status: SocketConnectionStatus
  emit: <T = unknown>(event: string, data?: T) => void
  on: <T = unknown>(event: string, callback: (data: T) => void) => void
  off: <T = unknown>(event: string, callback?: (data: T) => void) => void
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { session, isAuthenticated } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState<SocketConnectionStatus>('disconnected')
  const hasConnectedRef = useRef(false)

  // Connexion automatique quand l'utilisateur est authentifié
  useEffect(() => {
    if (!isAuthenticated || !session?.user) {
      // Déconnecter si l'utilisateur se déconnecte
      if (hasConnectedRef.current) {
        socketService.disconnect()
        hasConnectedRef.current = false
        setIsConnected(false)
        setStatus('disconnected')
      }

      return
    }

    // Récupérer le token depuis le cookie ou localStorage
    const getToken = (): string | null => {
      if (typeof window === 'undefined') return null

      // Essayer de récupérer depuis le cookie user
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('user='))

      if (userCookie) {
        try {
          const cookieValue = decodeURIComponent(userCookie.split('=')[1])
          const sessionData = JSON.parse(cookieValue)

          if (sessionData.token) {
            return sessionData.token
          }
        } catch {
          // Erreur de parsing, continuer avec localStorage
        }
      }

      // Fallback : localStorage
      return localStorage.getItem('auth_token')
    }

    const token = getToken()
    const userId = session.user._id || session.user.id

    // Vérifier si Socket.IO est désactivé
    if (process.env.NEXT_PUBLIC_SOCKET_ENABLED === 'false') {
      return
    }

    // Vérifier que nous sommes dans un environnement navigateur
    if (typeof window === 'undefined') {
      return
    }

    // Vérifier que l'URL Socket.IO est configurée
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || ''
    if (!socketUrl || socketUrl.trim() === '') {
      // Pas d'URL configurée, ne pas essayer de se connecter
      return
    }

    if (token && userId && !hasConnectedRef.current) {
      try {
        console.log('🔌 Connexion Socket.IO...')
        socketService.connect(token)
        hasConnectedRef.current = true

        // Écouter les changements de statut
        const unsubscribe = socketService.onStatusChange((newStatus) => {
          setStatus(newStatus)
          const connected = newStatus === 'connected'

          setIsConnected(connected)

          // Authentifier et rejoindre la room utilisateur une fois connecté
          if (connected && userId) {
            // Envoyer le token avec le userId pour une meilleure sécurité
            socketService.authenticate(String(userId), token || undefined)
          }
        })

        return () => {
          unsubscribe()
        }
      } catch (error) {
        // Erreur silencieuse si la connexion échoue (serveur peut être indisponible)
        console.warn('⚠️ Impossible de se connecter à Socket.IO:', error)
        hasConnectedRef.current = false
      }
    }
  }, [isAuthenticated, session])

  // Nettoyer à la déconnexion
  useEffect(() => {
    return () => {
      if (hasConnectedRef.current) {
        socketService.disconnect()
        hasConnectedRef.current = false
      }
    }
  }, [])

  // Méthodes wrapper
  const emit = useCallback(<T = unknown,>(event: string, data?: T) => {
    socketService.emit(event, data)
  }, [])

  const on = useCallback(<T = unknown,>(event: string, callback: (data: T) => void) => {
    socketService.on(event, callback)
  }, [])

  const off = useCallback(<T = unknown,>(event: string, callback?: (data: T) => void) => {
    socketService.off(event, callback)
  }, [])

  const value: SocketContextType = {
    socket: socketService.getSocket(),
    isConnected,
    status,
    emit,
    on,
    off,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket(): SocketContextType {
  const context = useContext(SocketContext)

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }

  return context
}

