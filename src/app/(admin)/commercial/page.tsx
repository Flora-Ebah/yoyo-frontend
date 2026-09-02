'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { useSession } from '@/hooks/useSession'
import { AddIcon, StatCard, StatCardGrid, StatusPill, SectionCard, DataTable, FilterBar, SearchInput, SelectFilter, DateRangeFilter, ResetButton, type Column, type UiPalette } from '@/components/ui'
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

  const agentName = `${session?.user?.firstname || ''} ${session?.user?.lastname || ''}`.trim() || session?.user?.username || 'Commercial'

  // Le commercial ne voit QUE ses enrôlements : le backend l'impose via scope=me (créateur = soi).
  const [mine, setMine] = useState<Enrolment[]>([])

  useEffect(() => {
    let active = true

    enrolmentService
      .list({ scope: 'me', pageSize: 500 })
      .then(rows => { if (active) setMine(rows) })
      .catch(() => { if (active) setMine([]) })

    return () => { active = false }
  }, [])

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

  const softBtn = {
    height: 36, borderRadius: '6px', textTransform: 'none' as const, px: 2,
    color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.1), '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) }
  }

  const isFiltered = Boolean(query) || Boolean(status) || Boolean(dateFrom) || Boolean(dateTo)

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
          <Button disableElevation sx={softBtn}>
            Actualiser
          </Button>
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
          <FilterBar>
            <SearchInput value={query} onChange={setQuery} placeholder='Rechercher un marchand' />
            <SelectFilter value={status} onChange={setStatus} options={[{ value: '', label: 'Statut : tous' }, { value: 'activated', label: 'Activé' }, { value: 'pending', label: 'En attente' }]} />
            <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
            {isFiltered && <ResetButton onClick={() => { setQuery(''); setStatus(''); setDateFrom(''); setDateTo('') }} />}
          </FilterBar>
        }
      >
        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={e => e.id}
          empty={{ icon: 'tabler-building-store', label: 'Aucun marchand' }}
        />
      </SectionCard>
    </PageContainer>
  )
}
