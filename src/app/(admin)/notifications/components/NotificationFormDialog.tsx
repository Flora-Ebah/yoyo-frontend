import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { User } from '@/services/user.service'

interface NotificationFormDialogProps {
  open: boolean
  handleClose: () => void
  handleSubmit: () => void
  submitting: boolean
  formData: any
  setFormData: (data: any) => void
  users: User[]
  setUserSearch: (search: string) => void
}

const TYPES = [
  { value: 'info', label: 'Info', icon: 'tabler-info-circle' },
  { value: 'success', label: 'Succès', icon: 'tabler-check' },
  { value: 'warning', label: 'Alerte', icon: 'tabler-alert-triangle' },
  { value: 'system', label: 'Système', icon: 'tabler-settings' }
]

const TARGETS = [
  { value: 'all', label: 'Tous', icon: 'tabler-users' },
  { value: 'role', label: 'Par rôle', icon: 'tabler-user-shield' },
  { value: 'user', label: 'Spécifique', icon: 'tabler-user' }
]

const NotificationFormDialog = ({
  open,
  handleClose,
  handleSubmit,
  submitting,
  formData,
  setFormData,
  users,
  setUserSearch
}: NotificationFormDialogProps) => {
  const theme = useTheme()

  const label = { fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }

  const fieldSx = {
    width: '100%',
    height: 44,
    px: 1.5,
    borderRadius: '6px',
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    fontSize: 14,
    fontFamily: 'inherit',
    fontWeight: 600,
    color: 'var(--mui-palette-text-primary)',
    outline: 'none',
    cursor: 'pointer',
    '&:focus': { borderColor: 'primary.main' }
  }

  // Le backend n'accepte pour l'instant que l'envoi vers un utilisateur précis.
  const broadcastUnsupported = formData.targeting !== 'user'

  const disabled =
    submitting ||
    !formData.title ||
    !formData.message ||
    broadcastUnsupported ||
    (formData.targeting === 'user' && !formData.userId)

  const Segmented = ({
    value,
    onChange,
    options
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string; icon: string }>
  }) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.value

        return (
          <Box
            key={o.value}
            role='button'
            onClick={() => onChange(o.value)}
            sx={{
              flex: '1 1 0',
              minWidth: 84,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              height: 44,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              transition: 'all .15s',
              color: active ? 'primary.main' : 'text.secondary',
              backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : 'action.hover',
              border: '1px solid',
              borderColor: active ? 'primary.main' : 'transparent'
            }}
          >
            <i className={`${o.icon} text-lg`} />
            {o.label}
          </Box>
        )
      })}
    </Box>
  )

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none' } }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
          <i className='tabler-send' style={{ fontSize: '1.35rem' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            Publier une notification
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
            Envoyez un message à vos utilisateurs en temps réel.
          </Typography>
        </Box>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x' />
        </IconButton>
      </Box>

      <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Titre */}
        <Box>
          <Typography sx={label}>Titre</Typography>
          <Box
            component='input'
            value={formData.title}
            onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
            placeholder='ex. Nouvelle mise à jour disponible'
            sx={fieldSx}
          />
        </Box>

        {/* Message */}
        <Box>
          <Typography sx={label}>Message</Typography>
          <Box
            component='textarea'
            value={formData.message}
            onChange={(e: any) => setFormData({ ...formData, message: e.target.value })}
            placeholder='Décrivez le contenu de votre notification…'
            rows={4}
            sx={{ ...fieldSx, height: 'auto', py: 1.5, resize: 'vertical', cursor: 'text' }}
          />
        </Box>

        {/* Type de message */}
        <Box>
          <Typography sx={label}>Type de message</Typography>
          <Segmented value={formData.type} onChange={v => setFormData({ ...formData, type: v })} options={TYPES} />
        </Box>

        {/* Ciblage */}
        <Box>
          <Typography sx={label}>Ciblage</Typography>
          <Segmented value={formData.targeting} onChange={v => setFormData({ ...formData, targeting: v })} options={TARGETS} />
          {broadcastUnsupported && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.75, borderRadius: '6px', backgroundColor: alpha(theme.palette.warning.main, 0.12) }}>
              <i className='tabler-info-circle' style={{ fontSize: '1rem', color: theme.palette.warning.main }} />
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'warning.main' }}>
                La diffusion « Tous » / « Par rôle » n'est pas encore disponible — sélectionnez « Spécifique ».
              </Typography>
            </Box>
          )}
        </Box>

        {/* Rôle */}
        {formData.targeting === 'role' && (
          <Box>
            <Typography sx={label}>Choisir le rôle</Typography>
            <Box
              component='select'
              value={formData.role}
              onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
              sx={fieldSx}
            >
              <option value='user'>Utilisateurs standards</option>
              <option value='provider'>Prestataires</option>
              <option value='admin'>Administrateurs</option>
            </Box>
          </Box>
        )}

        {/* Utilisateur spécifique */}
        {formData.targeting === 'user' && (
          <Box>
            <Typography sx={label}>Rechercher un utilisateur</Typography>
            <Autocomplete
              options={users}
              getOptionLabel={option => `${option.firstname} ${option.lastname} (${option.email})`}
              onInputChange={(_e, value) => setUserSearch(value)}
              onChange={(_e, value) => setFormData({ ...formData, userId: value?._id || '' })}
              renderInput={params => (
                <TextField {...params} placeholder='Tapez un nom ou un email…' size='small' fullWidth />
              )}
            />
          </Box>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 0.5 }}>
          <Button
            onClick={handleClose}
            disableElevation
            sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={disabled}
            disableElevation
            variant='contained'
            startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : undefined}
            sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5 }}
          >
            Publier
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default NotificationFormDialog
