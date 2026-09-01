'use client'

import { useState, useEffect } from 'react'
import { checkSessionAction } from '@/app/actions/auth.actions'
import type { Session } from '@/services/session.service'

/**
 * Hook React pour accéder à la session côté client
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { session, isLoading, isAuthenticated } = useSession()
 *   
 *   if (isLoading) return <div>Chargement...</div>
 *   if (!isAuthenticated) return <div>Non connecté</div>
 *   
 *   return <div>Bonjour {session?.user.username}</div>
 * }
 * ```
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function loadSession() {
      try {
        const result = await checkSessionAction()

        if (result.isAuthenticated && result.user) {
          setSession({
            user: result.user,
            isAuthenticated: true
          })
          setIsAuthenticated(true)
        } else {
          setSession(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la session:', error)
        setSession(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  /**
   * Rafraîchit la session
   */
  const refresh = async () => {
    setIsLoading(true)
    try {
      const result = await checkSessionAction()

      if (result.isAuthenticated && result.user) {
        setSession({
          user: result.user,
          isAuthenticated: true
        })
        setIsAuthenticated(true)
      } else {
        setSession(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error)
      setSession(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  const hasRole = (role: string): boolean => {
    return session?.user.role === role
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  return {
    session,
    isLoading,
    isAuthenticated,
    refresh,
    hasRole,
    isAdmin
  }
}

