import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { profileService, type Profile } from '@/services/profile.service'
import { type CreateUserRequest, type UpdateUserRequest } from '@/services/user.service'

interface UserFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateUserRequest | UpdateUserRequest
  formErrors: Record<string, string>
  submitting: boolean
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateUserRequest | UpdateUserRequest) => void
}

const steps = ['Informations de compte', 'Informations personnelles', 'Confirmation']

export const UserFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  onClose,
  onSubmit,
  onFormDataChange
}: UserFormDialogProps) => {
  const [activeStep, setActiveStep] = useState(0)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  // Charger les profils au montage et quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      loadProfiles()
    }
  }, [open])

  const loadProfiles = async () => {
    try {
      setLoadingProfiles(true)
      const response = await profileService.getAll({ status: 'active' })

      setProfiles(response || [])
    } catch (error) {
      console.error('Erreur lors du chargement des profils:', error)
    } finally {
      setLoadingProfiles(false)
    }
  }

  // Réinitialiser le stepper quand le dialog s'ouvre
  const handleDialogOpen = () => {
    if (mode === 'create') {
      setActiveStep(0)
    }
  }

  const handleNext = () => {
    // Validation de l'étape actuelle
    if (activeStep === 0) {
      // Validation des informations de compte
      if (!formData.contact || formData.contact.trim() === '') {
        return
      }

      if (mode === 'create' && !(formData as CreateUserRequest).password) {
        return
      }
    } else if (activeStep === 1) {
      // Validation des informations personnelles (optionnel)
      // Pas de validation stricte ici, on peut passer
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleCloseDialog = () => {
    setActiveStep(0)
    onClose()
  }

  // Rendu du contenu selon l'étape
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Card
            variant='outlined'
            sx={{
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box className='flex items-center gap-2 mb-4'>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='tabler-mail text-xl' />
                </Box>
                <Typography variant='h6' fontWeight={600} color='primary'>
                  Informations de compte
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Configurez les informations d'identification et de sécurité
              </Typography>
              <Box className='flex flex-col gap-4'>
                <TextField
                  label='Email'
                  type='email'
                  value={formData.email || ''}
                  onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email || 'Adresse email pour la communication'}
                  fullWidth
                  variant='outlined'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-mail text-xl' />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label='Contact *'
                  value={formData.contact || ''}
                  onChange={(e) => onFormDataChange({ ...formData, contact: e.target.value })}
                  error={!!formErrors.contact}
                  helperText={formErrors.contact || 'Numéro de téléphone requis'}
                  fullWidth
                  required
                  variant='outlined'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-phone text-xl' />
                      </InputAdornment>
                    )
                  }}
                />
                <FormControl fullWidth error={!!formErrors.profile} variant='outlined'>
                  <InputLabel>Profil</InputLabel>
                  <Select
                    value={formData.profile || ''}
                    label='Profil'
                    onChange={(e) => onFormDataChange({ ...formData, profile: e.target.value || undefined })}
                    disabled={loadingProfiles}
                    startAdornment={
                      <InputAdornment position='start'>
                        <i className='tabler-user-circle text-xl' />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value=''>
                      <em>Aucun profil</em>
                    </MenuItem>
                    {profiles.map((profile) => (
                      <MenuItem key={profile._id} value={profile._id}>
                        <Box className='flex items-center gap-2'>
                          <i className='tabler-badge text-lg' />
                          {profile.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.profile && <FormHelperText>{formErrors.profile}</FormHelperText>}
                  {!formErrors.profile && (
                    <FormHelperText>
                      {loadingProfiles ? 'Chargement des profils...' : 'Sélectionnez un profil pour attribuer des habilitations'}
                    </FormHelperText>
                  )}
                </FormControl>
                {mode === 'create' && (
                  <TextField
                    label='Mot de passe *'
                    type='password'
                    value={(formData as CreateUserRequest).password || ''}
                    onChange={(e) => onFormDataChange({ ...formData, password: e.target.value } as CreateUserRequest)}
                    error={!!formErrors.password}
                    helperText={formErrors.password || 'Minimum 6 caractères recommandé'}
                    fullWidth
                    required
                    variant='outlined'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-lock text-xl' />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
                <FormControl fullWidth error={!!formErrors.status} variant='outlined'>
                  <InputLabel>Statut *</InputLabel>
                  <Select
                    value={formData.status || 'active'}
                    label='Statut *'
                    onChange={(e) => onFormDataChange({ ...formData, status: e.target.value as any })}
                    startAdornment={
                      <InputAdornment position='start'>
                        <i className='tabler-toggle-left text-xl' />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value='active'>
                      <Box className='flex items-center gap-2'>
                        <i className='tabler-circle-check text-success' />
                        Actif
                      </Box>
                    </MenuItem>
                    <MenuItem value='inactive'>
                      <Box className='flex items-center gap-2'>
                        <i className='tabler-circle-x text-secondary' />
                        Inactif
                      </Box>
                    </MenuItem>
                    <MenuItem value='pending'>
                      <Box className='flex items-center gap-2'>
                        <i className='tabler-clock text-warning' />
                        En attente
                      </Box>
                    </MenuItem>
                    <MenuItem value='suspended'>
                      <Box className='flex items-center gap-2'>
                        <i className='tabler-ban text-error' />
                        Suspendu
                      </Box>
                    </MenuItem>
                    <MenuItem value='banned'>
                      <Box className='flex items-center gap-2'>
                        <i className='tabler-shield-x text-error' />
                        Banni
                      </Box>
                    </MenuItem>
                  </Select>
                  {formErrors.status && <FormHelperText>{formErrors.status}</FormHelperText>}
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        )
      case 1:
        return (
          <Card
            variant='outlined'
            sx={{
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box className='flex items-center gap-2 mb-4'>
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='tabler-user text-xl' />
                </Box>
                <Typography variant='h6' fontWeight={600} color='primary'>
                  Informations personnelles
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Renseignez l'identité de l'administrateur
              </Typography>
              <Box className='flex flex-col gap-4'>
                <TextField
                  label='Prénom'
                  value={formData.firstname || ''}
                  onChange={(e) => onFormDataChange({ ...formData, firstname: e.target.value })}
                  error={!!formErrors.firstname}
                  helperText={formErrors.firstname || 'Prénom de l\'administrateur'}
                  fullWidth
                  variant='outlined'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-user text-xl' />
                      </InputAdornment>
                    )
                  }}
                />
                <TextField
                  label='Nom'
                  value={formData.lastname || ''}
                  onChange={(e) => onFormDataChange({ ...formData, lastname: e.target.value })}
                  error={!!formErrors.lastname}
                  helperText={formErrors.lastname || 'Nom de famille de l\'administrateur'}
                  fullWidth
                  variant='outlined'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='tabler-user text-xl' />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        )
      case 2:
        return (
          <Card
            variant='outlined'
            sx={{
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'success.main',
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box className='flex items-center gap-2 mb-4'>
                <Box
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className='tabler-check-circle text-xl' />
                </Box>
                <Typography variant='h6' fontWeight={600} color='success.main'>
                  Confirmation
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
                Vérifiez les informations avant de créer le compte administrateur
              </Typography>

              <Box className='flex flex-col gap-1 mb-3'>
                <Card variant='outlined' sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Box className='flex items-start gap-2'>
                    <i className='tabler-user text-primary text-xl' />
                    <Box className='flex-1'>
                      <Typography variant='caption' fontWeight={600} color='text.secondary'>IDENTITÉ</Typography>
                      <Typography variant='body1' fontWeight={500}>
                        {formData.firstname || '-'} {formData.lastname || '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card variant='outlined' sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Box className='flex items-start gap-2'>
                    <i className='tabler-mail text-primary text-xl' />
                    <Box className='flex-1'>
                      <Typography variant='caption' fontWeight={600} color='text.secondary'>EMAIL</Typography>
                      <Typography variant='body1'>{formData.email || '-'}</Typography>
                    </Box>
                  </Box>
                </Card>

                <Card variant='outlined' sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Box className='flex items-start gap-2'>
                    <i className='tabler-phone text-primary text-xl' />
                    <Box className='flex-1'>
                      <Typography variant='caption' fontWeight={600} color='text.secondary'>CONTACT</Typography>
                      <Typography variant='body1'>{formData.contact || '-'}</Typography>
                    </Box>
                  </Box>
                </Card>

                <Card variant='outlined' sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Box className='flex items-start gap-2'>
                    <i className='tabler-user-circle text-primary text-xl' />
                    <Box className='flex-1'>
                      <Typography variant='caption' fontWeight={600} color='text.secondary'>PROFIL</Typography>
                      <Typography variant='body1'>
                        {formData.profile
                          ? profiles.find(p => p._id === formData.profile)?.name || '-'
                          : 'Aucun profil'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>

                <Card variant='outlined' sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Box className='flex items-start gap-2'>
                    <i className='tabler-toggle-left text-primary text-xl' />
                    <Box className='flex-1'>
                      <Typography variant='caption' fontWeight={600} color='text.secondary'>STATUT</Typography>
                      <Typography variant='body1'>
                        {formData.status === 'active' ? 'Actif' :
                         formData.status === 'inactive' ? 'Inactif' :
                         formData.status === 'pending' ? 'En attente' :
                         formData.status === 'suspended' ? 'Suspendu' :
                         formData.status === 'banned' ? 'Banni' : '-'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Box>

              {mode === 'create' && (
                <Alert
                  severity='success'
                  icon={<i className='tabler-shield-check' />}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'success.main'
                  }}
                >
                  <Typography variant='body2' fontWeight={600}>
                    Rôle : Administrateur
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Ce compte aura accès complet au backoffice avec tous les privilèges administrateur.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 0
        }
      }}
      TransitionProps={{
        onEntered: handleDialogOpen
      }}
    >
      <DialogTitle
        sx={{
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box className='flex items-center gap-2'>
          <i className='tabler-user-plus text-2xl' />
          <Typography variant='h5' fontWeight={600}>
            {mode === 'create' ? 'Nouvel administrateur' : "Modifier l'utilisateur"}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 10, pb: 3 }}>
        {mode === 'create' ? (
          <>
            <Stepper
              activeStep={activeStep}
              sx={{
                mb: 4,
                mt: 5,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: 'success.main'
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: 'primary.main',
                  fontWeight: 600
                }
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      icon: index === 0 ? <i className='tabler-mail' /> :
                            index === 1 ? <i className='tabler-user' /> :
                            <i className='tabler-check-circle' />
                    }}
                  >
                    <Typography variant='body2' fontWeight={activeStep === index ? 600 : 400}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            {renderStepContent(activeStep)}
            {formErrors.submit && (
              <Alert
                severity='error'
                icon={<i className='tabler-alert-circle' />}
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'error.main'
                }}
              >
                {formErrors.submit}
              </Alert>
            )}
          </>
        ) : (
          <Box className='flex flex-col gap-4'>
            {renderStepContent(0)}
            {renderStepContent(1)}
            {formErrors.submit && (
              <Alert
                severity='error'
                icon={<i className='tabler-alert-circle' />}
                sx={{
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'error.main'
                }}
              >
                {formErrors.submit}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <Divider />
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: 'action.hover',
          gap: 2,
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={handleCloseDialog}
          variant='outlined'
          color='secondary'
          sx={{ minWidth: 120 }}
        >
          Annuler
        </Button>
        {mode === 'create' ? (
          <Box className='flex gap-2'>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                variant='outlined'
                sx={{ minWidth: 120 }}
              >
                Précédent
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                variant='contained'
                sx={{ minWidth: 120 }}
              >
                Suivant
              </Button>
            ) : (
              <Button
                variant='contained'
                color='success'
                onClick={onSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : undefined}
                sx={{ minWidth: 140 }}
              >
                {submitting ? 'Création...' : 'Créer le compte'}
              </Button>
            )}
          </Box>
        ) : (
          <Button
            variant='contained'
            onClick={onSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
            sx={{ minWidth: 120 }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

