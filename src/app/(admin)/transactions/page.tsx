'use client'

import { useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { toast } from 'react-toastify'

import PageContainer from '@/components/PageContainer'
import { StatusPill, StatCard, SearchInput, SelectFilter, DateRangeFilter, ResetButton, RefreshButton } from '@/components/ui'
import {
  normalizePaymentStatus,
  transactionMonitoringService,
  type PaymentStatus,
  type TransactionStats,
  type UpdatablePaymentStatus,
  type YoyoTransaction
} from '@/services/transaction-monitoring.service'
import { paymentMonitoringService, type PaymentOverviewStats, type YoyoPayment } from '@/services/payment-monitoring.service'

const ResponsivePie = dynamic(() => import('@nivo/pie').then(m => m.ResponsivePie), { ssr: false })

const partnerStatusMeta: Record<string, { label: string; palette: 'success' | 'warning' | 'error' | 'info' | 'secondary' }> = {
  pending: { label: 'En attente', palette: 'warning' },
  success: { label: 'Réussi', palette: 'success' },
  failed: { label: 'Échec', palette: 'error' },
  refunded: { label: 'Remboursé', palette: 'info' },
  expired: { label: 'Expiré', palette: 'secondary' },
  cancelled: { label: 'Annulé', palette: 'secondary' },
  rejected: { label: 'Rejeté', palette: 'error' }
}

function paymentClientLabel(p: YoyoPayment) {
  const c = p.from

  if (!c || typeof c === 'string') return '-'

  const name = `${c.firstname || ''} ${c.lastname || ''}`.trim()

  return name || c.email || c.contact || '-'
}

function paymentClientEmail(p: YoyoPayment) {
  const c = p.from

  if (!c || typeof c === 'string') return ''

  return c.email || c.contact || ''
}

function paymentPartnerLabel(p: YoyoPayment) {
  const t = p.to

  if (!t || typeof t === 'string') return '-'

  return t.name || '-'
}

const paymentStatusOptions: Array<{ value: PaymentStatus; label: string; updatable: boolean }> = [
  { value: 'pending', label: 'En attente', updatable: true },
  { value: 'initiated', label: 'Initié', updatable: false },
  { value: 'success', label: 'Réussi', updatable: true },
  { value: 'failed', label: 'Échec', updatable: true },
  { value: 'refunded', label: 'Remboursé', updatable: true },
  { value: 'expired', label: 'Expiré', updatable: true },
  { value: 'cancelled', label: 'Annulé', updatable: true }
]

const statusPalette: Record<string, 'success' | 'warning' | 'error' | 'info' | 'secondary'> = {
  pending: 'warning',
  initiated: 'info',
  success: 'success',
  failed: 'error',
  refunded: 'info',
  expired: 'secondary',
  cancelled: 'secondary'
}

function paymentStatusLabel(status?: string) {
  const normalized = normalizePaymentStatus(status)

  return paymentStatusOptions.find(option => option.value === normalized)?.label || 'En attente'
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

function formatDate(value?: string) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatCurrency(value?: number, currency = 'XOF') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value || 0)
}

function transactionUserLabel(item: YoyoTransaction) {
  const user = item.user

  if (!user) return '-'
  if (typeof user === 'string') return user

  const name = `${user.firstname || ''} ${user.lastname || ''}`.trim()

  if (name) return name

  return user.email || user.contact || '-'
}

function transactionUserEmail(item: YoyoTransaction) {
  const user = item.user

  if (!user || typeof user === 'string') return ''

  return user.email || user.contact || ''
}

