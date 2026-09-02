'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { AddIcon, EditIcon, StatCard, StatCardGrid, StatusPill, SectionCard, DataTable, SearchInput, SelectFilter, FilterModal, FilterField, RowActions, Field, type Column } from '@/components/ui'
import {
  adminAccountService,
  type AdminAccount,
  type AdminStatus,
  type CreateAdminAccountRequest,
  type UpdateAdminAccountRequest
} from '@/services/admin-account.service'
import { profileService, type Profile } from '@/services/profile.service'
import { usePermissions } from '@/hooks/usePermissions'

type AdminFormState = CreateAdminAccountRequest
type Palette = 'success' | 'secondary' | 'error' | 'info' | 'primary'

const statusOptions: Array<{ value: '' | AdminStatus; label: string }> = [
  { value: '', label: 'Statut : tous' },
  { value: 'active', label: 'Actif' },
  { value: 'archived', label: 'Archivé' },
  { value: 'removed', label: 'Supprimé' }
]

const statusMeta: Record<string, { label: string; palette: Palette }> = {
  active: { label: 'Actif', palette: 'success' },
  archived: { label: 'Archivé', palette: 'secondary' },
  removed: { label: 'Supprimé', palette: 'error' }
}

const typeOptions: Array<{ value: 'interne' | 'externe'; label: string }> = [
  { value: 'interne', label: 'Interne' },
  { value: 'externe', label: 'Externe' }
]

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

function profileLabel(admin: AdminAccount, profiles: Profile[]) {
  if (!admin.profile) return '—'
  if (typeof admin.profile === 'object') return admin.profile.name || admin.profile._id

  return profiles.find(item => item._id === admin.profile)?.name || '—'
}

