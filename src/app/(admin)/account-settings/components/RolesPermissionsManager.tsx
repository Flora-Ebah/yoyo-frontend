'use client'

import { useEffect, useMemo, useState } from 'react'
import { StatusPill, AddIcon, EditIcon } from '@/components/ui'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { toast } from 'react-toastify'

import { profileService, type Profile, type ProfileStatus } from '@/services/profile.service'
import {
  PERMISSION_ACTIONS,
  PERMISSION_SUBJECTS,
  SUPER_ADMIN_ABILITY,
  type Ability,
  type PermissionAction
} from '@/configs/permissions'
import { usePermissions } from '@/hooks/usePermissions'

type Matrix = Record<string, Record<string, boolean>>
type Palette = 'success' | 'secondary' | 'warning' | 'error' | 'primary'

const emptyMatrix = (): Matrix => {
  const m: Matrix = {}

  PERMISSION_SUBJECTS.forEach(s => {
    m[s.key] = {}
    s.actions.forEach(a => (m[s.key][a] = false))
  })

  return m
}

const isSuper = (ability: Ability[] = []) => ability.some(a => a.subject === 'all' && a.action === 'manage')

const granted = (ability: Ability[] = [], subject: string, action: string) => {
  if (isSuper(ability)) return true

  return ability.some(a => (a.subject === subject || a.subject === 'all') && (a.action === action || a.action === 'manage'))
}

const abilityToMatrix = (ability: Ability[] = []): { superAdmin: boolean; matrix: Matrix } => {
  const superAdmin = isSuper(ability)
  const matrix = emptyMatrix()

  PERMISSION_SUBJECTS.forEach(s => {
    s.actions.forEach(a => (matrix[s.key][a] = granted(ability, s.key, a)))
  })

  return { superAdmin, matrix }
}

const matrixToAbility = (superAdmin: boolean, matrix: Matrix): Ability[] => {
  if (superAdmin) return [SUPER_ADMIN_ABILITY]

  const out: Ability[] = []

  PERMISSION_SUBJECTS.forEach(s => {
    s.actions.forEach(a => {
      if (matrix[s.key]?.[a]) out.push({ name: `${s.label} · ${a}`, subject: s.key, action: a })
    })
  })

  return out
}

const permCount = (ability: Ability[] = []) => {
  if (isSuper(ability)) return '∞'

  return String(ability.length)
}

const statusMeta: Record<string, { label: string; palette: Palette }> = {
  active: { label: 'Actif', palette: 'success' },
  inactive: { label: 'Inactif', palette: 'secondary' },
  suspended: { label: 'Suspendu', palette: 'warning' },
  removed: { label: 'Retiré', palette: 'error' }
}

