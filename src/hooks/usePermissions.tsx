'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { adminAccountService } from '@/services/admin-account.service'
import { abilityAllows, type Ability } from '@/configs/permissions'

interface PermissionsContextValue {
  abilities: Ability[]
  loading: boolean
  /** true tant que les permissions ne sont pas chargées (évite de cacher le menu au 1er rendu) */
  ready: boolean
  /** true si le chargement de /admin/me a échoué (panne réseau) — permet de ne pas hard-bloquer */
  error: boolean
  can: (action: string, subject: string) => boolean
  refresh: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

export const PermissionsProvider = ({ children }: { children: ReactNode }) => {
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setError(false)

      const me = await adminAccountService.getMe()
      const profile = me?.profile

      const ability = typeof profile === 'object' && profile ? profile.ability || [] : []

      setAbilities(Array.isArray(ability) ? ability : [])
    } catch {
      // Échec de chargement : fail-closed sur les permissions (abilities vides ⇒ can() = false),
      // mais on marque `error` pour que les gardes de route ne redirigent pas en boucle sur une panne.
      setAbilities([])
      setError(true)
    } finally {
      setLoading(false)
      setReady(true)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<PermissionsContextValue>(
    () => ({
      abilities,
      loading,
      ready,
      error,
      can: (action: string, subject: string) => abilityAllows(abilities, action, subject),
      refresh: load
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [abilities, loading, ready, error]
  )

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export const usePermissions = (): PermissionsContextValue => {
  const ctx = useContext(PermissionsContext)

  if (!ctx) {
    // Fallback fail-closed si le provider n'est pas monté (ne doit pas arriver dans (admin)).
    return {
      abilities: [],
      loading: false,
      ready: true,
      error: false,
      can: () => false,
      refresh: async () => {}
    }
  }

  return ctx
}
