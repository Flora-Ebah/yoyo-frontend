'use client'

import { useEffect, useMemo, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { ArrowLeft } from 'lucide-react'

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
  type Column,
  type UiPalette
} from '@/components/ui'
import { type Enrolment, type EnrolmentStatus } from '@/data/enrolments.mock'
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

export default function CommercialDetailPage() {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string
  const { can } = usePermissions()
  const allowed = can('read', 'enrolments')

  const [all, setAll] = useState<Enrolment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    let active = true

    setLoading(true)
    enrolmentService
      .list({ pageSize: 500 })
      .then(rows => { if (active) { setAll(rows); setLoadError(null) } })
      .catch((err: any) => { if (active) setLoadError(err?.message || 'Impossible de charger les enrôlements') })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const mine = useMemo(() => all.filter(e => e.commercialId === id), [all, id])
  const name = mine[0]?.commercialName || 'Commercial'

  const totals = useMemo(() => {
    const total = mine.length
    const activated = mine.filter(e => e.status === 'activated').length
    const pending = total - activated
    const rate = total > 0 ? Math.round((activated / total) * 100) : 0

    return { total, activated, pending, rate }
  }, [mine])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const fromTs = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null
    const toTs = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null

    return mine.filter(e => {
      if (status && e.status !== status) return false
      if (q && ![e.merchantName, e.shopName, e.ville].join(' ').toLowerCase().includes(q)) return false
      const ts = new Date(e.createdAt).getTime()
      if (fromTs && ts < fromTs) return false
      if (toTs && ts > toTs) return false

      return true
    })
  }, [mine, query, status, dateFrom, dateTo])

  const isFiltered = Boolean(query) || Boolean(status) || Boolean(dateFrom) || Boolean(dateTo)
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

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

  return (
    <PageContainer>
      <Box
        component='button'
        onClick={() => router.push('/enrolments')}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 2, px: 1.5, height: 34, border: 'none', cursor: 'pointer', backgroundColor: 'action.hover', color: 'text.secondary', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) } }}
      >
        <ArrowLeft size={16} /> Retour à l'activité commerciale
      </Box>

      {loadError && <Alert severity='error' sx={{ mb: 2 }}>{loadError}</Alert>}

      {loading && all.length === 0 ? (
        <Box className='flex items-center justify-center' sx={{ minHeight: '40vh' }}><CircularProgress /></Box>
      ) : (
        <>
          {/* En-tête commercial */}
          <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', mb: 3 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
              <Avatar sx={{ width: 60, height: 60, flexShrink: 0, borderRadius: 0, fontSize: 20, fontWeight: 800, color: 'primary.main', backgroundColor: 'var(--mui-palette-primary-lightOpacity)' }}>{initials(name)}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }} noWrap>{name}</Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Commercial · {totals.total} marchand(s) enrôlé(s)</Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Widgets */}
          <Box sx={{ mb: 3 }}>
            <StatCardGrid>
              <StatCard label='Enrôlés' value={totals.total} caption='Total' icon='tabler-building-store' palette='primary' />
              <StatCard label='Activés' value={totals.activated} caption='Comptes activés' icon='tabler-circle-check' palette='success' />
              <StatCard label='En attente' value={totals.pending} caption='À relancer' icon='tabler-clock' palette='warning' />
              <StatCard label="Taux d'activation" value={`${totals.rate}%`} caption='Activés / enrôlés' icon='tabler-percentage' palette='info' />
            </StatCardGrid>
          </Box>

          {/* Ses marchands */}
          <SectionCard
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, width: '100%' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary' }}>Ses marchands</Typography>
                <FilterModal
                  active={isFiltered}
                  onApply={() => {}}
                  onReset={() => { setPage(0); setQuery(''); setStatus(''); setDateFrom(''); setDateTo('') }}
                  subtitle='Affinez la liste des marchands.'
                >
                  <FilterField label='Recherche'>
                    <SearchInput value={query} onChange={v => { setPage(0); setQuery(v) }} placeholder='Marchand, boutique, ville' minWidth={0} />
                  </FilterField>
                  <FilterField label='Statut'>
                    <SelectFilter value={status} onChange={v => { setPage(0); setStatus(v) }} options={[{ value: '', label: 'Statut : tous' }, { value: 'activated', label: 'Activé' }, { value: 'pending', label: 'En attente' }]} />
                  </FilterField>
                  <FilterField label='Période'>
                    <DateRangeFilter from={dateFrom} to={dateTo} onFrom={v => { setPage(0); setDateFrom(v) }} onTo={v => { setPage(0); setDateTo(v) }} />
                  </FilterField>
                </FilterModal>
              </Box>
            }
          >
            <DataTable
              columns={columns}
              rows={paged}
              getRowKey={e => e.id}
              empty={{ icon: 'tabler-building-store', label: 'Aucun marchand' }}
              pagination={{
                count: filtered.length,
                page,
                rowsPerPage,
                onPageChange: setPage,
                onRowsPerPageChange: rpp => { setRowsPerPage(rpp); setPage(0) }
              }}
            />
          </SectionCard>
        </>
      )}
    </PageContainer>
  )
}
