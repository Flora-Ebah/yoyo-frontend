'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

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

import { ArrowLeft, Phone, Mail, MapPin, Tag, Percent, ShoppingCart, CalendarDays } from 'lucide-react'

import PageContainer from '@/components/PageContainer'
import {
  StatCard,
  StatCardGrid,
  StatusPill,
  SectionCard,
  DataTable,
  SelectFilter,
  DateRangeFilter,
  FilterModal,
  FilterField,
  type Column,
  type UiPalette
} from '@/components/ui'
import { proManagementService, type YoyoPro, type ProStats } from '@/services/pro-management.service'
import { paymentMonitoringService, type YoyoPayment } from '@/services/payment-monitoring.service'

const statusMeta: Record<string, { label: string; palette: UiPalette }> = {
  active: { label: 'Actif', palette: 'success' },
  inactive: { label: 'Inactif', palette: 'secondary' },
  suspended: { label: 'Suspendu', palette: 'warning' },
  removed: { label: 'Retiré', palette: 'error' }
}

const paymentStatusMeta: Record<string, { label: string; palette: UiPalette }> = {
  success: { label: 'Réussi', palette: 'success' },
  pending: { label: 'En attente', palette: 'warning' },
  failed: { label: 'Échoué', palette: 'error' },
  refunded: { label: 'Remboursé', palette: 'info' },
  expired: { label: 'Expiré', palette: 'secondary' },
  cancelled: { label: 'Annulé', palette: 'secondary' },
  rejected: { label: 'Rejeté', palette: 'error' }
}

