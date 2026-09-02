'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { useSession } from '@/hooks/useSession'
import { AddIcon, StatCard, StatCardGrid, StatusPill, SectionCard, DataTable, SearchInput, SelectFilter, DateRangeFilter, type Column, type UiPalette } from '@/components/ui'
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

export default function CommercialPage() {
  const theme = useTheme()
  const router = useRouter()
  const { session } = useSession()

  const goNew = () => router.push('/pros/nouveau?next=/commercial')

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Filtres dans un modal : on édite un brouillon, qu'on ne commit que sur « Appliquer ».
  const [filterOpen, setFilterOpen] = useState(false)
  const [dQuery, setDQuery] = useState('')
  const [dStatus, setDStatus] = useState('')
  const [dFrom, setDFrom] = useState('')
  const [dTo, setDTo] = useState('')

  const agentName = `${session?.user?.firstname || ''} ${session?.user?.lastname || ''}`.trim() || session?.user?.username || 'Commercial'

  // Le commercial ne voit QUE ses enrôlements : le backend l'impose via scope=me (créateur = soi).
  const [mine, setMine] = useState<Enrolment[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(() => {
    setRefreshing(true)

    enrolmentService
      .list({ scope: 'me', pageSize: 500 })
      .then(rows => setMine(rows))
      .catch(() => {})
      .finally(() => setRefreshing(false))
  }, [])

  useEffect(() => { load() }, [load])

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

  const openFilters = () => {
    setDQuery(query); setDStatus(status); setDFrom(dateFrom); setDTo(dateTo)
    setFilterOpen(true)
  }

  const applyFilters = () => {
    setQuery(dQuery); setStatus(dStatus); setDateFrom(dFrom); setDateTo(dTo)
    setFilterOpen(false)
  }

  const resetFilters = () => {
    setDQuery(''); setDStatus(''); setDFrom(''); setDTo('')
    setQuery(''); setStatus(''); setDateFrom(''); setDateTo('')
    setFilterOpen(false)
  }

  const columns: Column<Enrolment>[] = [
    {
      key: 'merchant',
      header: 'Marchand',
      render: e => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, fontSize: 12.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>{initials(e.merchantName)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>{e.merchantName}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{e.merchantEmail}</Typography>
          </Box>
        </Box>
      )
    },
    { key: 'shop', header: 'Boutique', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.shopName}</Typography> },
    { key: 'ville', header: 'Ville', render: e => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{e.ville}</Typography> },
    { key: 'status', header: 'Statut', render: e => <StatusPill label={statusMeta[e.status].label} palette={statusMeta[e.status].palette} /> },
    { key: 'date', header: 'Enrôlé le', render: e => <Typography sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(e.createdAt)}</Typography> }
  ]

  return (
    <PageContainer
      title={`Bonjour, ${agentName.split(' ')[0]} 👋`}
      subtitle='Enrôlez vos marchands à distance et suivez votre activité'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button onClick={goNew} disableElevation variant='contained' sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2 }}>
            Nouveau partenaire
          </Button>
          <Box
            component='button'
            onClick={load}
            disabled={refreshing}
            aria-label='Actualiser'
            title='Actualiser'
            sx={{
              ml: 'auto',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '6px', border: 'none',
              cursor: refreshing ? 'default' : 'pointer',
              color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.1),
              transition: 'background-color .15s', '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
              '& svg': refreshing ? { animation: 'yoyo-spin .8s linear infinite' } : undefined,
              '@keyframes yoyo-spin': { to: { transform: 'rotate(360deg)' } }
            }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
              <path d='M21 3v5h-5' />
              <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
              <path d='M8 16H3v5' />
            </svg>
          </Box>
        </Box>
      }
    >
      {/* Récap */}
      <StatCardGrid>
        <StatCard label='Marchands' value={mine.length} caption='Enrôlés au total' icon='tabler-building-store' palette='primary' />
        <StatCard label='Activés' value={mine.filter(e => e.status === 'activated').length} caption='Comptes activés' icon='tabler-circle-check' palette='success' />
        <StatCard label='En attente' value={mine.filter(e => e.status === 'pending').length} caption='À finaliser' icon='tabler-clock' palette='warning' />
        <StatCard label='Villes' value={new Set(mine.map(e => e.ville)).size} caption='Villes couvertes' icon='tabler-map-pin' palette='info' />
      </StatCardGrid>

      {/* Historique + filtres */}
      <SectionCard
        title='Historique de mes enrôlements'
        action={
          <Box
            component='button'
            onClick={openFilters}
            aria-label='Filtre'
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              height: 36, px: 0.5, background: 'transparent', cursor: 'pointer',
              border: 'none', borderBottom: '2px solid',
              borderBottomColor: isFiltered ? 'primary.main' : 'divider',
              color: isFiltered ? 'primary.main' : 'text.secondary',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
              transition: 'border-color .15s, color .15s', '&:hover': { borderBottomColor: 'primary.main', color: 'primary.main' }
            }}
          >
            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z' />
            </svg>
            Filtre
            {isFiltered && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'primary.main', ml: 0.25 }} />}
          </Box>
        }
      >
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={e => e.id}
          empty={{ icon: 'tabler-building-store', label: 'Aucun marchand' }}
        />
      </SectionCard>

      {/* Modal de filtres */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fullWidth
        maxWidth='xs'
        slotProps={{ paper: { sx: { borderRadius: '10px' } } }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke={theme.palette.primary.main} strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z' />
            </svg>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>Filtrer</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, '& > *': { width: '100%' } }}>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>Recherche</Typography>
              <SearchInput value={dQuery} onChange={setDQuery} placeholder='Rechercher un marchand' minWidth={0} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>Statut</Typography>
              <SelectFilter value={dStatus} onChange={setDStatus} options={[{ value: '', label: 'Statut : tous' }, { value: 'activated', label: 'Activé' }, { value: 'pending', label: 'En attente' }]} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>Période</Typography>
              <DateRangeFilter from={dFrom} to={dTo} onFrom={setDFrom} onTo={setDTo} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
            <Button onClick={resetFilters} disableElevation sx={{ flex: 1, height: 38, borderRadius: '6px', textTransform: 'none', color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              Réinitialiser
            </Button>
            <Button onClick={applyFilters} disableElevation variant='contained' sx={{ flex: 1, height: 38, borderRadius: '6px', textTransform: 'none' }}>
              Appliquer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </PageContainer>
  )
}
