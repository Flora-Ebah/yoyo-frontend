export interface ApiEnvelope<T> {
  status?: number
  message?: any
  data: T
}

export interface ApiListMeta {
  totalRows: number
  totalPages: number
  countRowsPerPage: number
  totalPagesPerQuery: number
}

export interface ApiListResult<T> {
  rows: T[]
  meta: ApiListMeta
}

export function extractListResult<T>(payload: any): ApiListResult<T> {
  const rows = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []

  const fallbackMeta: ApiListMeta = {
    totalRows: rows.length,
    totalPages: 1,
    countRowsPerPage: rows.length,
    totalPagesPerQuery: 1
  }

  const message = payload?.message

  if (!message || typeof message !== 'object') {
    return { rows, meta: fallbackMeta }
  }

  return {
    rows,
    meta: {
      totalRows: Number(message.totalRows ?? fallbackMeta.totalRows),
      totalPages: Number(message.totalPages ?? fallbackMeta.totalPages),
      countRowsPerPage: Number(message.countRowsPerPage ?? fallbackMeta.countRowsPerPage),
      totalPagesPerQuery: Number(message.totalPagesPerQuery ?? fallbackMeta.totalPagesPerQuery)
    }
  }
}

export function buildQuery(params: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && `${value}`.trim() !== '') {
      searchParams.set(key, `${value}`)
    }
  })

  const query = searchParams.toString()

  return query ? `?${query}` : ''
}
