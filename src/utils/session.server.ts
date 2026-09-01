import 'server-only'

import { sessionService, type Session } from '@/services/session.service'

/**
 * Utilitaires serveur pour la gestion de session
 * À utiliser dans les Server Components et Server Actions
 */

/**
 * Récupère la session actuelle
 * @returns La session utilisateur ou null si non authentifié
 */
export async function getSession(): Promise<Session | null> {
  return sessionService.getSession()
}

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns true si l'utilisateur est authentifié, false sinon
 */
export async function isAuthenticated(): Promise<boolean> {
  return sessionService.isAuthenticated()
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 * @param role Le rôle à vérifier
 * @returns true si l'utilisateur a le rôle, false sinon
 */
export async function hasRole(role: string): Promise<boolean> {
  return sessionService.hasRole(role)
}

/**
 * Vérifie si l'utilisateur est administrateur
 * @returns true si l'utilisateur est admin, false sinon
 */
export async function isAdmin(): Promise<boolean> {
  return sessionService.isAdmin()
}

/**
 * Récupère la session et la rafraîchit si nécessaire
 * @returns La session valide ou null
 */
export async function getValidSession(): Promise<Session | null> {
  return sessionService.ensureValidSession()
}

/**
 * Requiert une authentification, redirige vers login si non authentifié
 * @returns La session utilisateur
 * @throws Redirige vers /login si non authentifié
 */
export async function requireAuth(): Promise<Session> {
  const session = await getValidSession()

  if (!session) {
    // Utiliser redirect de Next.js (sera géré par le middleware)
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }

  return session as Session
}

/**
 * Requiert le rôle admin, redirige si non admin
 * @returns La session utilisateur admin
 * @throws Redirige vers /home si non admin
 */
export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()

  if (session.user.role !== 'admin') {
    const { redirect } = await import('next/navigation')
    redirect('/home')
  }

  return session as Session
}


