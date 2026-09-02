'use client'

import type { ChangeEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Drawer from '@mui/material/Drawer'
import TableSortLabel from '@mui/material/TableSortLabel'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'
import { Eye, Bell, ShieldX, Phone, MapPin, ShieldCheck, CalendarDays } from 'lucide-react'

import PageContainer from '@/components/PageContainer'
import { StatusPill, StatCard, RowActions, SearchInput, SelectFilter, DateRangeFilter, FilterModal, FilterField } from '@/components/ui'
import { clientManagementService, type YoyoClient } from '@/services/client-management.service'

const statusOptions = ['', 'active', 'inactive', 'suspended', 'removed', 'archived']
const notificationTypes = ['EMAIL', 'SMS', 'PUSH'] as const

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
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function fullName(client: YoyoClient) {
  const firstname = client.firstname || ''
  const lastname = client.lastname || ''
  const value = `${firstname} ${lastname}`.trim()

  return value || '-'
}

export default function ClientsPage() {
  const theme = useTheme()
  // Sur mobile/tablette (< lg), le détail s'ouvre dans un drawer au lieu de s'afficher sous le tableau.
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'))
  const [rows, setRows] = useState<YoyoClient[]>([])
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

  const [selectedClient, setSelectedClient] = useState<YoyoClient | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [notifyOpen, setNotifyOpen] = useState(false)
  const [notifyType, setNotifyType] = useState<(typeof notificationTypes)[number]>('EMAIL')
  const [notifyMessage, setNotifyMessage] = useState('')
  const [notifyTarget, setNotifyTarget] = useState<YoyoClient | null>(null)

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

      const response = await clientManagementService.list(queryParams)

      setRows(response.rows)
      setTotalRows(response.meta.totalRows)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger la liste des clients.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [queryParams])

  const handleOpenDetails = async (client: YoyoClient) => {
    setSelectedClient(client)
    setDetailsLoading(true)

    try {
      const details = await clientManagementService.getById(client._id)

      setSelectedClient(details)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du chargement des details client')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleRemove = async (client: YoyoClient) => {
    const reason = window.prompt('Motif de moderation (obligatoire):')

    if (!reason || !reason.trim()) {
      return
    }

    try {
      await clientManagementService.remove(client._id, reason.trim())
      toast.success('Client modere avec succes')
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Echec de la moderation du client')
    }
  }

  const openNotifyDialog = (client: YoyoClient) => {
    setNotifyTarget(client)
    setNotifyType('EMAIL')
    setNotifyMessage('')
    setNotifyOpen(true)
  }

  const sendNotification = async () => {
    if (!notifyTarget || !notifyMessage.trim()) {
      return
    }

    try {
      await clientManagementService.notify(notifyTarget._id, {
        type: notifyType,
        message: notifyMessage.trim()
      })

      toast.success('Notification envoyee')
      setNotifyOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi de la notification')
    }
  }

  const sortValue = (c: YoyoClient): string | number =>
    orderBy === 'name'
      ? fullName(c).toLowerCase()
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

  const clientStats = [
    {
      label: 'Total clients',
      value: totalRows,
      caption: 'Ensemble des inscrits',
      icon: 'tabler-users',
      palette: 'primary' as const
    },
    {
      label: 'Actifs',
      value: rows.filter(r => r.status === 'active').length,
      caption: 'Comptes actifs',
      icon: 'tabler-user-check',
      palette: 'success' as const
    },
    {
      label: 'KYC validés',
      value: rows.filter(r => r.isDocumentVerified).length,
      caption: 'Documents vérifiés',
      icon: 'tabler-shield-check',
      palette: 'info' as const
    },
    {
      label: 'Suspendus',
      value: rows.filter(r => r.status === 'suspended').length,
      caption: 'Accès suspendu',
      icon: 'tabler-user-x',
      palette: 'warning' as const
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

  const bulkModerate = async () => {
    const reason = window.prompt(`Motif de modération pour ${selected.length} client(s) :`)

    if (!reason || !reason.trim()) return

    try {
      await Promise.all(selected.map(id => clientManagementService.remove(id, reason.trim())))
      toast.success('Clients modérés')
      setSelected([])
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Échec de la modération')
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
      title='Clients YoYo'
      subtitle='Suivi, modération et communication avec les clients finaux'
      actions={
        <Button onClick={loadData} disableElevation sx={softBtn}>
          Actualiser
        </Button>
      }
    >
      {/* Cartes stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3
        }}
      >
        {clientStats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} caption={s.caption} icon={s.icon} palette={s.palette} />
        ))}
      </Box>

      {/* Split : table (gauche) + détails (droite) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: selectedClient ? 'minmax(0, 1fr) 380px' : '1fr' },
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
          height: selectedClient ? { lg: 640 } : 'auto',
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
                <Button
                  onClick={bulkModerate}
                  disableElevation
                  sx={{
                    height: 40,
                    borderRadius: 0,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2,
                    color: 'error.main',
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.18) }
                  }}
                >
                  Modérer
                </Button>
                <Button
                  onClick={() => setSelected([])}
                  disableElevation
                  sx={{
                    height: 40,
                    borderRadius: 0,
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 2,
                    color: 'text.secondary',
                    backgroundColor: 'action.hover',
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  Effacer
                </Button>
              </>
            ) : (
              <FilterModal
                active={isFiltered}
                onApply={() => {}}
                onReset={() => { setPage(0); setQuery(''); setStatus(''); setDateFrom(''); setDateTo('') }}
                subtitle='Affinez la liste des clients.'
              >
                <FilterField label='Recherche'>
                  <SearchInput value={query} onChange={v => { setPage(0); setQuery(v) }} placeholder='Rechercher un client (nom, email, contact)' minWidth={0} />
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
                    minWidth: 720,
                    '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider' },
                    '& td:last-of-type, & th:last-of-type': { borderRight: 'none' },
                    '& thead th': { backgroundColor: 'background.paper' }
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
                      <TableCell padding='checkbox'>
                        <Checkbox
                          size='small'
                          indeterminate={someSelected}
                          checked={allSelected}
                          onChange={handleSelectAll}
                        />
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'name' ? order : false}>
                        <TableSortLabel
                          active={orderBy === 'name'}
                          direction={orderBy === 'name' ? order : 'asc'}
                          onClick={() => handleRequestSort('name')}
                        >
                          Client
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Vérification</TableCell>
                      <TableCell sortDirection={orderBy === 'status' ? order : false}>
                        <TableSortLabel
                          active={orderBy === 'status'}
                          direction={orderBy === 'status' ? order : 'asc'}
                          onClick={() => handleRequestSort('status')}
                        >
                          Statut
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sortDirection={orderBy === 'createdAt' ? order : false}>
                        <TableSortLabel
                          active={orderBy === 'createdAt'}
                          direction={orderBy === 'createdAt' ? order : 'asc'}
                          onClick={() => handleRequestSort('createdAt')}
                        >
                          Création
                        </TableSortLabel>
                      </TableCell>
                      {!selectedClient && <TableCell align='right'>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={selectedClient ? 6 : 7} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                            <i className='tabler-users-group text-4xl' />
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucun client trouvé</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      visibleRows.map(client => {
                        const meta = statusMeta[client.status || ''] || { label: client.status || 'Inconnu', palette: 'secondary' as const }
                        const isSel = selected.includes(client._id)

                        return (
                          <TableRow
                            key={client._id}
                            hover
                            selected={isSel}
                            onClick={() => handleOpenDetails(client)}
                            sx={{
                              cursor: 'pointer',
                              '& td': { borderColor: 'divider' },
                              ...(selectedClient?._id === client._id && {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08)
                              })
                            }}
                          >
                            <TableCell padding='checkbox' onClick={e => e.stopPropagation()}>
                              <Checkbox size='small' checked={isSel} onChange={() => toggleRow(client._id)} />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 38,
                                    height: 38,
                                    fontSize: 13,
                                    fontWeight: 800,
                                    color: 'primary.main',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.12)
                                  }}
                                >
                                  {initials(fullName(client))}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>
                                    {fullName(client)}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                                    {client.email || '-'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ fontSize: 13, color: 'text.primary' }}>{client.contact || '-'}</TableCell>
                            <TableCell>
                              <Pill
                                label={client.isDocumentVerified ? 'KYC validé' : client.documentVerificationStatus || 'À vérifier'}
                                palette={client.isDocumentVerified ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              <Pill label={meta.label} palette={meta.palette} />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                              {formatDate(client.createdAt)}
                            </TableCell>
                            {!selectedClient && (
                            <TableCell align='right' sx={{ whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                              <RowActions
                                actions={[
                                  { label: 'Voir', color: 'info', onClick: () => handleOpenDetails(client) },
                                  { label: 'Notifier', onClick: () => openNotifyDialog(client) },
                                  { label: 'Modérer', color: 'error', onClick: () => handleRemove(client) }
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

      {/* Panneau détails — desktop : colonne de droite ; mobile : drawer */}
      {selectedClient && (() => {
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
            <IconButton
              size='small'
              onClick={() => setSelectedClient(null)}
              sx={{ position: 'absolute', top: 6, right: 6, color: 'common.white', '&:hover': { backgroundColor: alpha('#fff', 0.18) } }}
            >
              <i className='tabler-x' />
            </IconButton>
            <Box sx={{ px: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar
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
                {initials(fullName(selectedClient))}
              </Avatar>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary', mt: 1, lineHeight: 1.2 }}>
                {fullName(selectedClient)}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }} noWrap>
                {selectedClient.email || '-'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mt: 1.25, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Pill
                    label={statusMeta[selectedClient.status || '']?.label || selectedClient.status || 'Inconnu'}
                    palette={statusMeta[selectedClient.status || '']?.palette || 'secondary'}
                  />
                  <Pill
                    label={selectedClient.isDocumentVerified ? 'KYC validé' : 'KYC à vérifier'}
                    palette={selectedClient.isDocumentVerified ? 'success' : 'warning'}
                  />
                </Box>
                <RowActions
                  actions={[
                    { label: 'Notifier', color: 'primary', onClick: () => openNotifyDialog(selectedClient) },
                    { label: 'Modérer', color: 'error', onClick: () => handleRemove(selectedClient) }
                  ]}
                />
              </Box>
            </Box>
          </Box>

          {/* Rangée de stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ px: 2.5, py: 1.75, borderRight: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: selectedClient.isEmailConfirmed ? 'success.main' : 'text.disabled', lineHeight: 1.2 }}>
                {selectedClient.isEmailConfirmed ? 'Oui' : 'Non'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Email confirmé</Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 1.75 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: selectedClient.isPhoneConfirmed ? 'success.main' : 'text.disabled', lineHeight: 1.2 }}>
                {selectedClient.isPhoneConfirmed ? 'Oui' : 'Non'}
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Téléphone confirmé</Typography>
            </Box>
          </Box>

          {/* Corps scrollable : informations */}
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2.5, py: 2 }}>
            {detailsLoading ? (
              <Box className='flex items-center justify-center py-8'>
                <CircularProgress size={22} />
              </Box>
            ) : (
              <>
                <Typography sx={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.25 }}>
                  Informations
                </Typography>
                {[
                  { icon: Phone, k: 'Contact', v: selectedClient.contact || '-' },
                  { icon: MapPin, k: 'Pays', v: selectedClient.country || '-' },
                  { icon: ShieldCheck, k: 'KYC', v: selectedClient.documentVerificationStatus || '-' },
                  { icon: CalendarDays, k: 'Création', v: formatDate(selectedClient.createdAt) }
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <Icon size={15} />
                        <Typography sx={{ fontSize: 12.5 }}>{row.k}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', textAlign: 'right' }}>
                        {row.v}
                      </Typography>
                    </Box>
                  )
                })}
                {selectedClient.removedReason && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'error.main' }}>
                      Motif de retrait : {selectedClient.removedReason}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>

        </Card>
        )

        return isDownLg ? (
          <Drawer anchor='bottom' open onClose={() => setSelectedClient(null)} slotProps={{ paper: { sx: { maxHeight: '92vh', borderRadius: 0 } } }}>
            {panel}
          </Drawer>
        ) : panel
      })()}
      </Box>

      <Dialog
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        fullWidth
        maxWidth='sm'
        PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none' } }}
      >
        {/* En-tête */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              backgroundColor: alpha(theme.palette.primary.main, 0.14)
            }}
          >
            <Bell size={22} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              Envoyer une notification
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }} noWrap>
              À {notifyTarget ? fullName(notifyTarget) : '-'}
            </Typography>
          </Box>
          <IconButton size='small' onClick={() => setNotifyOpen(false)}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Canal (segmenté) */}
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Canal</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { k: 'EMAIL' as const, icon: 'tabler-mail', label: 'Email' },
                { k: 'SMS' as const, icon: 'tabler-message-2', label: 'SMS' },
                { k: 'PUSH' as const, icon: 'tabler-bell', label: 'Push' }
              ].map(ch => {
                const active = notifyType === ch.k

                return (
                  <Box
                    key={ch.k}
                    role='button'
                    onClick={() => setNotifyType(ch.k)}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      height: 44,
                      borderRadius: 0,
                      cursor: 'pointer',
                      fontSize: 13.5,
                      fontWeight: 700,
                      transition: 'all .15s',
                      color: active ? 'primary.main' : 'text.secondary',
                      backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : 'action.hover',
                      border: '1px solid',
                      borderColor: active ? 'primary.main' : 'transparent'
                    }}
                  >
                    <i className={`${ch.icon} text-lg`} />
                    {ch.label}
                  </Box>
                )
              })}
            </Box>
          </Box>

          {/* Message */}
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Message</Typography>
            <Box
              component='textarea'
              value={notifyMessage}
              onChange={(e: any) => setNotifyMessage(e.target.value)}
              placeholder='Écrivez votre message…'
              rows={5}
              sx={{
                width: '100%',
                resize: 'vertical',
                borderRadius: 0,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'action.hover',
                p: 1.5,
                fontSize: 14,
                fontFamily: 'inherit',
                color: 'var(--mui-palette-text-primary)',
                outline: 'none',
                '&:focus': { borderColor: 'primary.main' }
              }}
            />
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 0.5 }}>
            <Button
              onClick={() => setNotifyOpen(false)}
              disableElevation
              sx={{
                height: 42,
                borderRadius: 0,
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
                color: 'text.secondary',
                backgroundColor: 'action.hover',
                '&:hover': { backgroundColor: 'action.selected' }
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={sendNotification}
              disabled={!notifyMessage.trim()}
              disableElevation
              variant='contained'
              sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5 }}
            >
              Envoyer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </PageContainer>
  )
}
