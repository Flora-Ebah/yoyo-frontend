import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type CreateStoreRequest, type UpdateStoreRequest } from '@/services/store.service'

interface StoreFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateStoreRequest | UpdateStoreRequest
  formErrors: Record<string, string>
  submitting: boolean
  providers: any[]
  loadingProviders: boolean
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateStoreRequest | UpdateStoreRequest) => void
}

export const StoreFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  providers,
  loadingProviders,
  onClose,
  onSubmit,
  onFormDataChange
}: StoreFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>
        <Box className='flex items-center gap-2'>
          <i className='tabler-building-store text-2xl' />
          <Typography variant='h5' fontWeight={600}>
            {mode === 'create' ? 'Nouvelle boutique' : 'Modifier la boutique'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4 mt-2'>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
            }}
          >
            <Box>
              <TextField
                label='Nom *'
                value={formData.name || ''}
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-building-store' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <FormControl fullWidth required error={!!formErrors.type}>
                <InputLabel>Type *</InputLabel>
                <Select
                  value={formData.type || 'boutique'}
                  label='Type *'
                  onChange={(e) => onFormDataChange({ ...formData, type: e.target.value as any })}
                >
                  <MenuItem value='boutique'>Boutique</MenuItem>
                  <MenuItem value='salon-coiffure-homme'>Salon Homme</MenuItem>
                  <MenuItem value='salon-coiffure-femme'>Salon Femme</MenuItem>
                  <MenuItem value='salon-coiffure-mixte'>Salon Mixte</MenuItem>
                </Select>
                {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth required={mode === 'create'} error={!!formErrors.owner}>
                <InputLabel>Propriétaire {mode === 'create' ? '*' : ''}</InputLabel>
                <Select
                  value={formData.owner || ''}
                  label={`Propriétaire ${mode === 'create' ? '*' : ''}`}
                  onChange={(e) => onFormDataChange({ ...formData, owner: e.target.value })}
                  disabled={loadingProviders || mode === 'edit'}
                >
                  <MenuItem value=''>
                    <em>Sélectionner un propriétaire</em>
                  </MenuItem>
                  {providers.map((provider) => (
                    <MenuItem key={provider._id} value={provider._id}>
                      {provider.firstname} {provider.lastname} ({provider.email})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.owner && <FormHelperText>{formErrors.owner}</FormHelperText>}
                {loadingProviders && <FormHelperText>Chargement des providers...</FormHelperText>}
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  label='Statut'
                  onChange={(e) => onFormDataChange({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value='active'>Actif</MenuItem>
                  <MenuItem value='inactive'>Inactif</MenuItem>
                  <MenuItem value='suspended'>Suspendu</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <TextField
                label='Email'
                type='email'
                value={formData.email || ''}
                onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-mail' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                label='RCCM'
                value={formData.rccm || ''}
                onChange={(e) => onFormDataChange({ ...formData, rccm: e.target.value })}
                fullWidth
                helperText='Registre du Commerce et du Crédit Mobilier'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-file-text' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                label='Adresse'
                value={formData.address || ''}
                onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
                fullWidth
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-map-pin' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                label='Pays'
                value={formData.pays || ''}
                onChange={(e) => onFormDataChange({ ...formData, pays: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-world' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                label="Jours d'ouverture"
                value={formData.joursOuverture || ''}
                onChange={(e) => onFormDataChange({ ...formData, joursOuverture: e.target.value })}
                fullWidth
                helperText='Ex: Lundi - Vendredi, 9h - 18h'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-calendar' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                Réseaux sociaux
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }
                }}
              >
                <Box>
                  <TextField
                    label='WhatsApp'
                    value={formData.socialNetwork?.whatsapp || ''}
                    onChange={(e) => onFormDataChange({
                      ...formData,
                      socialNetwork: {
                        ...formData.socialNetwork,
                        whatsapp: e.target.value
                      }
                    })}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-brand-whatsapp' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
                <Box>
                  <TextField
                    label='Facebook'
                    value={formData.socialNetwork?.facebook || ''}
                    onChange={(e) => onFormDataChange({
                      ...formData,
                      socialNetwork: {
                        ...formData.socialNetwork,
                        facebook: e.target.value
                      }
                    })}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-brand-facebook' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
                <Box>
                  <TextField
                    label='Instagram'
                    value={formData.socialNetwork?.instagram || ''}
                    onChange={(e) => onFormDataChange({
                      ...formData,
                      socialNetwork: {
                        ...formData.socialNetwork,
                        instagram: e.target.value
                      }
                    })}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-brand-instagram' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                label='Description'
                value={formData.description || ''}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Box>
          </Box>

          {formErrors.submit && (
            <Alert severity='error' sx={{ mt: 2 }}>{formErrors.submit}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>Annuler</Button>
        <Button
          variant='contained'
          onClick={onSubmit}
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={16} /> : undefined}
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}


