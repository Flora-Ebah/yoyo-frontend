/**
 * Types TypeScript pour les événements Socket.IO
 */

export type SocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface SocketConfig {
  url: string
  options: {
    transports: string[]
    reconnection: boolean
    reconnectionAttempts: number
    reconnectionDelay: number
    reconnectionDelayMax: number
    timeout: number
    autoConnect?: boolean
  }
}

export interface SocketEventMap {

  // Événements système
  connect: () => void
  disconnect: (reason: string) => void
  error: (error: Error) => void
  reconnect: (attemptNumber: number) => void
  reconnect_error: (error: Error) => void
  reconnect_failed: () => void
  authenticated: (data: { success: boolean; room: string; userId: string; role?: string }) => void
  'auth:error': (error: { message: string }) => void
  connect_error: (error: Error) => void

  // Événements notifications
  'notification:new': (data: {
    title: string
    body: string
    category: string
    timestamp: string
    [key: string]: any
  }) => void

  'product:created': (data: { productId: string | null; name: string | null; status: string | null }) => void

  'product:updated': (data: { productId: string | null; name: string | null; status: string | null }) => void
}
