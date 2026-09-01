'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { usePermissions } from '@/hooks/usePermissions'

/**
 * Redirige les profils "commerciaux" (droit pros mais pas dashboard) vers leur vue
 * dédiée /commercial lorsqu'ils atterrissent sur le tableau de bord.
 * Monté dans le layout admin (sous PermissionsProvider).
 */
export default function LandingRedirect() {
  const { ready, can } = usePermissions()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!ready) return

    const isCommercial = can('create', 'pros') && !can('read', 'dashboard')

    if (isCommercial && (pathname === '/dashboard' || pathname === '/')) {
      router.replace('/commercial')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pathname])

  return null
}
