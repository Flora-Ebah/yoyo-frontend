'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { usePermissions } from '@/hooks/usePermissions'
import {
  StatCard,
  StatCardGrid,
  StatusPill,
  SectionCard,
  DataTable,
  SearchInput,
  SelectFilter,
  DateRangeFilter,
  FilterModal,
  FilterField,
  RefreshButton,
  type Column,
  type UiPalette
} from '@/components/ui'
import { summarizeByCommercial, type Enrolment, type EnrolmentStatus } from '@/data/enrolments.mock'
import { enrolmentService } from '@/services/enrolment.service'

const statusMeta: Record<EnrolmentStatus, { label: string; palette: UiPalette }> = {
  activated: { label: 'Activé', palette: 'success' },
  pending: { label: 'En attente', palette: 'warning' }
}

function formatDateTime(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'

  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
}

export default function EnrolmentsPage() {
  const theme = useTheme()
  const router = useRouter()
  const { can } = usePermissions()
  const allowed = can('read', 'enrolments')

  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Filtres (appliqués à la fois aux KPI, au classement et au tableau)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [commercialId, setCommercialId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const load = useCallback(() => {
    setLoading(true)
    enrolmentService
      .list({ pageSize: 500 })
      .then(rows => { setEnrolments(rows); setLoadError(null) })
      .catch((err: any) => setLoadError(err?.message || 'Impossible de charger les enrôlements'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const commercials = useMemo(() => {
    const map = new Map<string, string>()

    enrolments.forEach(e => { if (e.commercialId) map.set(e.commercialId, e.commercialName || e.commercialId) })

    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [enrolments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const fromTs = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null
    const toTs = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null

    return enrolments.filter(e => {
      if (commercialId && e.commercialId !== commercialId) return false
      if (status && e.status !== status) return false
      if (q && ![e.merchantName, e.shopName, e.ville, e.commercialName].join(' ').toLowerCase().includes(q)) return false
      const ts = new Date(e.createdAt).getTime()
      if (fromTs && ts < fromTs) return false
      if (toTs && ts > toTs) return false

      return true
    })
  }, [enrolments, query, status, commercialId, dateFrom, dateTo])

  const summary = useMemo(() => summarizeByCommercial(filtered), [filtered])

  const totals = useMemo(() => {
    const total = filtered.length
    const activated = filtered.filter(e => e.status === 'activated').length
    const pending = total - activated
    const rate = total > 0 ? Math.round((activated / total) * 100) : 0
    const commActifs = new Set(filtered.map(e => e.commercialId)).size

    return { total, activated, pending, rate, commActifs }
  }, [filtered])

  const isFiltered = Boolean(query) || Boolean(status) || Boolean(commercialId) || Boolean(dateFrom) || Boolean(dateTo)

  const resetFilters = () => { setPage(0); setQuery(''); setStatus(''); setCommercialId(''); setDateFrom(''); setDateTo('') }

  const columns: Column<Enrolment>[] = [
    {
      key: 'merchant',
      header: 'Marchand',
      render: e => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 11.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>{initials(e.merchantName)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>{e.merchantName}</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }} noWrap>{e.merchantPhone}</Typography>
          </Box>
        </Box>
      )
    },
    { key: 'shop', header: 'Boutique', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.shopName}</Typography> },
    { key: 'ville', header: 'Ville', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.ville}</Typography> },
    {
      key: 'commercial',
      header: 'Commercial',
      render: e => (
        <Box
          role='button'
          onClick={ev => { ev.stopPropagation(); router.push(`/enrolments/commercial/${e.commercialId}`) }}
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', color: 'primary.main', fontWeight: 700, fontSize: 13, '&:hover': { textDecoration: 'underline' } }}
        >
          {e.commercialName}
        </Box>
      )
    },
    { key: 'status', header: 'Statut', render: e => <StatusPill label={statusMeta[e.status].label} palette={statusMeta[e.status].palette} /> },
    { key: 'date', header: 'Enrôlé le', render: e => <Typography sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(e.createdAt)}</Typography> }
  ]

  if (!allowed) {
    return (
      <PageContainer title='Activité commerciale'>
        <Alert severity='warning'>Vous n&apos;avez pas la permission de consulter l&apos;activité commerciale.</Alert>
      </PageContainer>
    )
  }

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <PageContainer
      title='Activité commerciale'
      subtitle='Suivi des enrôlements par commercial'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <FilterModal
            active={isFiltered}
            onApply={() => {}}
            onReset={resetFilters}
            subtitle="Filtre l'ensemble de la vue (KPI, classement, tableau)."
          >
            <FilterField label='Recherche'>
              <SearchInput value={query} onChange={v => { setPage(0); setQuery(v) }} placeholder='Marchand, boutique, ville, commercial' minWidth={0} />
            </FilterField>
            <FilterField label='Commercial'>
              <SelectFilter value={commercialId} onChange={v => { setPage(0); setCommercialId(v) }} options={[{ value: '', label: 'Commercial : tous' }, ...commercials.map(c => ({ value: c.id, label: c.name }))]} />
            </FilterField>
            <FilterField label='Statut'>
              <SelectFilter value={status} onChange={v => { setPage(0); setStatus(v) }} options={[{ value: '', label: 'Statut : tous' }, { value: 'activated', label: 'Activé' }, { value: 'pending', label: 'En attente' }]} />
            </FilterField>
            <FilterField label='Période'>
              <DateRangeFilter from={dateFrom} to={dateTo} onFrom={v => { setPage(0); setDateFrom(v) }} onTo={v => { setPage(0); setDateTo(v) }} />
            </FilterField>
          </FilterModal>
          <RefreshButton onClick={load} spinning={loading} />
        </Box>
      }
    >
      {loadError && <Alert severity='error' sx={{ mb: 2 }}>{loadError}</Alert>}

      {/* KPI */}
      <Box sx={{ mb: 3 }}>
        <StatCardGrid>
          <StatCard label='Enrôlés' value={totals.total} caption='Total' icon='tabler-building-store' palette='primary' />
          <StatCard label='Activés' value={totals.activated} caption='Comptes activés' icon='tabler-circle-check' palette='success' />
          <StatCard label='En attente' value={totals.pending} caption='À relancer' icon='tabler-clock' palette='warning' />
          <StatCard label="Taux d'activation" value={`${totals.rate}%`} caption='Activés / enrôlés' icon='tabler-percentage' palette='info' />
        </StatCardGrid>
      </Box>

      {loading && enrolments.length === 0 ? (
        <Box className='flex items-center justify-center' sx={{ minHeight: '30vh' }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '380px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
          {/* Classement des commerciaux */}
          <SectionCard title='Classement des commerciaux'>
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {summary.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <i className='tabler-users text-4xl' />
                  <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 1 }}>Aucun commercial</Typography>
                </Box>
              ) : (
                [...summary].sort((a, b) => b.activated - a.activated).map((c, i) => {
                  const rate = c.total > 0 ? Math.round((c.activated / c.total) * 100) : 0

                  return (
                    <Box
                      key={c.commercialId}
                      role='button'
                      onClick={() => router.push(`/enrolments/commercial/${c.commercialId}`)}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, cursor: 'pointer', backgroundColor: 'action.hover', transition: 'background-color .15s', '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.12) } }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'text.secondary', width: 20, flexShrink: 0 }}>#{i + 1}</Typography>
                      <Avatar sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: 0, fontSize: 12, fontWeight: 800, color: 'primary.main', backgroundColor: 'var(--mui-palette-primary-lightOpacity)' }}>{initials(c.commercialName)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>{c.commercialName}</Typography>
                        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }} noWrap>{c.total} enrôlés · {c.activated} activés · {rate}%</Typography>
                        <Box sx={{ mt: 0.75, height: 5, backgroundColor: 'var(--mui-palette-divider)', overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${rate}%`, backgroundColor: 'success.main' }} />
                        </Box>
                      </Box>
                      <i className='tabler-chevron-right' style={{ fontSize: 18, color: theme.palette.text.disabled }} />
                    </Box>
                  )
                })
              )}
            </Box>
          </SectionCard>

          {/* Tous les enrôlements */}
          <SectionCard title='Tous les enrôlements'>
            <DataTable
              columns={columns}
              rows={paged}
              getRowKey={e => e.id}
              onRowClick={e => router.push(`/enrolments/commercial/${e.commercialId}`)}
              empty={{ icon: 'tabler-building-store', label: 'Aucun enrôlement' }}
              pagination={{
                count: filtered.length,
                page,
                rowsPerPage,
                onPageChange: setPage,
                onRowsPerPageChange: rpp => { setRowsPerPage(rpp); setPage(0) }
              }}
            />
          </SectionCard>
        </Box>
      )}
    </PageContainer>
  )
}
