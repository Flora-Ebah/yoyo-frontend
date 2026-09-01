import { describe, it, expect } from 'vitest'

import { summarizeByCommercial, ENROLMENTS_MOCK, type Enrolment } from './enrolments.mock'

describe('summarizeByCommercial', () => {
  it('regroupe par commercial avec total = activés + en attente', () => {
    const summary = summarizeByCommercial(ENROLMENTS_MOCK)

    for (const row of summary) {
      expect(row.total).toBe(row.activated + row.pending)
    }

    // Le total global correspond au nombre d'enrôlements
    const grandTotal = summary.reduce((n, r) => n + r.total, 0)

    expect(grandTotal).toBe(ENROLMENTS_MOCK.length)
  })

  it('compte correctement activés / en attente pour un commercial', () => {
    const rows: Enrolment[] = [
      { id: 'a', merchantName: 'M1', merchantEmail: '', merchantPhone: '', shopName: 'S1', ville: 'Abidjan', category: 'X', commercialId: 'c1', commercialName: 'C1', status: 'activated', createdAt: '2026-01-01T00:00:00' },
      { id: 'b', merchantName: 'M2', merchantEmail: '', merchantPhone: '', shopName: 'S2', ville: 'Bouaké', category: 'X', commercialId: 'c1', commercialName: 'C1', status: 'pending', createdAt: '2026-01-02T00:00:00' },
      { id: 'c', merchantName: 'M3', merchantEmail: '', merchantPhone: '', shopName: 'S3', ville: 'Abidjan', category: 'X', commercialId: 'c2', commercialName: 'C2', status: 'activated', createdAt: '2026-01-03T00:00:00' }
    ]

    const summary = summarizeByCommercial(rows)
    const c1 = summary.find(s => s.commercialId === 'c1')
    const c2 = summary.find(s => s.commercialId === 'c2')

    expect(c1).toMatchObject({ total: 2, activated: 1, pending: 1 })
    expect(c2).toMatchObject({ total: 1, activated: 1, pending: 0 })
  })

  it('trie par total décroissant', () => {
    const summary = summarizeByCommercial(ENROLMENTS_MOCK)

    for (let i = 1; i < summary.length; i++) {
      expect(summary[i - 1].total).toBeGreaterThanOrEqual(summary[i].total)
    }
  })
})