export default function TransactionsPage() {
  const theme = useTheme()
  const [rows, setRows] = useState<YoyoTransaction[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [orderBy, setOrderBy] = useState<'amount' | 'createdAt'>('createdAt')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TransactionStats | null>(null)

  // Onglet : 0 = Abonnements, 1 = Paiements partenaires
  const [tab, setTab] = useState(0)

  // Paiements partenaires
  const [pRows, setPRows] = useState<YoyoPayment[]>([])
  const [pTotalRows, setPTotalRows] = useState(0)
  const [pPage, setPPage] = useState(0)
  const [pRowsPerPage, setPRowsPerPage] = useState(10)
  const [pQuery, setPQuery] = useState('')
  const [pStatus, setPStatus] = useState('')
  const [pFrom, setPFrom] = useState('')
  const [pTo, setPTo] = useState('')
  const [pLoading, setPLoading] = useState(true)
  const [pError, setPError] = useState<string | null>(null)
  const [pStats, setPStats] = useState<PaymentOverviewStats | null>(null)

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize: rowsPerPage,
      paymentStatus: status || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
      q: query || undefined
    }),
    [page, rowsPerPage, status, dateFrom, dateTo, query]
  )

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [listResult, statsResult] = await Promise.all([
        transactionMonitoringService.list(queryParams),
        transactionMonitoringService.getStats({
          paymentStatus: status || undefined,
          from: dateFrom || undefined,
          to: dateTo || undefined,
          q: query || undefined
        })
      ])

      setRows(listResult.rows)
      setTotalRows(listResult.meta.totalRows)
      setStats(statsResult)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [queryParams])

  const pQueryParams = useMemo(
    () => ({
      page: pPage + 1,
      pageSize: pRowsPerPage,
      status: pStatus || undefined,
      from: pFrom || undefined,
      to: pTo || undefined,
      q: pQuery || undefined
    }),
    [pPage, pRowsPerPage, pStatus, pFrom, pTo, pQuery]
  )

  const loadPayments = async () => {
    try {
      setPLoading(true)
      setPError(null)

      const [res, overview] = await Promise.all([
        paymentMonitoringService.list(pQueryParams),
        paymentMonitoringService.getOverview({ status: pStatus || undefined, from: pFrom || undefined, to: pTo || undefined, q: pQuery || undefined })
      ])

      setPRows(res.rows)
      setPTotalRows(res.meta.totalRows)
      setPStats(overview)
    } catch (err: any) {
      setPError(err.message || 'Impossible de charger les paiements partenaires')
    } finally {
      setPLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 1) loadPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, pQueryParams])

  const handleUpdatePaymentStatus = async (row: YoyoTransaction, paymentStatus: PaymentStatus) => {
    const currentStatus = normalizePaymentStatus(row.paymentStatus)
    const selectedOption = paymentStatusOptions.find(option => option.value === paymentStatus)

    if (!row._id || currentStatus === paymentStatus || !selectedOption?.updatable) return

    try {
      await transactionMonitoringService.updatePaymentStatus(row._id, paymentStatus as UpdatablePaymentStatus)
      toast.success('Statut de paiement mis à jour')
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Mise à jour impossible')
    }
  }

  const visibleRows = useMemo(() => {
    const arr = [...rows]

    arr.sort((a, b) => {
      const va = orderBy === 'amount' ? a.amount || 0 : new Date(a.createdAt || a.paymentDate || 0).getTime()
      const vb = orderBy === 'amount' ? b.amount || 0 : new Date(b.createdAt || b.paymentDate || 0).getTime()

      if (vb < va) return order === 'desc' ? -1 : 1
      if (vb > va) return order === 'desc' ? 1 : -1

      return 0
    })

    return arr
  }, [rows, order, orderBy])

  const handleRequestSort = (property: 'amount' | 'createdAt') => {
    const isAsc = orderBy === property && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const statCards = stats
    ? [
        { label: 'Total', value: String(stats.totalTransactions), caption: 'Transactions', icon: 'tabler-receipt-2', palette: 'primary' as const },
        { label: 'Réussies', value: String(stats.successfulTransactions), caption: 'Paiements validés', icon: 'tabler-circle-check', palette: 'success' as const },
        { label: 'En attente', value: String(stats.pendingTransactions), caption: 'À traiter', icon: 'tabler-clock', palette: 'warning' as const },
        { label: 'Échecs', value: String(stats.failedTransactions), caption: 'Paiements échoués', icon: 'tabler-alert-triangle', palette: 'error' as const },
        { label: 'Montant', value: formatCurrency(stats.totalAmount), caption: 'Volume encaissé', icon: 'tabler-cash-banknote', palette: 'info' as const }
      ]
    : []

  const softBtn = {
    height: 40,
    borderRadius: 0,
    fontWeight: 700,
    textTransform: 'none' as const,
    px: 2,
    color: 'primary.main',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) }
  }

  const isFiltered = Boolean(query) || Boolean(status) || Boolean(dateFrom) || Boolean(dateTo)

  const Pill = StatusPill

  const DonutPanel = ({ title, data }: { title: string; data: Array<{ id: string; value: number; color: string }> }) => (
    <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', height: { xs: 360, lg: '100%' }, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary', mb: 1 }}>{title}</Typography>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          {data.every(d => d.value === 0) ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' }}>
              <i className='tabler-chart-donut text-4xl' />
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucune donnée</Typography>
            </Box>
          ) : (
            <ResponsivePie
              data={data}
              colors={{ datum: 'data.color' }}
              margin={{ top: 16, right: 16, bottom: 52, left: 16 }}
              innerRadius={0.62}
              padAngle={0.6}
              cornerRadius={2}
              activeOuterRadiusOffset={8}
              borderWidth={0}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={14}
              arcLabelsTextColor='#ffffff'
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  translateY: 46,
                  itemWidth: 74,
                  itemHeight: 16,
                  itemsSpacing: 2,
                  symbolShape: 'circle',
                  symbolSize: 9,
                  itemTextColor: theme.palette.text.secondary
                }
              ]}
              theme={{
                text: { fill: theme.palette.text.secondary, fontWeight: 700 },
                tooltip: { container: { fontSize: 12, fontWeight: 700 } }
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )

  const subsDonut = [
    { id: 'Réussies', value: stats?.successfulTransactions || 0, color: theme.palette.success.main },
    { id: 'En attente', value: stats?.pendingTransactions || 0, color: theme.palette.warning.main },
    { id: 'Échecs', value: stats?.failedTransactions || 0, color: theme.palette.error.main }
  ]

  const payDonut = [
    { id: 'Réussis', value: pStats?.successCount || 0, color: theme.palette.success.main },
    { id: 'En attente', value: pStats?.pendingCount || 0, color: theme.palette.warning.main },
    { id: 'Échecs', value: pStats?.failedCount || 0, color: theme.palette.error.main }
  ]

  return (
    <PageContainer
      title='Transactions YoYo'
      subtitle='Suivi des paiements clients et opérations de correction'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 40, p: 0.5, borderRadius: 0, backgroundColor: 'action.hover' }}>
            {['Abonnements', 'Paiements partenaires'].map((label, i) => (
              <Box
                key={label}
                role='button'
                onClick={() => setTab(i)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  px: 2,
                  borderRadius: 0,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all .15s',
                  color: tab === i ? 'primary.main' : 'text.secondary',
                  backgroundColor: tab === i ? 'background.paper' : 'transparent',
                  boxShadow: tab === i ? 'var(--mui-customShadows-xs)' : 'none'
                }}
              >
                {label}
              </Box>
            ))}
          </Box>
          <RefreshButton onClick={() => (tab === 0 ? loadData() : loadPayments())} />
        </Box>
      }
    >
      {tab === 0 && (
        <>
      {/* Cartes stats */}
      {statCards.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 3
          }}
        >
          {statCards.map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} caption={s.caption} icon={s.icon} palette={s.palette} valueFontSize={s.label === 'Montant' ? 20 : 28} />
          ))}
        </Box>
      )}

      {/* Table + chart */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' }, gap: 3, alignItems: 'stretch' }}>
      <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Toolbar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1.5,
              p: 2.5,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <SearchInput
              value={query}
              onChange={v => { setPage(0); setQuery(v) }}
              placeholder='Rechercher (client, référence, txn)'
            />

            <SelectFilter
              value={status}
              onChange={v => { setPage(0); setStatus(v) }}
              options={[{ value: '', label: 'Statut : tous' }, ...paymentStatusOptions]}
            />

            <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />

            {isFiltered && (
              <ResetButton
                onClick={() => {
                  setPage(0)
                  setQuery('')
                  setStatus('')
                  setDateFrom('')
                  setDateTo('')
                }}
              />
            )}
          </Box>

          {/* Table */}
          {loading ? (
            <Box className='flex items-center justify-center py-16'>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2.5 }}>
              <Alert severity='error'>{error}</Alert>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table
                  stickyHeader
                  sx={{
                    minWidth: 0,
                    '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider' },
                    '& td:last-of-type, & th:last-of-type': { borderRight: 'none' },
                    '& thead th': { backgroundColor: 'background.paper' }
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
                      <TableCell>Client</TableCell>
                      <TableCell>Plan</TableCell>
                      <TableCell sortDirection={orderBy === 'amount' ? order : false}>
                        <TableSortLabel active={orderBy === 'amount'} direction={orderBy === 'amount' ? order : 'asc'} onClick={() => handleRequestSort('amount')}>
                          Montant
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Paiement</TableCell>
                      <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                        <TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleRequestSort('createdAt')}>
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Mettre à jour</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <i className='tabler-receipt-2 text-4xl' />
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucune transaction trouvée</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map(row => {
                        const normalizedStatus = normalizePaymentStatus(row.paymentStatus)
                        const name = transactionUserLabel(row)
                        const email = transactionUserEmail(row)

                        return (
                          <TableRow key={row._id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 36, height: 36, fontSize: 12.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>
                                  {initials(name)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>
                                    {name}
                                  </Typography>
                                  {email && (
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                                      {email}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 130 }}>
                              <Typography sx={{ fontSize: 13, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {typeof row.plan === 'string' ? row.plan : row.plan?.name || row.plan?.label || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 13.5, fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}>
                              {formatCurrency(row.amount, row.currency || 'XOF')}
                            </TableCell>
                            <TableCell>
                              <Pill label={paymentStatusLabel(normalizedStatus)} palette={statusPalette[normalizedStatus] || 'secondary'} />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {formatDate(row.createdAt || row.paymentDate)}
                            </TableCell>
                            <TableCell>
                              <Box
                                component='select'
                                value={normalizedStatus}
                                onChange={(e: any) => handleUpdatePaymentStatus(row, e.target.value as PaymentStatus)}
                                sx={{
                                  height: 34,
                                  width: 118,
                                  px: 1,
                                  borderRadius: 0,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  backgroundColor: 'background.paper',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  fontFamily: 'inherit',
                                  color: 'var(--mui-palette-text-primary)',
                                  cursor: 'pointer',
                                  outline: 'none'
                                }}
                              >
                                {paymentStatusOptions.map(option => (
                                  <option key={option.value} value={option.value} disabled={!option.updatable}>
                                    {option.label}
                                  </option>
                                ))}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component='div'
                count={totalRows}
                page={page}
                onPageChange={(_event, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={event => {
                  setPage(0)
                  setRowsPerPage(Number(event.target.value))
                }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>
      <DonutPanel title='Répartition des paiements' data={subsDonut} />
      </Box>
        </>
      )}

      {/* ---------------- Onglet Paiements partenaires ---------------- */}
      {tab === 1 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' }, gap: 3, alignItems: 'stretch' }}>
        <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Toolbar */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <SearchInput
                value={pQuery}
                onChange={v => { setPPage(0); setPQuery(v) }}
                placeholder='Rechercher (client, partenaire)'
              />

              <SelectFilter
                value={pStatus}
                onChange={v => { setPPage(0); setPStatus(v) }}
                options={[
                  { value: '', label: 'Statut : tous' },
                  ...Object.entries(partnerStatusMeta).map(([value, m]) => ({ value, label: m.label }))
                ]}
              />

              <DateRangeFilter from={pFrom} to={pTo} onFrom={setPFrom} onTo={setPTo} />

              {(pQuery || pStatus || pFrom || pTo) && (
                <ResetButton
                  onClick={() => {
                    setPPage(0)
                    setPQuery('')
                    setPStatus('')
                    setPFrom('')
                    setPTo('')
                  }}
                />
              )}
            </Box>

            {pLoading ? (
              <Box className='flex items-center justify-center py-16'>
                <CircularProgress />
              </Box>
            ) : pError ? (
              <Box sx={{ p: 2.5 }}>
                <Alert severity='error'>{pError}</Alert>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table
                    stickyHeader
                    sx={{
                      minWidth: 0,
                      '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider', paddingInline: '12px' },
                      '& td:last-of-type, & th:last-of-type': { borderRight: 'none' },
                      '& thead th': { backgroundColor: 'background.paper' }
                    }}
                  >
                    <TableHead>
                      <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
                        <TableCell>Client</TableCell>
                        <TableCell>Partenaire</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Réduction</TableCell>
                        <TableCell>Statut</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                              <i className='tabler-cash-banknote text-4xl' />
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucun paiement partenaire</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        pRows.map(p => {
                          const meta = partnerStatusMeta[p.status || ''] || { label: p.status || 'Inconnu', palette: 'secondary' as const }
                          const name = paymentClientLabel(p)
                          const email = paymentClientEmail(p)

                          return (
                            <TableRow key={p._id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar sx={{ width: 36, height: 36, fontSize: 12.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>
                                    {initials(name)}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>
                                      {name}
                                    </Typography>
                                    {email && (
                                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                                        {email}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>{paymentPartnerLabel(p)}</TableCell>
                              <TableCell sx={{ fontSize: 13.5, fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}>
                                {formatCurrency(p.amount)}
                              </TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>
                                {p.discountPercentage ? `${p.discountPercentage}%` : '-'}
                              </TableCell>
                              <TableCell>
                                <Pill label={meta.label} palette={meta.palette} />
                              </TableCell>
                              <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                {formatDate(p.completedAt || p.createdAt)}
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component='div'
                  count={pTotalRows}
                  page={pPage}
                  onPageChange={(_event, nextPage) => setPPage(nextPage)}
                  rowsPerPage={pRowsPerPage}
                  onRowsPerPageChange={event => {
                    setPPage(0)
                    setPRowsPerPage(Number(event.target.value))
                  }}
                  rowsPerPageOptions={[10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>
        <DonutPanel title='Répartition des paiements' data={payDonut} />
        </Box>
      )}
    </PageContainer>
  )
}