const RolesPermissionsManager = () => {
  const theme = useTheme()
  const { can, refresh } = usePermissions()

  const [roles, setRoles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProfileStatus>('active')
  const [superAdmin, setSuperAdmin] = useState(false)
  const [matrix, setMatrix] = useState<Matrix>(emptyMatrix())
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)

  const canCreate = can('create', 'roles')
  const canUpdate = can('update', 'roles')
  const canDelete = can('delete', 'roles')

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await profileService.getAll()

      setRoles(data)
      setSelectedId(prev => prev && data.some(r => r._id === prev) ? prev : data[0]?._id || null)
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les rôles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = useMemo(() => roles.find(r => r._id === selectedId) || null, [roles, selectedId])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setDescription('')
    setStatus('active')
    setSuperAdmin(false)
    setMatrix(emptyMatrix())
    setDialogOpen(true)
  }

  const openEdit = (role: Profile) => {
    const { superAdmin: sa, matrix: m } = abilityToMatrix(role.ability || [])

    setEditing(role)
    setName(role.name || '')
    setDescription(role.description || '')
    setStatus((role.status as ProfileStatus) || 'active')
    setSuperAdmin(sa)
    setMatrix(m)
    setDialogOpen(true)
  }

  const toggleCell = (subject: string, action: string) =>
    setMatrix(prev => ({ ...prev, [subject]: { ...prev[subject], [action]: !prev[subject]?.[action] } }))

  const save = async () => {
    if (!name.trim()) {
      toast.error('Le nom du rôle est requis')

      return
    }

    setSaving(true)

    try {
      const ability = matrixToAbility(superAdmin, matrix)
      const payload = { name: name.trim(), description: description.trim() || undefined, status, ability }

      if (editing) {
        await profileService.update(editing._id, payload)
        toast.success('Rôle mis à jour')
      } else {
        await profileService.create(payload)
        toast.success('Rôle créé')
      }

      setDialogOpen(false)
      await load()
      await refresh()
    } catch (err: any) {
      toast.error(err?.message || "Échec de l'enregistrement du rôle")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await profileService.delete(deleteTarget._id)
      toast.success('Rôle supprimé')
      setDeleteTarget(null)
      await load()
      await refresh()
    } catch (err: any) {
      toast.error(err?.message || 'Échec de la suppression')
    }
  }

  const Pill = StatusPill

  const summary = useMemo(() => {
    if (superAdmin) return 'Accès total (super administrateur)'

    return `${matrixToAbility(false, matrix).length} permission(s) sélectionnée(s)`
  }, [superAdmin, matrix])

  return (
    <Box>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>Rôles &amp; permissions</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Définissez des rôles et leurs droits d'accès aux modules de l'administration.
          </Typography>
        </Box>
        {canCreate && (
          <Button onClick={openCreate} disableElevation variant='contained' sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2 }}>
            Nouveau rôle
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography sx={{ color: 'error.main', fontSize: 13, fontWeight: 700 }}>{error}</Typography>
      ) : roles.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 6, color: 'text.secondary' }}>
          <i className='tabler-shield-cog text-4xl' />
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucun rôle défini</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
          {/* Liste des rôles */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {roles.map(role => {
              const meta = statusMeta[role.status || 'active'] || { label: role.status || '—', palette: 'secondary' as Palette }
              const active = role._id === selectedId

              return (
                <Box
                  key={role._id}
                  onClick={() => setSelectedId(role._id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    p: 1.5,
                    borderRadius: 0,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all .12s',
                    borderColor: active ? 'primary.main' : 'transparent',
                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'action.hover'
                  }}
                >
                  <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
                    <i className='tabler-shield-lock' style={{ fontSize: '1.2rem' }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: 'text.primary' }} noWrap>{role.name}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                      {permCount(role.ability)} permission(s)
                    </Typography>
                  </Box>
                  <Pill label={meta.label} palette={meta.palette} />
                </Box>
              )
            })}
          </Box>

          {/* Détail du rôle sélectionné */}
          {selected && (
            <Box sx={{ borderRadius: 0, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              {/* En-tête détail */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, backgroundColor: alpha(theme.palette.primary.main, 0.06) }}>
                <Box sx={{ width: 46, height: 46, flexShrink: 0, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.16) }}>
                  <i className='tabler-shield-lock' style={{ fontSize: '1.4rem' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>{selected.name}</Typography>
                    {isSuper(selected.ability || []) && <Pill label='Super admin' palette='primary' />}
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                    {selected.description || 'Sans description'}
                  </Typography>
                </Box>
                {canUpdate && (
                  <Tooltip title='Modifier'>
                    <IconButton size='small' onClick={() => openEdit(selected)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {canDelete && (
                  <Tooltip title='Supprimer'>
                    <IconButton size='small' color='error' onClick={() => setDeleteTarget(selected)}>
                      <i className='tabler-trash' />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              {/* Permissions */}
              <Box sx={{ p: 2.5 }}>
                {isSuper(selected.ability || []) ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, p: 2, borderRadius: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                    <i className='tabler-infinity' style={{ fontSize: '1.4rem', color: theme.palette.primary.main }} />
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: 'text.primary' }}>Accès total</Typography>
                      <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Ce rôle peut tout faire sur tous les modules.</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ borderRadius: 0, borderBlock: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    {/* En-tête matrice */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 64px)', alignItems: 'stretch', backgroundColor: 'action.hover' }}>
                      <Typography sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25, fontSize: 11.5, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                        Module
                      </Typography>
                      {PERMISSION_ACTIONS.map(a => (
                        <Typography key={a.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1.25, fontSize: 11.5, fontWeight: 800, color: 'text.secondary', textAlign: 'center', borderInlineStart: '1px solid', borderColor: 'divider' }}>
                          {a.label}
                        </Typography>
                      ))}
                    </Box>
                    {/* Lignes */}
                    {PERMISSION_SUBJECTS.map(s => {
                      const hasAny = s.actions.some(a => granted(selected.ability || [], s.key, a))

                      return (
                        <Box
                          key={s.key}
                          sx={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 64px)', alignItems: 'stretch', borderTop: '1px solid', borderColor: 'divider' }}
                        >
                          <Typography sx={{ display: 'flex', alignItems: 'center', px: 2, py: 0.85, fontSize: 13, fontWeight: 700, color: hasAny ? 'text.primary' : 'text.disabled' }}>
                            {s.label}
                          </Typography>
                          {PERMISSION_ACTIONS.map(a => {
                            const applicable = s.actions.includes(a.key)
                            const ok = applicable && granted(selected.ability || [], s.key, a.key)

                            return (
                              <Box key={a.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0.85, borderInlineStart: '1px solid', borderColor: 'divider' }}>
                                {!applicable ? (
                                  <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>—</Typography>
                                ) : ok ? (
                                  <Box sx={{ width: 22, height: 22, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backgroundColor: 'success.main' }}>
                                    <i className='tabler-check' style={{ fontSize: '0.85rem' }} />
                                  </Box>
                                ) : (
                                  <Box sx={{ width: 22, height: 22, borderRadius: 0, border: '1.5px solid', borderColor: 'divider' }} />
                                )}
                              </Box>
                            )
                          })}
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth='md' PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
            <i className='tabler-shield-lock' style={{ fontSize: '1.35rem' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {editing ? 'Modifier le rôle' : 'Nouveau rôle'}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{summary}</Typography>
          </Box>
          <IconButton size='small' onClick={() => setDialogOpen(false)}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 160px' }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Nom du rôle</Typography>
              <Box component='input' value={name} onChange={(e: any) => setName(e.target.value)} placeholder='ex. Modérateur' sx={{ width: '100%', height: 44, px: 1.5, borderRadius: 0, border: 'none', borderBottom: '2px solid', borderBottomColor: 'divider', backgroundColor: 'transparent', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, color: 'var(--mui-palette-text-primary)', outline: 'none', '&:focus': { borderBottomColor: 'primary.main' } }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Statut</Typography>
              <Box component='select' value={status} onChange={(e: any) => setStatus(e.target.value)} sx={{ width: '100%', height: 44, px: 1.5, borderRadius: 0, border: 'none', borderBottom: '2px solid', borderBottomColor: 'divider', backgroundColor: 'transparent', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, color: 'var(--mui-palette-text-primary)', cursor: 'pointer', outline: 'none' }}>
                <option value='active'>Actif</option>
                <option value='inactive'>Inactif</option>
                <option value='suspended'>Suspendu</option>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Description</Typography>
            <Box component='input' value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder='Rôle destiné à…' sx={{ width: '100%', height: 44, px: 1.5, borderRadius: 0, border: 'none', borderBottom: '2px solid', borderBottomColor: 'divider', backgroundColor: 'transparent', fontSize: 14, fontFamily: 'inherit', fontWeight: 600, color: 'var(--mui-palette-text-primary)', outline: 'none', '&:focus': { borderBottomColor: 'primary.main' } }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 1.5, borderRadius: 0, backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: 'text.primary' }}>Super administrateur</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Accès total à tous les modules (ignore la matrice).</Typography>
            </Box>
            <Switch checked={superAdmin} onChange={e => setSuperAdmin(e.target.checked)} />
          </Box>

          {!superAdmin && (
            <Box sx={{ borderRadius: 0, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 72px)', alignItems: 'center', px: 2, py: 1.25, backgroundColor: 'action.hover' }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'text.secondary' }}>Module</Typography>
                {PERMISSION_ACTIONS.map(a => (
                  <Typography key={a.key} sx={{ fontSize: 12, fontWeight: 800, color: 'text.secondary', textAlign: 'center' }}>{a.label}</Typography>
                ))}
              </Box>
              {PERMISSION_SUBJECTS.map(s => (
                <Box key={s.key} sx={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(4, 72px)', alignItems: 'center', px: 2, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>{s.label}</Typography>
                  {PERMISSION_ACTIONS.map(a => {
                    const applicable = s.actions.includes(a.key as PermissionAction)
                    const checked = !!matrix[s.key]?.[a.key]

                    return (
                      <Box key={a.key} sx={{ display: 'flex', justifyContent: 'center' }}>
                        {applicable ? (
                          <Box role='checkbox' aria-checked={checked} onClick={() => toggleCell(s.key, a.key)} sx={{ width: 22, height: 22, borderRadius: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .12s', border: '2px solid', borderColor: checked ? 'primary.main' : 'divider', backgroundColor: checked ? 'primary.main' : 'transparent', color: '#fff' }}>
                            {checked && <i className='tabler-check' style={{ fontSize: '0.85rem' }} />}
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>—</Typography>
                        )}
                      </Box>
                    )
                  })}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 0.5 }}>
            <Button onClick={() => setDialogOpen(false)} disableElevation sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              Annuler
            </Button>
            <Button onClick={save} disabled={saving} disableElevation variant='contained' startIcon={saving ? <CircularProgress size={18} color='inherit' /> : undefined} sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5 }}>
              Enregistrer
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth='xs' fullWidth PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none' } }}>
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.14) }}>
              <i className='tabler-trash' style={{ fontSize: '1.35rem' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>Supprimer le rôle</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{deleteTarget?.name}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
            Cette action est définitive. Les admins portant ce rôle perdront ses permissions.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button onClick={() => setDeleteTarget(null)} disableElevation sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              Annuler
            </Button>
            <Button onClick={confirmDelete} disableElevation variant='contained' color='error' sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2 }}>
              Supprimer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  )
}

export default RolesPermissionsManager
