'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { usePermissions } from '@/hooks/usePermissions'

/**
 * Garde de route côté client : redirige un admin qui n'a pas la permission
 * requise pour la page courante (défense en profondeur — le backend reste
 * l'autorité via TokenMiddleware.can).
 *
 * Les pages non listées (ex: /account-settings, CRUD produits/catégories…)
 * ne sont pas gardées ici. Les routes gardées correspondent au vocabulaire RBAC.
 */
type Rule = { prefix: string; allowed: (can: (a: string, s: string) => boolean) => boolean }

const RULES: Rule[] = [
  { prefix: '/dashboard', allowed: can => can('read', 'dashboard') },
  { prefix: '/clients', allowed: can => can('read', 'clients') },
  { prefix: '/pros', allowed: can => can('read', 'pros') || can('create', 'pros') },
  { prefix: '/transactions', allowed: can => can('read', 'transactions') },
  { prefix: '/moderation', allowed: can => can('read', 'moderation') },
  { prefix: '/notifications', allowed: can => can('read', 'notifications') },
  { prefix: '/admins', allowed: can => can('read', 'admins') },
  { prefix: '/enrolments', allowed: can => can('read', 'enrolments') },
  { prefix: '/commercial', allowed: can => can('create', 'pros') }
]

// Page toujours accessible vers laquelle rediriger en cas d'accès refusé.
const SAFE_ROUTE = '/account-settings'

/** Un commercial peut créer des pros mais n'a pas accès au dashboard admin. */
const isCommercial = (can: (a: string, s: string) => boolean) => can('create', 'pros') && !can('read', 'dashboard')

const PermissionGuard = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { ready, error, can } = usePermissions()

  useEffect(() => {
    // On ne garde qu'une fois les permissions chargées, et jamais sur une panne réseau
    // (sinon boucle de redirection quand /admin/me échoue).
    if (!ready || error || !pathname) return

    const rule = RULES.find(r => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`))

    if (rule && !rule.allowed(can)) {
      // Les commerciaux atterrissent sur leur espace dédié plutôt que sur les réglages.
      const target = isCommercial(can) ? '/commercial' : SAFE_ROUTE

      if (pathname !== target) router.replace(target)
    }
  }, [pathname, ready, error, can, router])

  return null
}

export default PermissionGuard
