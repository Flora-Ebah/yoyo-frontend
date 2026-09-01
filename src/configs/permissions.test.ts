import { describe, it, expect } from 'vitest'

import { abilityAllows, SUPER_ADMIN_ABILITY, type Ability } from './permissions'

describe('abilityAllows (RBAC front — fail-closed)', () => {
  it('refuse tout quand la liste de permissions est vide (fail-closed)', () => {
    expect(abilityAllows([], 'read', 'clients')).toBe(false)
    expect(abilityAllows(undefined, 'read', 'clients')).toBe(false)
    expect(abilityAllows(null, 'create', 'pros')).toBe(false)
  })

  it('autorise tout pour un super-admin (manage/all)', () => {
    const su = [SUPER_ADMIN_ABILITY]

    expect(abilityAllows(su, 'read', 'dashboard')).toBe(true)
    expect(abilityAllows(su, 'delete', 'admins')).toBe(true)
    expect(abilityAllows(su, 'create', 'pros')).toBe(true)
  })

  it('n’autorise que l’action/sujet exact pour un rôle restreint', () => {
    const commercial: Ability[] = [
      { subject: 'pros', action: 'read' },
      { subject: 'pros', action: 'create' },
      { subject: 'pros', action: 'update' }
    ]

    expect(abilityAllows(commercial, 'read', 'pros')).toBe(true)
    expect(abilityAllows(commercial, 'create', 'pros')).toBe(true)
    // Pas de dashboard → détection "commercial" côté front
    expect(abilityAllows(commercial, 'read', 'dashboard')).toBe(false)
    // Pas de delete pros, pas d'autres sujets
    expect(abilityAllows(commercial, 'delete', 'pros')).toBe(false)
    expect(abilityAllows(commercial, 'read', 'admins')).toBe(false)
  })

  it('gère le joker action "manage" sur un sujet donné', () => {
    const ability: Ability[] = [{ subject: 'clients', action: 'manage' }]

    expect(abilityAllows(ability, 'read', 'clients')).toBe(true)
    expect(abilityAllows(ability, 'delete', 'clients')).toBe(true)
    expect(abilityAllows(ability, 'read', 'pros')).toBe(false)
  })
})
