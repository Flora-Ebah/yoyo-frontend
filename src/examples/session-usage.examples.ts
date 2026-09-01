/**
 * Exemples d'utilisation de la gestion de session
 * 
 * Ce fichier contient des exemples de code pour utiliser les différents
 * composants de gestion de session. Il n'est pas importé dans l'application.
 */

// ============================================
// EXEMPLE 1: Server Action pour la connexion
// ============================================
/*
'use server'

import { loginAction } from '@/app/actions/auth.actions'

export async function handleLogin(formData: FormData) {
  const result = await loginAction({
    login: formData.get('email') as string,
    password: formData.get('password') as string,
    rememberMe: formData.get('rememberMe') === 'on'
  })

  if (result.success) {
    // Rediriger vers le dashboard
    redirect('/home')
  } else {
    // Retourner l'erreur
    return { error: result.error }
  }
}
*/

// ============================================
// EXEMPLE 2: Server Component avec protection
// ============================================
/*
import { requireAuth } from '@/utils/session.server'

export default async function ProtectedPage() {
  // Cette fonction redirige automatiquement vers /login si non authentifié
  const session = await requireAuth()

  return (
    <div>
      <h1>Page protégée</h1>
      <p>Bonjour {session.user.username}</p>
    </div>
  )
}
*/

// ============================================
// EXEMPLE 3: Server Component avec vérification admin
// ============================================
/*
import { requireAdmin } from '@/utils/session.server'

export default async function AdminPage() {
  // Cette fonction redirige vers /home si l'utilisateur n'est pas admin
  const session = await requireAdmin()

  return (
    <div>
      <h1>Page Admin</h1>
      <p>Administrateur: {session.user.username}</p>
    </div>
  )
}
*/

// ============================================
// EXEMPLE 4: Client Component avec useSession
// ============================================
/*
'use client'

import { useSession } from '@/hooks/useSession'
import { logoutAction } from '@/app/actions/auth.actions'

export function UserProfile() {
  const { session, isLoading, isAuthenticated, isAdmin } = useSession()

  if (isLoading) {
    return <div>Chargement...</div>
  }

  if (!isAuthenticated) {
    return <div>Non connecté</div>
  }

  const handleLogout = async () => {
    await logoutAction()
  }

  return (
    <div>
      <h1>Profil</h1>
      <p>Nom: {session?.user.username}</p>
      <p>Email: {session?.user.email}</p>
      <p>Rôle: {session?.user.role}</p>
      {isAdmin() && <p>Vous êtes administrateur</p>}
      <button onClick={handleLogout}>Déconnexion</button>
    </div>
  )
}
*/

// ============================================
// EXEMPLE 5: Vérification conditionnelle dans Server Component
// ============================================
/*
import { isAuthenticated, hasRole } from '@/utils/session.server'

export default async function ConditionalPage() {
  const authenticated = await isAuthenticated()
  const isUserAdmin = await hasRole('admin')

  if (!authenticated) {
    return <div>Veuillez vous connecter</div>
  }

  return (
    <div>
      <h1>Contenu protégé</h1>
      {isUserAdmin && (
        <div>
          <h2>Section Admin</h2>
          <p>Contenu réservé aux administrateurs</p>
        </div>
      )}
    </div>
  )
}
*/

// ============================================
// EXEMPLE 6: Formulaire de connexion avec Server Action
// ============================================
/*
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth.actions'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAction({
      login: formData.get('login') as string,
      password: formData.get('password') as string,
      rememberMe: formData.get('rememberMe') === 'on'
    })

    if (result.success) {
      router.push('/home')
      router.refresh()
    } else {
      setError(result.error || 'Erreur de connexion')
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="login" type="text" placeholder="Email ou nom d'utilisateur" required />
      <input name="password" type="password" placeholder="Mot de passe" required />
      <label>
        <input name="rememberMe" type="checkbox" />
        Se souvenir de moi
      </label>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
*/

