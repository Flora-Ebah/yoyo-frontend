'use client'

import type { ChangeEvent } from 'react'
import { StatusPill, AddIcon, RowActions, SearchInput, SelectFilter, DateRangeFilter, FilterModal, FilterField } from '@/components/ui'
import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'

import { toast } from 'react-toastify'
import { Eye, CircleCheck, AlertTriangle, Mail, Phone, MapPin, Tag, Percent, CalendarDays, FileText } from 'lucide-react'

import { useRouter } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import { usePermissions } from '@/hooks/usePermissions'
import { proManagementService, type ProStats, type ProStatus, type YoyoPro } from '@/services/pro-management.service'

function formatFCFA(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(value || 0)
}

const statusOptions = ['', 'active', 'inactive', 'suspended', 'removed', 'archived'] as const

const statusMeta: Record<string, { label: string; palette: 'success' | 'warning' | 'error' | 'info' | 'secondary' }> = {
  active: { label: 'Actif', palette: 'success' },
  inactive: { label: 'Inactif', palette: 'secondary' },
  suspended: { label: 'Suspendu', palette: 'warning' },
  removed: { label: 'Retiré', palette: 'error' },
  archived: { label: 'Archivé', palette: 'info' }
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

function categoriesLabel(partner: YoyoPro) {
  const labels = (partner.categories || []).map(item => item.name || item._id).filter(Boolean)

  return labels.length > 0 ? labels.join(', ') : '-'
}

export default function ProsPage() {
  const theme = useTheme()
  // Sur mobile/tablette (< lg), le détail s'ouvre dans un drawer au lieu de s'afficher sous le tableau.
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'))
  const { can } = usePermissions()
  const router = useRouter()
  const [rows, setRows] = useState<YoyoPro[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = useState<'name' | 'status' | 'createdAt'>('createdAt')
  const [selected, setSelected] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [selectedPro, setSelectedPro] = useState<YoyoPro | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailStats, setDetailStats] = useState<ProStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize: rowsPerPage,
      status: status || undefined,
      q: query || undefined
    }),
    [page, rowsPerPage, status, query]
  )

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await proManagementService.list(queryParams)

      setRows(response.rows)
      setTotalRows(response.meta.totalRows)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la liste des professionnels.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [queryParams])

  const handleOpenDetails = async (partner: YoyoPro) => {
    setSelectedPro(partner)
    setDetailsLoading(true)
    setDetailStats(null)
    setStatsLoading(true)

    try {
      const details = await proManagementService.getById(partner._id)

      setSelectedPro(details)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement des détails')
    } finally {
      setDetailsLoading(false)
    }

    try {
      const s = await proManagementService.getStats(partner._id)

      setDetailStats(s)
    } catch {
      setDetailStats(null)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleChangeStatus = async (partner: YoyoPro, nextStatus: ProStatus) => {
    try {
      await proManagementService.updateStatus(partner._id, nextStatus)
      toast.success('Statut du professionnel mis à jour')
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Impossible de modifier le statut')
    }
  }

  const handleRemove = async (partner: YoyoPro) => {
    const confirmed = window.confirm(`Supprimer le professionnel "${partner.name}" ?`)

    if (!confirmed) return

    try {
      await proManagementService.remove(partner._id)
      toast.success('Professionnel supprimé')
      setSelectedPro(prev => (prev?._id === partner._id ? null : prev))
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression')
    }
  }

  const sortValue = (c: YoyoPro): string | number =>
    orderBy === 'name'
      ? (c.name || '').toLowerCase()
      : orderBy === 'status'
        ? c.status || ''
        : new Date(c.createdAt || 0).getTime()

  const visibleRows = useMemo(() => {
    const fromTs = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null
    const toTs = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null

    const arr = rows.filter(c => {
      if (!fromTs && !toTs) return true
      const ts = new Date(c.createdAt || 0).getTime()

      if (fromTs && ts < fromTs) return false
      if (toTs && ts > toTs) return false

      return true
    })

    arr.sort((a, b) => {
      const va = sortValue(a)
      const vb = sortValue(b)

      if (vb < va) return order === 'desc' ? -1 : 1
      if (vb > va) return order === 'desc' ? 1 : -1

      return 0
    })

    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, order, orderBy, dateFrom, dateTo])

  const proStats = [
    {
      label: 'Total pros',
      value: totalRows,
      caption: 'Partenaires enregistrés',
      icon: 'tabler-building-store',
      palette: 'primary' as const
    },
    {
      label: 'Actifs',
      value: rows.filter(r => r.status === 'active').length,
      caption: 'Comptes actifs',
      icon: 'tabler-circle-check',
      palette: 'success' as const
    },
    {
      label: 'Suspendus',
      value: rows.filter(r => r.status === 'suspended').length,
      caption: 'Accès suspendu',
      icon: 'tabler-alert-triangle',
      palette: 'warning' as const
    },
    {
      label: 'Villes',
      value: new Set(rows.map(r => r.ville).filter(Boolean)).size,
      caption: 'Villes couvertes',
      icon: 'tabler-map-pin',
      palette: 'info' as const
    }
  ]

  const handleRequestSort = (property: 'name' | 'status' | 'createdAt') => {
    const isAsc = orderBy === property && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const allSelected = rows.length > 0 && selected.length === rows.length
  const someSelected = selected.length > 0 && selected.length < rows.length

  const handleSelectAll = (e: ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? rows.map(r => r._id) : [])
  }

  const toggleRow = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  const bulkSuspend = async () => {
    if (!selected.length) return

    try {
      await Promise.all(selected.map(id => proManagementService.updateStatus(id, 'suspended')))
      toast.success('Professionnels suspendus')
      setSelected([])
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Échec de la suspension')
    }
  }

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

  return (
    <PageContainer
      title='Professionnels YoYo'
      subtitle='Suivi des partenaires, activation et modération de comptes pro'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {can('create', 'pros') && (
            <Button
              onClick={() => router.push('/pros/nouveau?next=/pros')}
              disableElevation
              variant='contained'
              sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2 }}
            >
              Nouveau marchand
            </Button>
          )}
          <Button onClick={loadData} disableElevation sx={softBtn}>
            Actualiser
          </Button>
        </Box>
      }
    >
      {/* Cartes stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
        {proStats.map(s => {
          const color = theme.palette[s.palette].main

          return (
            <Card key={s.label} sx={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
              <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>{s.label}</Typography>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      borderRadius: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color,
                      backgroundColor: alpha(color, 0.14)
                    }}
                  >
                    <i className={`${s.icon} text-xl`} />
                  </Box>
                </Box>
                <Typography sx={{ fontSize: 28, fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }} noWrap>
                  {s.caption}
                </Typography>
              </CardContent>
            </Card>
          )
        })}
      </Box>

      {/* Split : table + détails */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: selectedPro ? 'minmax(0, 1fr) 380px' : '1fr' },
          gap: 3,
          alignItems: 'stretch'
        }}
      >
        <Card
          sx={{
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            height: selectedPro ? { lg: 640 } : 'auto',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Toolbar */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
                p: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: selected.length > 0 ? alpha(theme.palette.primary.main, 0.06) : 'transparent'
              }}
            >
              {selected.length > 0 ? (
                <>
                  <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 800, color: 'text.primary' }}>
                    {selected.length} sélectionné(s)
                  </Typography>
                  <Button onClick={bulkSuspend} disableElevation sx={{ ...softBtn, color: 'warning.main', backgroundColor: alpha(theme.palette.warning.main, 0.1), '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.18) } }}>
                    Suspendre
                  </Button>
                  <Button
                    onClick={() => setSelected([])}
                    disableElevation
                    sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}
                  >
                    Effacer
                  </Button>
                </>
              ) : (
                <>
                  <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 800, color: 'text.primary' }}>Professionnels</Typography>
                <FilterModal
                  active={isFiltered}
                  onApply={() => {}}
                  onReset={() => { setPage(0); setQuery(''); setStatus(''); setDateFrom(''); setDateTo('') }}
                  subtitle='Affinez la liste des pros.'
                >
                  <FilterField label='Recherche'>
                    <SearchInput value={query} onChange={v => { setPage(0); setQuery(v) }} placeholder='Rechercher un pro (nom, ville, email)' minWidth={0} />
                  </FilterField>
                  <FilterField label='Statut'>
                    <SelectFilter
                      value={status}
                      onChange={v => { setPage(0); setStatus(v) }}
                      options={[
                        { value: '', label: 'Statut : tous' },
                        ...statusOptions.filter(Boolean).map(item => ({ value: item, label: statusMeta[item]?.label || item }))
                      ]}
                    />
                  </FilterField>
                  <FilterField label='Période'>
                    <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
                  </FilterField>
                </FilterModal>
                </>
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
                <TableContainer sx={{ overflowX: 'auto', flex: 1, minHeight: 0 }}>
                  <Table
                    stickyHeader
                    sx={{
                      minWidth: 820,
                      '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider' },
                      '& td:last-of-type, & th:last-of-type': { borderRight: 'none' },
                      '& thead th': { backgroundColor: 'background.paper' }
                    }}
                  >
                    <TableHead>
                      <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
                        <TableCell padding='checkbox'>
                          <Checkbox size='small' indeterminate={someSelected} checked={allSelected} onChange={handleSelectAll} />
                        </TableCell>
                        <TableCell sortDirection={orderBy === 'name' ? order : false}>
                          <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleRequestSort('name')}>
                            Professionnel
                          </TableSortLabel>
                        </TableCell>
                        <TableCell>Ville</TableCell>
                        <TableCell>Remise</TableCell>
                        <TableCell sortDirection={orderBy === 'status' ? order : false}>
                          <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')}>
                            Statut
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                          <TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleRequestSort('createdAt')}>
                            Création
                          </TableSortLabel>
                        </TableCell>
                        {!selectedPro && <TableCell align='right'>Actions</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={selectedPro ? 6 : 7} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                              <i className='tabler-building-store text-4xl' />
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucun professionnel trouvé</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        visibleRows.map(partner => {
                          const meta = statusMeta[partner.status || ''] || { label: partner.status || 'Inconnu', palette: 'secondary' as const }
                          const isSel = selected.includes(partner._id)

                          return (
                            <TableRow
                              key={partner._id}
                              hover
                              selected={isSel}
                              onClick={() => handleOpenDetails(partner)}
                              sx={{
                                cursor: 'pointer',
                                '& td': { borderColor: 'divider' },
                                ...(selectedPro?._id === partner._id && { backgroundColor: alpha(theme.palette.primary.main, 0.08) })
                              }}
                            >
                              <TableCell padding='checkbox' onClick={e => e.stopPropagation()}>
                                <Checkbox size='small' checked={isSel} onChange={() => toggleRow(partner._id)} />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                  <Avatar
                                    src={partner.photos?.[0] || undefined}
                                    sx={{ width: 38, height: 38, fontSize: 13, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}
                                  >
                                    {initials(partner.name || '?')}
                                  </Avatar>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>
                                      {partner.name || '-'}
                                    </Typography>
                                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                                      {partner.email || partner.phone || '-'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'text.primary' }}>{partner.ville || '-'}</TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'text.primary' }}>
                                {typeof partner.maxDiscount === 'number' ? `${partner.maxDiscount}%` : '-'}
                              </TableCell>
                              <TableCell>
                                <Pill label={meta.label} palette={meta.palette} />
                              </TableCell>
                              <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                {formatDate(partner.createdAt)}
                              </TableCell>
                              {!selectedPro && (
                              <TableCell align='right' sx={{ whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                                <RowActions
                                  actions={[
                                    { label: 'Voir', color: 'info', onClick: () => handleOpenDetails(partner) },
                                    { label: 'Activer', color: 'success', onClick: () => handleChangeStatus(partner, 'active') },
                                    { label: 'Suspendre', color: 'warning', onClick: () => handleChangeStatus(partner, 'suspended') },
                                    { label: 'Supprimer', color: 'error', onClick: () => handleRemove(partner) }
                                  ]}
                                />
                              </TableCell>
                              )}
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

        {/* Panneau détails — desktop : colonne ; mobile : drawer */}
        {selectedPro && (() => {
          const panel = (
          <Card
            sx={{
              borderRadius: 0,
              border: 'none',
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              height: { lg: 640 },
              overflow: 'hidden'
            }}
          >
            {/* Bandeau coloré + avatar débordant */}
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ height: 48, backgroundColor: 'primary.main' }} />
              <IconButton size='small' onClick={() => setSelectedPro(null)} sx={{ position: 'absolute', top: 6, right: 6, color: 'common.white', '&:hover': { backgroundColor: alpha('#fff', 0.18) } }}>
                <i className='tabler-x' />
              </IconButton>
              <Box sx={{ px: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Avatar
                  src={selectedPro.photos?.[0] || undefined}
                  sx={{
                    width: 56,
                    height: 56,
                    mt: '-28px',
                    fontSize: 18,
                    fontWeight: 800,
                    color: 'primary.main',
                    backgroundColor: 'background.paper',
                    border: '3px solid',
                    borderColor: 'background.paper',
                    boxShadow: `0 0 0 1px ${theme.palette.divider}`
                  }}
                >
                  {initials(selectedPro.name || '?')}
                </Avatar>
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary', mt: 1, lineHeight: 1.2 }}>
                  {selectedPro.name || '-'}
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }} noWrap>
                  {selectedPro.ville || selectedPro.email || '-'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mt: 1.25, flexWrap: 'wrap' }}>
                  <Pill
                    label={statusMeta[selectedPro.status || '']?.label || selectedPro.status || 'Inconnu'}
                    palette={statusMeta[selectedPro.status || '']?.palette || 'secondary'}
                  />
                  <RowActions
                    actions={[
                      { label: 'Activer', color: 'success', onClick: () => handleChangeStatus(selectedPro, 'active') },
                      { label: 'Suspendre', color: 'warning', onClick: () => handleChangeStatus(selectedPro, 'suspended') },
                      { label: 'Supprimer', color: 'error', onClick: () => handleRemove(selectedPro) }
                    ]}
                  />
                </Box>
              </Box>
            </Box>

            {/* Rangée de stats (activité) */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
              {[
                { label: 'CA généré', value: formatFCFA(detailStats?.totalRevenue || 0) },
                { label: 'Réductions', value: formatFCFA(detailStats?.totalDiscount || 0) },
                { label: 'Validées', value: String(detailStats?.successCount ?? 0) },
                { label: 'En attente', value: String(detailStats?.pendingCount ?? 0) }
              ].map((st, i) => (
                <Box
                  key={st.label}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    ...(i % 2 === 0 && { borderRight: '1px solid', borderColor: 'divider' }),
                    ...(i < 2 && { borderBottom: '1px solid', borderColor: 'divider' })
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                    {statsLoading ? '…' : st.value}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{st.label}</Typography>
                </Box>
              ))}
            </Box>

            {/* Corps scrollable : informations */}
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }}>
              {detailsLoading ? (
                <Box className='flex items-center justify-center py-8'>
                  <CircularProgress size={22} />
                </Box>
              ) : (
                <>
                  <Typography sx={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.25 }}>Informations</Typography>
                  {[
                    { icon: Mail, k: 'Email', v: selectedPro.email || '-' },
                    { icon: Phone, k: 'Téléphone', v: selectedPro.phone || '-' },
                    { icon: MapPin, k: 'Adresse', v: selectedPro.address || '-' },
                    { icon: Tag, k: 'Catégories', v: categoriesLabel(selectedPro) },
                    { icon: Percent, k: 'Remise max', v: typeof selectedPro.maxDiscount === 'number' ? `${selectedPro.maxDiscount}%` : '-' },
                    { icon: CalendarDays, k: 'Création', v: formatDate(selectedPro.createdAt) }
                  ].map(row => {
                    const Icon = row.icon

                    return (
                      <Box
                        key={row.k}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          py: 0.85
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', flexShrink: 0 }}>
                          <Icon size={15} />
                          <Typography sx={{ fontSize: 12.5 }}>{row.k}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', textAlign: 'right' }}>
                          {row.v}
                        </Typography>
                      </Box>
                    )
                  })}

                  {selectedPro.description && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 0.75 }}>
                        <FileText size={15} />
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>Description</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.6 }}>
                        {selectedPro.description}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Card>
          )

          return isDownLg ? (
            <Drawer anchor='bottom' open onClose={() => setSelectedPro(null)} slotProps={{ paper: { sx: { maxHeight: '92vh', borderRadius: 0 } } }}>
              {panel}
            </Drawer>
          ) : panel
        })()}
      </Box>

    </PageContainer>
  )
}
