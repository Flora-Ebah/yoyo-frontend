// Notifications fictives pour le rôle commercial.
// À REMPLACER par les vraies notifications émises côté backend
// (voir CONTRAT-API-ONBOARDING-MARCHAND.md — section « Notifications »).
//
// Le commercial ne voit QUE des notifications qui le concernent :
//  1. Bienvenue à la création de son compte commercial.
//  2. Confirmation quand il crée un partenaire + sa boutique.
//  3. Alerte quand un partenaire active sa boutique via le lien reçu.

import type { NotificationsType } from '@/components/layout/shared/NotificationsDropdown'

export const COMMERCIAL_NOTIFICATIONS_MOCK: NotificationsType[] = [
  {
    _id: 'mock-com-3',
    title: 'Boutique activée',
    subtitle: 'Chez Awa — Cocody a activé sa boutique via le lien d’invitation.',
    time: 'Il y a 12 min',
    read: false,
    category: 'SUCCESS',
    avatarIcon: 'tabler-building-store',
    avatarColor: 'success'
  },
  {
    _id: 'mock-com-2',
    title: 'Partenaire créé',
    subtitle: 'Le compte de Koffi Jean et sa boutique « Chez Awa » ont bien été créés. Lien d’activation envoyé.',
    time: 'Il y a 2 h',
    read: false,
    category: 'INFO',
    avatarIcon: 'tabler-user-plus',
    avatarColor: 'primary'
  },
  {
    _id: 'mock-com-1',
    title: 'Bienvenue sur YoYo 👋',
    subtitle: 'Votre compte commercial a été créé. Vous pouvez commencer à enrôler des partenaires.',
    time: 'Hier',
    read: true,
    category: 'INFO',
    avatarIcon: 'tabler-confetti',
    avatarColor: 'secondary'
  }
]
