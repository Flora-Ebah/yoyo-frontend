/**
 * Service des enrôlements marchands (vue commerciale / admin).
 * Branché sur l'API backend :
 *   GET /partners/enrolments            (liste)
 *   GET /partners/enrolments/summary    (récap par commercial)
 */

import { apiClient } from './api.client'
import type { Enrolment, EnrolmentStatus } from '@/data/enrolments.mock'

function mapRow(r: any): Enrolment {
  const rawStatus = String(r?.enrolmentStatus ?? r?.status ?? '').toLowerCase()
  const status: EnrolmentStatus = rawStatus === 'activated' || r?.activatedAt ? 'activated' : 'pending'
  const category = r?.category && typeof r.category === 'object' ? (r.category.name ?? '') : (r?.category ?? '')

  return {
    id: String(r?._id ?? r?.id ?? ''),
    merchantName: r?.merchantName || `${r?.merchant?.firstname ?? ''} ${r?.merchant?.lastname ?? ''}`.trim() || '-',
    merchantEmail: r?.merchantEmail ?? r?.merchant?.email ?? '',
    merchantPhone: r?.merchantPhone ?? r?.merchant?.contact ?? '',
    shopName: r?.shopName ?? '',
    ville: r?.ville ?? '',
    category: category || '-',
    commercialId: String(r?.commercial?._id ?? r?.commercial ?? ''),
    commercialName: r?.commercialName ?? '-',
    status,
    createdAt: r?.createdAt ?? new Date().toISOString()
  }
}

class EnrolmentService {
  /**
   * Récupère les enrôlements. `scope='me'` limite à l'utilisateur courant (commercial),
   * sinon renvoie l'ensemble (vue admin). Le filtrage/pagination fin est fait côté page.
   */
  async list(params?: { scope?: 'me' | 'all'; pageSize?: number }): Promise<Enrolment[]> {
    const qs = new URLSearchParams()

    qs.append('page', '1')
    qs.append('pageSize', String(params?.pageSize ?? 500))
    if (params?.scope) qs.append('scope', params.scope)

    const raw = await apiClient.get<any>(`/partners/enrolments?${qs.toString()}`, { rawResponse: true })
    const rows = Array.isArray(raw) ? raw : raw?.data ?? []

    return rows.map(mapRow)
  }
}

export const enrolmentService = new EnrolmentService()
