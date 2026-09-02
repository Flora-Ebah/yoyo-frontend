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
import Typography from '@mui/material/Typography'
import { type CreateSoinRequest, type UpdateSoinRequest } from '@/services/soin.service'
import type { Category } from '@/services/category.service'
import { RichTextEditor } from '@/components/RichTextEditor'

interface SoinFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateSoinRequest | UpdateSoinRequest
  formErrors: Record<string, string>
  submitting: boolean
  availableCategories: Category[]
  loadingCategories: boolean
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateSoinRequest | UpdateSoinRequest) => void
}

export const SoinFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  availableCategories,
  loadingCategories,
  onClose,
  onSubmit,
  onFormDataChange
}: SoinFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Nouveau soin' : 'Modifier le soin'}
      </DialogTitle>
      <DialogContent>
        <Box className='flex flex-col gap-4 mt-2'>
          <TextField
            label='Titre *'
            value={formData.title}
            onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
            error={!!formErrors.title}
            helperText={formErrors.title}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Catégorie *</InputLabel>
            <Select
              value={formData.category}
              label='Catégorie *'
              onChange={(e) => onFormDataChange({ ...formData, category: e.target.value })}
              error={!!formErrors.category}
              disabled={loadingCategories}
            >
              {availableCategories.map((category) => (
                <MenuItem key={category._id} value={category.slug}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.category && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {formErrors.category}
              </Box>
            )}
          </FormControl>

          <Box>
            <Typography variant='body2' className='mb-2' color='text.secondary'>
              Contenu
            </Typography>
            <RichTextEditor
              value={formData.content || ''}
              onChange={(html) => onFormDataChange({ ...formData, content: html })}
              placeholder='Écrivez le contenu du soin...'
              minHeight={200}
              error={!!formErrors.content}
            />
            {formErrors.content && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                {formErrors.content}
              </Typography>
            )}
          </Box>

          {mode === 'edit' && 'status' in formData && (
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
          )}

          {formErrors.submit && (
            <Alert severity='error'>{formErrors.submit}</Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>Annuler</Button>
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