function adminName(admin: AdminAccount) {
  const fullName = `${admin.firstname || ''} ${admin.lastname || ''}`.trim()

  return fullName || admin.email || admin.slug || '-'
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

function createInitialFormData(): AdminFormState {
  return {
    email: '', password: '', profile: '', matricule: '', phone: '', phoneOffice: '',
    lastname: '', firstname: '', address: '', office: '', photo: '', type: 'interne', status: 'active'
  }
}

export default function AdminAccountsPage() {
  const theme = useTheme()
  const { can } = usePermissions()
  const canCreate = can('create', 'admins')
  const canUpdate = can('update', 'admins')
  const canDelete = can('delete', 'admins')

  const [rows, setRows] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [total, setTotal] = useState(0)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | AdminStatus>('')

  const [profiles, setProfiles] = useState<Profile[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<AdminAccount | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminFormState>(createInitialFormData())

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedRow, setSelectedRow] = useState<AdminAccount | null>(null)

  const queryParams = useMemo(
    () => ({
      page: page + 1,
      pageSize: rowsPerPage,
      status: status || undefined,
      q: search.trim() || undefined,
      sortBy: 'createdAt' as const,
      orderBy: 'desc' as const
    }),
    [page, rowsPerPage, status, search]
  )

  const loadProfiles = async () => {
    try {
      const response = await profileService.getAll()
      setProfiles(response || [])
    } catch {
      setProfiles([])
    }
  }

  const loadAdmins = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminAccountService.getAll(queryParams)

      setRows(response.data)
      setTotal(response.pagination.total)
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les comptes administrateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [queryParams])

  useEffect(() => {
    loadProfiles()
  }, [])

  const openCreate = () => {
    setDialogMode('create')
    setEditing(null)
    setFormData(createInitialFormData())
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = async (item: AdminAccount) => {
    try {
      setDialogMode('edit')
      setFormError(null)
      const details = await adminAccountService.getById(item._id)
      const profileId = typeof details.profile === 'object' ? details.profile?._id || '' : details.profile || ''

      setEditing(details)
      setFormData({
        email: details.email || '', password: '', profile: profileId, matricule: details.matricule || '',
        phone: details.phone || '', phoneOffice: details.phoneOffice || '', lastname: details.lastname || '',
        firstname: details.firstname || '', address: details.address || '', office: details.office || '',
        photo: details.photo || '', type: details.type || 'interne', status: details.status || 'active'
      })
      setDialogOpen(true)
    } catch (err: any) {
      setError(err.message || "Impossible d'ouvrir le compte admin")
    }
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setSubmitting(false)
    setFormError(null)
  }

  const submitDialog = async () => {
    if (!formData.email.trim()) return setFormError("L'email est requis")
    if (!formData.profile) return setFormError('Le rôle est requis')
    if (dialogMode === 'create' && !formData.password.trim()) return setFormError('Le mot de passe est requis pour la création')

    try {
      setSubmitting(true)
      setFormError(null)

      if (dialogMode === 'create') {
        await adminAccountService.create({ ...formData, email: formData.email.trim(), password: formData.password.trim() })
      } else if (editing) {
        const payload: UpdateAdminAccountRequest = {
          _id: editing._id, email: formData.email.trim(), profile: formData.profile, matricule: formData.matricule,
          phone: formData.phone, phoneOffice: formData.phoneOffice, lastname: formData.lastname, firstname: formData.firstname,
          address: formData.address, office: formData.office, photo: formData.photo, type: formData.type, status: formData.status
        }

        if (formData.password.trim()) payload.password = formData.password.trim()

        await adminAccountService.update(payload)
      }

      closeDialog()
      await loadAdmins()
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSubmitting(false)
    }
  }

  const openActions = (event: React.MouseEvent<HTMLElement>, item: AdminAccount) => {
    setAnchorEl(event.currentTarget)
    setSelectedRow(item)
  }

  const closeActions = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  const removeAdmin = async (row: AdminAccount | null = selectedRow) => {
    if (!row) return
    if (!confirm(`Supprimer le compte "${adminName(row)}" ?`)) return

    try {
      await adminAccountService.remove(row._id)
      closeActions()
      await loadAdmins()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const restoreAdmin = async (row: AdminAccount | null = selectedRow) => {
    if (!row) return

    try {
      await adminAccountService.restore(row._id)
      closeActions()
      await loadAdmins()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la restauration')
    }
  }

  const eraseAdmin = async (row: AdminAccount | null = selectedRow) => {
    if (!row) return
    if (!confirm(`Détruire définitivement le compte "${adminName(row)}" ?`)) return

    try {
      await adminAccountService.erase(row._id)
      closeActions()
      await loadAdmins()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la destruction')
    }
  }

  const softBtn = {
    height: 36, borderRadius: '6px', textTransform: 'none' as const, px: 2,
    color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.1), '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) }
  }

  const Pill = StatusPill

  const stats = [
    { label: 'Total', value: total, caption: 'Comptes admin', icon: 'tabler-user-shield', palette: 'primary' as const },
    { label: 'Actifs', value: rows.filter(r => r.status === 'active').length, caption: 'Sur cette page', icon: 'tabler-user-check', palette: 'success' as const },
    { label: 'Archivés', value: rows.filter(r => r.status === 'archived').length, caption: 'Sur cette page', icon: 'tabler-archive', palette: 'secondary' as const },
    { label: 'Rôles', value: profiles.length, caption: 'Rôles définis', icon: 'tabler-shield-lock', palette: 'info' as const }
  ]

  const isFiltered = Boolean(search) || Boolean(status)

  const adminColumns: Column<AdminAccount>[] = [
    {
      key: 'admin',
      header: 'Administrateur',
      render: item => {
        const name = adminName(item)

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={item.photo || undefined} sx={{ width: 36, height: 36, fontSize: 12.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>
              {initials(name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>{name}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{item.email || '-'}</Typography>
            </Box>
          </Box>
        )
      }
    },
    { key: 'phone', header: 'Téléphone', render: item => <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{item.phone || '—'}</Typography> },
    { key: 'role', header: 'Rôle', render: item => <StatusPill label={profileLabel(item, profiles)} palette='primary' /> },
    { key: 'type', header: 'Type', render: item => <StatusPill label={item.type === 'externe' ? 'Externe' : 'Interne'} palette={item.type === 'externe' ? 'info' : 'secondary'} /> },
    {
      key: 'status',
      header: 'Statut',
      render: item => {
        const meta = statusMeta[item.status || ''] || { label: item.status || '—', palette: 'secondary' as Palette }

        return <StatusPill label={meta.label} palette={meta.palette} />
      }
    },
    { key: 'lastLogin', header: 'Dernière connexion', render: item => <Typography sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDate(item.lastLogin)}</Typography> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: item => {
        const acts = []

        if (canUpdate) acts.push({ label: 'Modifier', color: 'info' as const, onClick: () => openEdit(item) })

        if (canDelete) {
          if (item.status === 'removed') acts.push({ label: 'Restaurer', color: 'success' as const, onClick: () => restoreAdmin(item) })
          else acts.push({ label: 'Supprimer', color: 'error' as const, onClick: () => removeAdmin(item) })
          acts.push({ label: 'Détruire', color: 'error' as const, onClick: () => eraseAdmin(item) })
        }

        return acts.length ? <RowActions actions={acts} /> : <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>
      }
    }
  ]

  return (
    <PageContainer
      title='Comptes administrateurs'
      subtitle='Gestion des accès au back-office et des rôles associés'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {canCreate && (
            <Button onClick={openCreate} disableElevation variant='contained' sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2 }}>
              Nouvel admin
            </Button>
          )}
          <Button onClick={loadAdmins} disableElevation sx={softBtn}>
            Actualiser
          </Button>
        </Box>
      }
    >
      {/* Cartes stats */}
      <StatCardGrid>
        {stats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} caption={s.caption} icon={s.icon} palette={s.palette} />
        ))}
      </StatCardGrid>

      {error ? <Alert severity='error'>{error}</Alert> : null}

      {/* Table + toolbar */}
      <SectionCard
        title='Administrateurs'
        action={
          <FilterModal
            active={isFiltered}
            onApply={() => {}}
            onReset={() => { setPage(0); setSearch(''); setStatus('') }}
            subtitle='Affinez la liste des administrateurs.'
          >
            <FilterField label='Recherche'>
              <SearchInput value={search} onChange={v => { setPage(0); setSearch(v) }} placeholder='Rechercher (nom, email)' minWidth={0} />
            </FilterField>
            <FilterField label='Statut'>
              <SelectFilter value={status} onChange={v => { setPage(0); setStatus(v as AdminStatus | '') }} options={statusOptions.map(o => ({ value: o.value, label: o.label }))} />
            </FilterField>
          </FilterModal>
        }
      >
        {loading ? (
          <Box className='flex items-center justify-center py-16'>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <DataTable
              columns={adminColumns}
              rows={rows}
              getRowKey={item => item._id}
              empty={{ icon: 'tabler-user-shield', label: 'Aucun compte administrateur' }}
            />
            <TablePagination
              component='div'
              count={total}
              page={page}
              onPageChange={(_event, nextPage) => setPage(nextPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={event => { setPage(0); setRowsPerPage(Number(event.target.value)) }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </>
        )}
      </SectionCard>

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth='md' PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
            <i className='tabler-user-shield' style={{ fontSize: '1.35rem' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {dialogMode === 'create' ? 'Nouvel administrateur' : 'Modifier un administrateur'}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Compte + rôle (permissions).</Typography>
          </Box>
          <IconButton size='small' onClick={closeDialog}><i className='tabler-x' /></IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
            <Field label='Email' required>
              <TextField size='small' type='email' placeholder='nom@email.com' value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} fullWidth />
            </Field>
            <Field label={dialogMode === 'create' ? 'Mot de passe' : 'Mot de passe (vide = inchangé)'} required={dialogMode === 'create'}>
              <TextField size='small' type='password' placeholder='••••••••' value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} fullWidth />
            </Field>
            <Field label='Rôle' required>
              <Select size='small' fullWidth displayEmpty value={formData.profile} onChange={e => setFormData(p => ({ ...p, profile: e.target.value }))} renderValue={val => val ? (profiles.find(pr => pr._id === val)?.name || '') : <Box component='span' sx={{ color: 'text.disabled' }}>Sélectionner un rôle</Box>}>
                {profiles.map(profile => (
                  <MenuItem key={profile._id} value={profile._id}>{profile.name}</MenuItem>
                ))}
              </Select>
            </Field>
            <Field label='Matricule'>
              <TextField size='small' placeholder='Matricule' value={formData.matricule || ''} onChange={e => setFormData(p => ({ ...p, matricule: e.target.value }))} fullWidth />
            </Field>
            <Field label='Prénom'>
              <TextField size='small' placeholder='Prénom' value={formData.firstname || ''} onChange={e => setFormData(p => ({ ...p, firstname: e.target.value }))} fullWidth />
            </Field>
            <Field label='Nom'>
              <TextField size='small' placeholder='Nom' value={formData.lastname || ''} onChange={e => setFormData(p => ({ ...p, lastname: e.target.value }))} fullWidth />
            </Field>
            <Field label='Téléphone'>
              <TextField size='small' placeholder='07 00 00 00 00' value={formData.phone || ''} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} fullWidth />
            </Field>
            <Field label='Téléphone bureau'>
              <TextField size='small' placeholder='Téléphone bureau' value={formData.phoneOffice || ''} onChange={e => setFormData(p => ({ ...p, phoneOffice: e.target.value }))} fullWidth />
            </Field>
            <Field label='Adresse'>
              <TextField size='small' placeholder='Adresse' value={formData.address || ''} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} fullWidth />
            </Field>
            <Field label='Bureau'>
              <TextField size='small' placeholder='Bureau' value={formData.office || ''} onChange={e => setFormData(p => ({ ...p, office: e.target.value }))} fullWidth />
            </Field>
            <Field label='Type'>
              <Select size='small' fullWidth value={formData.type || 'interne'} onChange={e => setFormData(p => ({ ...p, type: e.target.value as 'interne' | 'externe' }))}>
                {typeOptions.map(o => (<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>))}
              </Select>
            </Field>
            <Field label='Statut'>
              <Select size='small' fullWidth value={formData.status || 'active'} onChange={e => setFormData(p => ({ ...p, status: e.target.value as AdminStatus }))}>
                <MenuItem value='active'>Actif</MenuItem>
                <MenuItem value='archived'>Archivé</MenuItem>
                <MenuItem value='removed'>Supprimé</MenuItem>
              </Select>
            </Field>
          </Box>

          {formError ? <Box sx={{ pt: 2 }}><Alert severity='error'>{formError}</Alert></Box> : null}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
            <Button onClick={closeDialog} disableElevation sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              Annuler
            </Button>
            <Button onClick={submitDialog} disabled={submitting} disableElevation variant='contained' startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : undefined} sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5 }}>
              Enregistrer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </PageContainer>
  )
}
