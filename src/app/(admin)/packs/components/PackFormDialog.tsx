import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import { type CreatePackRequest } from '@/services/pack.service'

interface PackFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreatePackRequest
  formErrors: Record<string, string>
  submitting: boolean
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreatePackRequest) => void
}

export const PackFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  onClose,
  onSubmit,
  onFormDataChange
}: PackFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Nouveau pack' : 'Modifier le pack'}
      </DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4 mt-2'>
          <TextField
            label='Nom *'
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            error={!!formErrors.name}
            helperText={formErrors.name}
            fullWidth
          />

          <TextField
            label='Slug'
            value={formData.slug}
            onChange={(e) => onFormDataChange({ ...formData, slug: e.target.value })}
            helperText='Généré automatiquement si vide'
            fullWidth
          />

          <TextField
            label='Description'
            value={formData.description || ''}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />

          <Box className='flex gap-4'>
            <TextField
              label='Prix (XOF) *'
              type='number'
              value={formData.price}
              onChange={(e) => onFormDataChange({ ...formData, price: parseFloat(e.target.value) || 0 })}
              error={!!formErrors.price}
              helperText={formErrors.price}
              fullWidth
              inputProps={{ min: 0, step: 100 }}
            />

            <TextField
              label="Nombre d'éléments *"
              type='number'
              value={formData.nombreElements}
              onChange={(e) => onFormDataChange({ ...formData, nombreElements: parseInt(e.target.value, 10) || 1 })}
              error={!!formErrors.nombreElements}
              helperText={formErrors.nombreElements}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Type *</InputLabel>
            <Select
              value={formData.type}
              label='Type *'
              onChange={(e) => onFormDataChange({ ...formData, type: e.target.value as any })}
              error={!!formErrors.type}
            >
              <MenuItem value='produit'>Produit</MenuItem>
              <MenuItem value='outil'>Outil</MenuItem>
              <MenuItem value='service'>Service</MenuItem>
            </Select>
            {formErrors.type && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {formErrors.type}
              </Box>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select
              value={formData.status || 'active'}
              label='Statut'
              onChange={(e) => onFormDataChange({ ...formData, status: e.target.value as any })}
            >
              <MenuItem value='active'>Actif</MenuItem>
              <MenuItem value='inactive'>Inactif</MenuItem>
              <MenuItem value='archived'>Archivé</MenuItem>
            </Select>
          </FormControl>

          {formErrors.submit && (
            <Alert severity='error'>{formErrors.submit}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>Annuler</Button>
        <Button
          variant='contained'
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={20} /> : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

