/**
 * Vocabulaire des permissions (RBAC) partagé entre :
 *  - la sidebar dynamique,
 *  - la page Rôles & permissions,
 *  - les gardes de pages.
 *
 * Une permission = { subject, action }. Le backend applique la même convention
 * (TokenMiddleware.can) : `subject: 'all'` ou `action: 'manage'` = joker (super-admin).
 *
 * SÉCURITÉ (fail-closed) : un profil SANS permission n'a AUCUN accès côté UI.
 * Un super-admin doit donc porter explicitement `{ action: 'manage', subject: 'all' }`.
 */

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage'

export interface Ability {
  name?: string
  subject: string
  action: string
}

export type PermissionSubject =
  | 'dashboard'
  | 'clients'
  | 'pros'
  | 'transactions'
  | 'moderation'
  | 'notifications'
  | 'admins'
  | 'roles'
  | 'settings'
  | 'enrolments'

export const PERMISSION_ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'read', label: 'Voir' },
  { key: 'create', label: 'Créer' },
  { key: 'update', label: 'Modifier' },
  { key: 'delete', label: 'Supprimer' }
]

/** Sujets = grands domaines de l'admin (alignés sur les pages / le menu). */
export const PERMISSION_SUBJECTS: {
  key: PermissionSubject
  label: string
  /** actions pertinentes pour ce sujet (sous-ensemble de PERMISSION_ACTIONS) */
  actions: PermissionAction[]
}[] = [
  { key: 'dashboard', label: 'Tableau de bord', actions: ['read'] },
  { key: 'clients', label: 'Clients', actions: ['read', 'update', 'delete'] },
  { key: 'pros', label: 'Professionnels', actions: ['read', 'update', 'delete'] },
  { key: 'transactions', label: 'Transactions', actions: ['read', 'update'] },
  { key: 'moderation', label: 'Modération', actions: ['read', 'update'] },
  { key: 'notifications', label: 'Notifications', actions: ['read', 'create'] },
  { key: 'admins', label: 'Comptes admin', actions: ['read', 'create', 'update', 'delete'] },
  { key: 'roles', label: 'Rôles & permissions', actions: ['read', 'create', 'update', 'delete'] },
  { key: 'enrolments', label: 'Activité commerciale', actions: ['read'] },
  { key: 'settings', label: 'Paramètres', actions: ['read', 'update'] }
]

/**
 * Vérifie qu'une liste d'`ability` autorise (action, subject).
 * Convention identique au backend.
 */
export function abilityAllows(ability: Ability[] | undefined | null, action: string, subject: string): boolean {
  // Fail-closed : pas de permission chargée ⇒ pas d'accès (un super-admin porte manage/all).
  if (!Array.isArray(ability) || ability.length === 0) return false

  return ability.some(a => {
    const subjectOk = a?.subject === subject || a?.subject === 'all'
    const actionOk = a?.action === action || a?.action === 'manage'

    return subjectOk && actionOk
  })
}

/** Permission « super-admin » : accès total. */
export const SUPER_ADMIN_ABILITY: Ability = { name: 'Tout gérer', subject: 'all', action: 'manage' }
