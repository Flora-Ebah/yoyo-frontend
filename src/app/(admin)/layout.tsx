import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

// MUI Imports
import Button from '@mui/material/Button'

// Type Imports
import type { ChildrenType } from '@core/types'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'
import { PermissionsProvider } from '@/hooks/usePermissions'
import LandingRedirect from '@components/LandingRedirect'
import PermissionGuard from '@components/PermissionGuard'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import ScrollToTop from '@core/components/scroll-to-top'

// Util Imports
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

// Service Imports
import { sessionService } from '@/services/session.service'
import { apiServer } from '@/services/api.server'

// Config Imports
import { ROUTES } from '@/configs/constants'
import { abilityAllows } from '@/configs/permissions'

const Layout = async (props: ChildrenType) => {
  const { children } = props

  // Vérifier l'authentification et le rôle admin
  const session = await sessionService.ensureValidSession()
  const isAuthenticated = !!session

  // Vérification AUTORITAIRE du rôle admin via le backend (token httpOnly), plutôt
  // que via le cookie `user` éditable côté client. Repli dégradé sur le cookie
  // uniquement si le backend est injoignable (réseau/5xx), pas sur un rejet 401/403.
  const adminVerdict = isAuthenticated ? await apiServer.verifyAdmin() : 'forbidden'
  const isAdmin = adminVerdict === 'ok' || (adminVerdict === 'unknown' && session?.user?.role === 'admin')

  // Si l'utilisateur n'est pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    const requestHeaders = await headers()
    const headerPath =
      requestHeaders.get('x-forwarded-uri') ||
      requestHeaders.get('x-invoke-path') ||
      requestHeaders.get('next-url')

    let redirectTarget: string = ROUTES.dashboard

    if (headerPath && headerPath.startsWith('/')) {
      redirectTarget = headerPath
    } else {
      const referer = requestHeaders.get('referer')

      if (referer) {
        try {
          const url = new URL(referer)

          if (url.pathname && url.pathname !== ROUTES.auth.login) {
            redirectTarget = `${url.pathname}${url.search}${url.hash}`
          }
        } catch {}
      }
    }

    redirect(`${ROUTES.auth.login}?redirect=${encodeURIComponent(redirectTarget)}`)
  }

  // Si l'utilisateur n'a pas le rôle creator, rediriger vers la page d'accueil
  if (!isAdmin) {
    redirect(`${ROUTES.auth.login}?error=unauthorized`)
  }

  // Filet AUTORITAIRE : un commercial ne doit jamais atterrir sur le dashboard admin.
  // Sur /dashboard ou /, on vérifie les abilities backend et on renvoie vers /commercial.
  {
    const reqHeaders = await headers()
    const rawPath =
      reqHeaders.get('x-forwarded-uri') || reqHeaders.get('x-invoke-path') || reqHeaders.get('next-url') || ''
    const pathOnly = rawPath.split('?')[0]

    if (pathOnly === '/dashboard' || pathOnly === '/') {
      const abilities = await apiServer.getAbilities()

      if (abilities && abilityAllows(abilities, 'create', 'pros') && !abilityAllows(abilities, 'read', 'dashboard')) {
        redirect('/commercial')
      }
    }
  }

  // Type guard to ensure lang is a valid Locale

  // Vars
  const direction = 'ltr'
  const mode = await getMode()
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      <PermissionsProvider>
        <LandingRedirect />
        <PermissionGuard />
        <LayoutWrapper
          systemMode={systemMode}
          verticalLayout={
            <VerticalLayout navigation={<Navigation mode={mode} />} navbar={<Navbar />}>
              {children}
            </VerticalLayout>
          }
          horizontalLayout={
            <HorizontalLayout header={<Header />} footer={<HorizontalFooter />}>
              {children}
            </HorizontalLayout>
          }
        />
      </PermissionsProvider>
      <ScrollToTop className='mui-fixed'>
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='tabler-arrow-up' />
        </Button>
      </ScrollToTop>
    </Providers>
  )
}

export default Layout

