/**
 * Données FICTIVES d'enrôlements marchands (front-only).
 * ⚠️ Aucune API : le binôme backend fournira les vrais endpoints
 * (voir CONTRAT-API-ONBOARDING-MARCHAND.md). Ce module sert à peupler
 * la vue commerciale (/commercial) et la vue admin d'activité (/enrolments).
 */

export type EnrolmentStatus = 'pending' | 'activated'

export interface Enrolment {
  id: string
  merchantName: string
  merchantEmail: string
  merchantPhone: string
  shopName: string
  ville: string
  category: string
  commercialId: string
  commercialName: string
  status: EnrolmentStatus
  createdAt: string // ISO
}

/** Le commercial "connecté" en démo (correspond au compte seedé). */
export const CURRENT_COMMERCIAL_ID = 'com-1'

export const COMMERCIALS = [
  { id: 'com-1', name: 'Agent Commercial' },
  { id: 'com-2', name: 'Awa Koné' },
  { id: 'com-3', name: 'Ibrahim Traoré' }
]

export const ENROLMENTS_MOCK: Enrolment[] = [
  { id: 'e1', merchantName: 'Fatou Diarra', merchantEmail: 'fatou@example.com', merchantPhone: '0701020304', shopName: 'Chez Fatou', ville: 'Abidjan', category: 'Restauration', commercialId: 'com-1', commercialName: 'Agent Commercial', status: 'activated', createdAt: '2026-08-29T09:12:00' },
  { id: 'e2', merchantName: 'Kouassi Yao', merchantEmail: 'kouassi@example.com', merchantPhone: '0705060708', shopName: 'Boutique Yao', ville: 'Abidjan', category: 'Mode', commercialId: 'com-1', commercialName: 'Agent Commercial', status: 'pending', createdAt: '2026-08-30T14:40:00' },
  { id: 'e3', merchantName: 'Mariam Bamba', merchantEmail: 'mariam@example.com', merchantPhone: '0709101112', shopName: 'Beauté Mariam', ville: 'Bouaké', category: 'Beauté', commercialId: 'com-1', commercialName: 'Agent Commercial', status: 'activated', createdAt: '2026-08-31T08:05:00' },
  { id: 'e4', merchantName: 'Sekou Traoré', merchantEmail: 'sekou@example.com', merchantPhone: '0713141516', shopName: 'Électro Sekou', ville: 'Yamoussoukro', category: 'Électronique', commercialId: 'com-2', commercialName: 'Awa Koné', status: 'activated', createdAt: '2026-08-28T11:20:00' },
  { id: 'e5', merchantName: 'Aya N’Guessan', merchantEmail: 'aya@example.com', merchantPhone: '0717181920', shopName: 'Épicerie Aya', ville: 'San-Pédro', category: 'Alimentation', commercialId: 'com-2', commercialName: 'Awa Koné', status: 'pending', createdAt: '2026-08-30T16:55:00' },
  { id: 'e6', merchantName: 'Ibrahim Coulibaly', merchantEmail: 'ib@example.com', merchantPhone: '0721222324', shopName: 'Pharma Plus', ville: 'Korhogo', category: 'Santé', commercialId: 'com-3', commercialName: 'Ibrahim Traoré', status: 'activated', createdAt: '2026-08-27T10:00:00' },
  { id: 'e7', merchantName: 'Grace Kouadio', merchantEmail: 'grace@example.com', merchantPhone: '0725262728', shopName: 'Salon Grace', ville: 'Abidjan', category: 'Beauté', commercialId: 'com-3', commercialName: 'Ibrahim Traoré', status: 'pending', createdAt: '2026-08-31T13:30:00' },
  { id: 'e8', merchantName: 'Moussa Diallo', merchantEmail: 'moussa@example.com', merchantPhone: '0729303132', shopName: 'Quincaillerie Diallo', ville: 'Daloa', category: 'Bricolage', commercialId: 'com-1', commercialName: 'Agent Commercial', status: 'pending', createdAt: '2026-08-26T15:10:00' }
]

export interface CommercialSummary {
  commercialId: string
  commercialName: string
  total: number
  activated: number
  pending: number
}

/** Récap par commercial (pour la commission), sur une liste d'enrôlements filtrée. */
export function summarizeByCommercial(rows: Enrolment[]): CommercialSummary[] {
  const map = new Map<string, CommercialSummary>()

  rows.forEach(r => {
    const cur = map.get(r.commercialId) || { commercialId: r.commercialId, commercialName: r.commercialName, total: 0, activated: 0, pending: 0 }

    cur.total += 1
    if (r.status === 'activated') cur.activated += 1
    else cur.pending += 1
    map.set(r.commercialId, cur)
  })

  return Array.from(map.values()).sort((a, b) => b.total - a.total)
}
