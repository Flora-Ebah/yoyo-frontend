import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Routes publiques (accessibles sans authentification)
 */
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/events',
  '/zones' // Routes de zone publiques (/zones/[slug], /zones/[slug]/events)
]

/**
 * Routes protégées (nécessitent une authentification)
 */
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/pros',
  '/transactions',
  '/moderation',
  '/notifications',
  '/faq',
  '/admins',
  '/account-settings',
  '/admin',
  '/modules',
  '/settings',
  '/user/profile',
  '/user',
  '/creator',
  '/commercial',
  '/enrolments'
]

/**
 * Routes admin (nécessitent le rôle admin)
 */
const adminRoutes = ['/dashboard', '/clients', '/pros', '/transactions', '/moderation', '/notifications', '/admins', '/faq', '/commercial', '/enrolments']

/**
 * Middleware Next.js pour la gestion de session et protection des routes
 * Renommé en proxy pour Next.js 16+
 */
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Vérifier si la route est publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Vérifier si la route est protégée
  // Les routes /zones/[slug] et /zones/[slug]/events sont publiques (déjà dans publicRoutes)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Vérifier si la route nécessite le rôle admin
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Récupérer les cookies
  const sessionCookie = request.cookies.get('user')
  const authTokenCookie = request.cookies.get('auth_token')
  const refreshTokenCookie = request.cookies.get('refresh_token')

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!(sessionCookie && authTokenCookie)
  const hasRefreshToken = !!refreshTokenCookie

  // Si l'utilisateur est sur /login et est déjà authentifié
  // NE PAS rediriger si c'est une erreur unauthorized (pour éviter la boucle)
  if (pathname === '/login' && isAuthenticated) {
    const hasUnauthorizedError = searchParams.get('error') === 'unauthorized'

    if (!hasUnauthorizedError) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }


    // Si erreur unauthorized, supprimer les cookies et laisser la page login s'afficher
    const response = NextResponse.next()

    response.cookies.delete('user')
    response.cookies.delete('auth_token')
    response.cookies.delete('refresh_token')

return response
  }

  // Si l'utilisateur essaie d'accéder à une route protégée sans être authentifié
  if (isProtectedRoute && !isAuthenticated && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url)

    loginUrl.searchParams.set('redirect', pathname)

    return NextResponse.redirect(loginUrl)
  }

  // Si l'utilisateur essaie d'accéder à une route admin, vérifier le rôle
  if (isAdminRoute && isAuthenticated) {
    try {
      const rawCookieValue = sessionCookie?.value || '{}'
      const sessionData = JSON.parse(rawCookieValue)
      const userRole = sessionData?.user?.role

      if (userRole !== 'admin') {
        // Supprimer les cookies et rediriger vers login
        const loginUrl = new URL('/login', request.url)

        loginUrl.searchParams.set('error', 'unauthorized')
        const response = NextResponse.redirect(loginUrl)

        response.cookies.delete('user')
        response.cookies.delete('auth_token')
        response.cookies.delete('refresh_token')

return response
      }
    } catch (e) {
      console.error('[Middleware] Error parsing session cookie:', e)

      // Si erreur de parsing, supprimer les cookies et rediriger vers login
      const response = NextResponse.redirect(new URL('/login', request.url))

      response.cookies.delete('user')
      response.cookies.delete('auth_token')
      response.cookies.delete('refresh_token')

return response
    }
  }

  // Continuer la requête normalement
  return NextResponse.next()
}

/**
 * Configuration du middleware
 * Définit sur quelles routes le middleware doit s'exécuter
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