function formatMoney(value?: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value || 0)} FCFA`
}

function formatDate(value?: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'

  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d)
}

function initials(name?: string) {
  return (name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'
}

function clientName(p: YoyoPayment) {
  if (p.from && typeof p.from === 'object') {
    const n = `${p.from.firstname || ''} ${p.from.lastname || ''}`.trim()

    return n || p.from.email || p.from.contact || '-'
  }

  return '-'
}

export default function ProDetailPage() {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  const [pro, setPro] = useState<YoyoPro | null>(null)
  const [stats, setStats] = useState<ProStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paiements (pagination serveur, filtrés par partenaire)
  const [payments, setPayments] = useState<YoyoPayment[]>([])
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [payLoading, setPayLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const isFiltered = Boolean(status) || Boolean(dateFrom) || Boolean(dateTo)

  useEffect(() => {
    if (!id) return
    let active = true

    setLoading(true)
    Promise.all([proManagementService.getById(id), proManagementService.getStats(id).catch(() => null)])
      .then(([p, s]) => {
        if (!active) return
        setPro(p)
        setStats(s)
        setError(null)
      })
      .catch((err: any) => { if (active) setError(err?.message || 'Impossible de charger le partenaire') })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [id])

  const loadPayments = useCallback(() => {
    if (!id) return
    setPayLoading(true)
    paymentMonitoringService
      .list({ partner: id, page: page + 1, pageSize: rowsPerPage, status: status || undefined, from: dateFrom || undefined, to: dateTo || undefined })
      .then(res => { setPayments(res.rows); setPaymentsTotal(res.meta.totalRows) })
      .catch(() => { setPayments([]); setPaymentsTotal(0) })
      .finally(() => setPayLoading(false))
  }, [id, page, rowsPerPage, status, dateFrom, dateTo])

  useEffect(() => { loadPayments() }, [loadPayments])

  const columns: Column<YoyoPayment>[] = useMemo(() => [
    {
      key: 'client',
      header: 'Client',
      render: p => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>{initials(clientName(p))}</Avatar>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }} noWrap>{clientName(p)}</Typography>
        </Box>
      )
    },
    { key: 'amount', header: 'Montant', align: 'right', render: p => <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap' }}>{formatMoney(p.amount)}</Typography> },
    { key: 'discount', header: 'Remise', align: 'right', render: p => <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{p.discountPercentage ? `${p.discountPercentage}%` : '-'}</Typography> },
    { key: 'status', header: 'Statut', render: p => { const m = paymentStatusMeta[p.status || ''] || { label: p.status || '—', palette: 'secondary' as UiPalette }; return <StatusPill label={m.label} palette={m.palette} /> } },
    { key: 'date', header: 'Date', render: p => <Typography sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</Typography> }
  ], [theme])

  const changeStatus = async (next: 'active' | 'suspended') => {
    if (!pro) return

    try {
      await proManagementService.updateStatus(pro._id, next)
      setPro({ ...pro, status: next })
    } catch {
      /* silencieux : l'UI reste sur l'ancien statut */
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <Box className='flex items-center justify-center' sx={{ minHeight: '50vh' }}><CircularProgress /></Box>
      </PageContainer>
    )
  }

  if (error || !pro) {
    return (
      <PageContainer title='Partenaire'>
        <Alert severity='error' sx={{ mb: 2 }}>{error || 'Partenaire introuvable'}</Alert>
        <Button onClick={() => router.push('/pros')} disableElevation variant='contained' sx={{ textTransform: 'none' }}>Retour à la liste</Button>
      </PageContainer>
    )
  }

  const meta = statusMeta[pro.status || ''] || { label: pro.status || 'Inconnu', palette: 'secondary' as UiPalette }
  const category = pro.categories?.[0]?.name || '-'

  const InfoRow = ({ icon: Icon, k, v }: { icon: any; k: string; v: string }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderBottom: '1px dashed', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <Box sx={{ width: 34, height: 34, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
        <Icon size={17} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{k}</Typography>
        <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary', overflowWrap: 'anywhere' }}>{v}</Typography>
      </Box>
    </Box>
  )

  return (
    <PageContainer>
      {/* Retour */}
      <Box
        component='button'
        onClick={() => router.push('/pros')}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mb: 2, px: 1.5, height: 34, border: 'none', cursor: 'pointer', backgroundColor: 'action.hover', color: 'text.secondary', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) } }}
      >
        <ArrowLeft size={16} /> Retour aux partenaires
      </Box>

      {/* En-tête partenaire */}
      <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', mb: 3 }}>
        <Box sx={{ height: 64, backgroundColor: alpha(theme.palette.primary.main, 0.4) }} />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 2, flexWrap: 'wrap' }}>
            <Avatar
              src={pro.photos?.[0] || pro.thumbnail || undefined}
              sx={{ width: 84, height: 84, mt: '-42px', fontSize: 28, fontWeight: 800, color: 'primary.main', backgroundColor: 'background.paper', borderRadius: 0, boxShadow: `0 0 0 3px ${theme.palette.background.paper}, 0 0 0 4px ${theme.palette.divider}` }}
            >
              {initials(pro.name)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0, pt: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }} noWrap>{pro.name}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <StatusPill label={meta.label} palette={meta.palette} />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{pro.ville || '—'} · {category}</Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
              {pro.status !== 'active' && (
                <Button onClick={() => changeStatus('active')} disableElevation variant='contained' color='success' sx={{ height: 36, textTransform: 'none', px: 2 }}>Activer</Button>
              )}
              {pro.status === 'active' && (
                <Button onClick={() => changeStatus('suspended')} disableElevation sx={{ height: 36, textTransform: 'none', px: 2, color: 'warning.main', backgroundColor: alpha(theme.palette.warning.main, 0.12), '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.2) } }}>Suspendre</Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Widgets stats */}
      <Box sx={{ mb: 3 }}>
        <StatCardGrid>
          <StatCard label='Revenu total' value={formatMoney(stats?.totalRevenue)} caption='Volume encaissé' icon='tabler-cash' palette='primary' valueFontSize={22} />
          <StatCard label='Remise cumulée' value={formatMoney(stats?.totalDiscount)} caption='Réductions accordées' icon='tabler-discount' palette='info' valueFontSize={22} />
          <StatCard label='Paiements réussis' value={stats?.successCount ?? 0} caption='Transactions abouties' icon='tabler-circle-check' palette='success' />
          <StatCard label='En attente' value={stats?.pendingCount ?? 0} caption='À finaliser' icon='tabler-clock' palette='warning' />
        </StatCardGrid>
      </Box>

      {/* Infos + Paiements */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        {/* Informations */}
        <SectionCard title='Informations'>
          <Box sx={{ px: 2.5, py: 1 }}>
            <InfoRow icon={Phone} k='Téléphone' v={pro.phone || '-'} />
            <InfoRow icon={Mail} k='E-mail' v={pro.email || '-'} />
            <InfoRow icon={MapPin} k='Adresse' v={pro.address || pro.ville || '-'} />
            <InfoRow icon={Tag} k='Catégorie' v={category} />
            <InfoRow icon={Percent} k='Remise maximale' v={pro.maxDiscount != null ? `${pro.maxDiscount}%` : '-'} />
            <InfoRow icon={ShoppingCart} k='Commande minimum' v={pro.minOrder != null ? formatMoney(pro.minOrder) : '-'} />
            <InfoRow icon={CalendarDays} k='Créé le' v={formatDate(pro.createdAt)} />
          </Box>
        </SectionCard>

        {/* Paiements */}
        <SectionCard
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, width: '100%' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary' }}>Paiements reçus</Typography>
              <FilterModal
                active={isFiltered}
                onApply={() => {}}
                onReset={() => { setPage(0); setStatus(''); setDateFrom(''); setDateTo('') }}
                subtitle='Affinez les paiements de ce partenaire.'
              >
                <FilterField label='Statut'>
                  <SelectFilter
                    value={status}
                    onChange={v => { setPage(0); setStatus(v) }}
                    options={[{ value: '', label: 'Statut : tous' }, ...Object.entries(paymentStatusMeta).map(([value, m]) => ({ value, label: m.label }))]}
                  />
                </FilterField>
                <FilterField label='Période'>
                  <DateRangeFilter from={dateFrom} to={dateTo} onFrom={v => { setPage(0); setDateFrom(v) }} onTo={v => { setPage(0); setDateTo(v) }} />
                </FilterField>
              </FilterModal>
            </Box>
          }
        >
          {payLoading ? (
            <Box className='flex items-center justify-center py-12'><CircularProgress size={24} /></Box>
          ) : (
            <DataTable
              columns={columns}
              rows={payments}
              getRowKey={p => p._id}
              empty={{ icon: 'tabler-receipt', label: 'Aucun paiement' }}
              pagination={{
                count: paymentsTotal,
                page,
                rowsPerPage,
                onPageChange: setPage,
                onRowsPerPageChange: rpp => { setRowsPerPage(rpp); setPage(0) }
              }}
            />
          )}
        </SectionCard>
      </Box>
    </PageContainer>
  )
}
