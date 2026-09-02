'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { usePermissions } from '@/hooks/usePermissions'
import { StatCard, StatCardGrid, StatusPill, SectionCard, DataTable, SearchInput, SelectFilter, DateRangeFilter, FilterModal, FilterField, type Column, type UiPalette } from '@/components/ui'
import { summarizeByCommercial, type Enrolment, type EnrolmentStatus, type CommercialSummary } from '@/data/enrolments.mock'
import { enrolmentService } from '@/services/enrolment.service'

type TabKey = 'detail' | 'recap'

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

function EnrolmentsInner() {
  const theme = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { can } = usePermissions()
  const allowed = can('read', 'enrolments')
  // Sur mobile/tablette (< lg) : le détail commercial s'ouvre dans un drawer ; sur desktop, en colonne à gauche du tableau.
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'))

  // État initialisé depuis l'URL (persiste au rafraîchissement)
  const [tab, setTab] = useState<TabKey>(searchParams.get('tab') === 'recap' ? 'recap' : 'detail')
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [commercialId, setCommercialId] = useState(searchParams.get('commercial') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '')

  const [selectedCommercialId, setSelectedCommercialId] = useState<string | null>(null)

  // Données réelles (API) — filtrage/pagination fin côté client.
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    setLoading(true)
    enrolmentService
      .list({ pageSize: 500 })
      .then(rows => { if (active) { setEnrolments(rows); setLoadError(null) } })
      .catch((err: any) => { if (active) setLoadError(err?.message || 'Impossible de charger les enrôlements') })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  // Liste des commerciaux (pour le filtre) dérivée des données réelles.
  const commercials = useMemo(() => {
    const map = new Map<string, string>()

    enrolments.forEach(e => { if (e.commercialId) map.set(e.commercialId, e.commercialName || e.commercialId) })

    return Array.from(map, ([id, name]) => ({ id, name }))
  }, [enrolments])

  // Pagination (côté client)
  const [recapPage, setRecapPage] = useState(0)
  const [recapRpp, setRecapRpp] = useState(5)
  const [detailPage, setDetailPage] = useState(0)
  const [detailRpp, setDetailRpp] = useState(5)

  useEffect(() => {
    const p = new URLSearchParams()

    if (tab === 'recap') p.set('tab', 'recap')
    if (query) p.set('q', query)
    if (commercialId) p.set('commercial', commercialId)
    if (status) p.set('status', status)
    if (dateFrom) p.set('from', dateFrom)
    if (dateTo) p.set('to', dateTo)

    const qs = p.toString()

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [tab, query, commercialId, status, dateFrom, dateTo, pathname, router])

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
  }, [enrolments, query, commercialId, status, dateFrom, dateTo])

  const summary = useMemo(() => summarizeByCommercial(filtered), [filtered])

  const totals = {
    total: filtered.length,
    activated: filtered.filter(e => e.status === 'activated').length,
    pending: filtered.filter(e => e.status === 'pending').length
  }

  const isFiltered = Boolean(query) || Boolean(commercialId) || Boolean(status) || Boolean(dateFrom) || Boolean(dateTo)

  // Colonnes du tableau « Détail »
  const detailColumns: Column<Enrolment>[] = [
    {
      key: 'commercial',
      header: 'Commercial',
      render: e => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: 11.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>{initials(e.commercialName)}</Avatar>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>{e.commercialName}</Typography>
        </Box>
      )
    },
    {
      key: 'merchant',
      header: 'Marchand',
      render: e => (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>{e.merchantName}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{e.merchantPhone}</Typography>
        </Box>
      )
    },
    { key: 'shop', header: 'Boutique', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.shopName}</Typography> },
    { key: 'ville', header: 'Ville', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.ville}</Typography> },
    { key: 'status', header: 'Statut', render: e => <StatusPill label={statusMeta[e.status].label} palette={statusMeta[e.status].palette} /> },
    { key: 'date', header: 'Date & heure', render: e => <Typography sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(e.createdAt)}</Typography> }
  ]

  // Colonnes du tableau « Récap »
  const recapColumns: Column<CommercialSummary>[] = [
    {
      key: 'commercial',
      header: 'Commercial',
      render: c => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>{initials(c.commercialName)}</Avatar>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>{c.commercialName}</Typography>
        </Box>
      )
    },
    { key: 'activated', header: 'Activés', align: 'center', render: c => <StatusPill label={String(c.activated)} palette='success' /> },
    { key: 'pending', header: 'En attente', align: 'center', render: c => <StatusPill label={String(c.pending)} palette='warning' /> },
    {
      key: 'total',
      header: 'Total enrôlés',
      align: 'center',
      render: c => (
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'primary.main' }}>{c.total}</Typography>
      )
    }
  ]

  // Panneau détail d'un commercial (réutilisé : colonne gauche desktop + drawer mobile)
  const detailPanel = (() => {
    if (!selectedCommercialId) return null

    const rows = filtered.filter(e => e.commercialId === selectedCommercialId)
    const c = summary.find(s => s.commercialId === selectedCommercialId)
    const name = c?.commercialName || rows[0]?.commercialName || 'Commercial'
    const villes = new Set(rows.map(r => r.ville)).size

    const miniStats = [
      { label: 'Marchands enrôlés', value: rows.length, palette: 'primary' as const, icon: 'tabler-building-store' },
      { label: 'Comptes activés', value: rows.filter(r => r.status === 'activated').length, palette: 'success' as const, icon: 'tabler-circle-check' },
      { label: 'En attente', value: rows.filter(r => r.status === 'pending').length, palette: 'warning' as const, icon: 'tabler-clock' },
      { label: 'Villes couvertes', value: villes, palette: 'info' as const, icon: 'tabler-map-pin' }
    ]

    const panelColumns: Column<Enrolment>[] = [
      {
        key: 'merchant',
        header: 'Marchand',
        render: e => (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }} noWrap>{e.merchantName}</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }} noWrap>{e.merchantPhone}</Typography>
          </Box>
        )
      },
      { key: 'shop', header: 'Boutique', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.shopName}</Typography> },
      { key: 'ville', header: 'Ville', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.ville}</Typography> },
      { key: 'status', header: 'Statut', render: e => <StatusPill label={statusMeta[e.status].label} palette={statusMeta[e.status].palette} /> },
      { key: 'date', header: 'Date & heure', render: e => <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(e.createdAt)}</Typography> }
    ]

    return (
      <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: { lg: 640 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Avatar sx={{ width: 48, height: 48, fontSize: 15, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>{initials(name)}</Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary' }} noWrap>{name}</Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Activité (selon les filtres en cours)</Typography>
          </Box>
          <IconButton onClick={() => setSelectedCommercialId(null)} sx={{ borderRadius: 0 }}>
            <i className='tabler-x' style={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, p: 2.5 }}>
          {miniStats.map(s => {
            const color = theme.palette[s.palette].main

            return (
              <Box key={s.label} sx={{ p: 2, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 1.5, backgroundColor: alpha(color, 0.08) }}>
                <Box sx={{ width: 42, height: 42, flexShrink: 0, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, backgroundColor: alpha(color, 0.16) }}>
                  <i className={`${s.icon} text-xl`} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{s.value}</Typography>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: 'text.secondary' }} noWrap>{s.label}</Typography>
                </Box>
              </Box>
            )
          })}
        </Box>

        <Box sx={{ px: 2.5, pb: 1, flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.03em' }}>Ses enrôlements</Typography>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, display: 'flex', flexDirection: 'column' }}>
          <DataTable
            columns={panelColumns}
            rows={rows.slice(detailPage * detailRpp, detailPage * detailRpp + detailRpp)}
            getRowKey={e => e.id}
            empty={{ label: 'Aucun enrôlement' }}
            fillHeight
            pagination={{ count: rows.length, page: detailPage, rowsPerPage: detailRpp, onPageChange: setDetailPage, onRowsPerPageChange: n => { setDetailRpp(n); setDetailPage(0) } }}
          />
        </Box>
      </Card>
    )
  })()

  if (!allowed) {
    return (
      <PageContainer title='Activité commerciale'>
        <Alert severity='warning'>Vous n&apos;avez pas la permission de consulter l&apos;activité commerciale.</Alert>
      </PageContainer>
    )
  }

  const TabBtn = ({ id, label, count }: { id: TabKey; label: string; count: number }) => {
    const active = tab === id

    return (
      <Box
        role='button'
        onClick={() => setTab(id)}
        sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 40, px: 2, borderRadius: 0, cursor: 'pointer', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all .15s', color: active ? 'primary.main' : 'text.secondary', backgroundColor: active ? 'background.paper' : 'transparent', boxShadow: active ? 'var(--mui-customShadows-xs)' : 'none' }}
      >
        {label}
        <Box component='span' sx={{ minWidth: 20, height: 20, px: 0.5, borderRadius: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, bgcolor: active ? 'var(--mui-palette-primary-lightOpacity)' : 'action.hover', color: active ? 'primary.main' : 'text.secondary' }}>
          {count}
        </Box>
      </Box>
    )
  }

  return (
    <PageContainer
      title='Activité commerciale'
      subtitle='Traçabilité des enrôlements par commercial (base de commission)'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 48, p: 0.5, borderRadius: 0, backgroundColor: 'action.hover' }}>
          <TabBtn id='detail' label='Détail des enrôlements' count={filtered.length} />
          <TabBtn id='recap' label='Récap commercial' count={summary.length} />
        </Box>
      }
    >
      {/* Récap global */}
      <StatCardGrid>
        <StatCard label='Enrôlements' value={totals.total} caption='Sur la période filtrée' icon='tabler-user-plus' palette='primary' />
        <StatCard label='Activés' value={totals.activated} caption='Comptes activés' icon='tabler-circle-check' palette='success' />
        <StatCard label='En attente' value={totals.pending} caption='À finaliser' icon='tabler-clock' palette='warning' />
        <StatCard label='Commerciaux' value={summary.length} caption='Actifs sur la période' icon='tabler-users' palette='info' />
      </StatCardGrid>

      {/* Filtres (partagés par les deux onglets) */}
      <Card sx={{ border: 'none', boxShadow: 'none' }}>
        <CardContent sx={{ p: 2.5 }}>
          <FilterModal
            active={isFiltered}
            onApply={() => {}}
            onReset={() => { setQuery(''); setCommercialId(''); setStatus(''); setDateFrom(''); setDateTo('') }}
            subtitle='Affinez la liste des enrôlements.'
          >
            <FilterField label='Recherche'>
              <SearchInput value={query} onChange={setQuery} placeholder='Rechercher (marchand, boutique, commercial)' minWidth={0} />
            </FilterField>
            <FilterField label='Commercial'>
              <SelectFilter value={commercialId} onChange={setCommercialId} options={[{ value: '', label: 'Commercial : tous' }, ...commercials.map(c => ({ value: c.id, label: c.name }))]} />
            </FilterField>
            <FilterField label='Statut'>
              <SelectFilter value={status} onChange={setStatus} options={[{ value: '', label: 'Statut : tous' }, { value: 'activated', label: 'Activé' }, { value: 'pending', label: 'En attente' }]} />
            </FilterField>
            <FilterField label='Période'>
              <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
            </FilterField>
          </FilterModal>
        </CardContent>
      </Card>

      {/* Onglet : Récap par commercial — desktop : tableau à gauche + détail à droite */}
      {tab === 'recap' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: (selectedCommercialId && !isDownLg) ? 'minmax(0, 1fr) 640px' : '1fr' }, gap: 3, alignItems: { lg: 'stretch' } }}>
          <SectionCard title='Récap par commercial' fill>
            <DataTable
              columns={recapColumns}
              rows={summary.slice(recapPage * recapRpp, recapPage * recapRpp + recapRpp)}
              getRowKey={c => c.commercialId}
              onRowClick={c => { setSelectedCommercialId(c.commercialId); setDetailPage(0) }}
              empty={{ icon: 'tabler-users', label: 'Aucun enrôlement sur la période' }}
              fillHeight
              pagination={{ count: summary.length, page: recapPage, rowsPerPage: recapRpp, onPageChange: setRecapPage, onRowsPerPageChange: n => { setRecapRpp(n); setRecapPage(0) } }}
            />
          </SectionCard>
          {selectedCommercialId && !isDownLg && detailPanel}
        </Box>
      )}

      {/* Onglet : Détail des enrôlements */}
      {tab === 'detail' && (
        <SectionCard title='Détail des enrôlements'>
          <DataTable
            columns={detailColumns}
            rows={filtered}
            getRowKey={e => e.id}
            empty={{ icon: 'tabler-user-plus', label: 'Aucun enrôlement' }}
          />
        </SectionCard>
      )}

      {/* Mobile : le détail commercial s'ouvre en drawer (bas) */}
      <Drawer anchor='bottom' open={isDownLg && !!selectedCommercialId} onClose={() => setSelectedCommercialId(null)} slotProps={{ paper: { sx: { maxHeight: '92vh', borderRadius: 0 } } }}>
        {detailPanel}
      </Drawer>
    </PageContainer>
  )
}

export default function EnrolmentsPage() {
  return (
    <Suspense fallback={null}>
      <EnrolmentsInner />
    </Suspense>
  )
}
