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

import { type CreateDocumentRequest, type UpdateDocumentRequest } from '@/services/document.service'
import { RichTextEditor } from '@/components/RichTextEditor'
import { DOCUMENT_TYPES } from '../utils/document.utils'

interface DocumentFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateDocumentRequest | UpdateDocumentRequest
  formErrors: Record<string, string>
  submitting: boolean
  fileUploading: boolean
  fileName: string | null
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateDocumentRequest | UpdateDocumentRequest) => void
  onFileSelect: (file: File | null) => void
  onClearFile: () => void
}

export const DocumentFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  fileUploading,
  fileName,
  onClose,
  onSubmit,
  onFormDataChange,
  onFileSelect,
  onClearFile
}: DocumentFormDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
    >
      <DialogTitle>
        {mode === 'create' ? 'Nouveau document' : 'Modifier le document'}
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
            <InputLabel>Type *</InputLabel>
            <Select
              value={formData.type}
              label='Type *'
              onChange={(e) => onFormDataChange({ ...formData, type: e.target.value })}
              error={!!formErrors.type}
            >
              {DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            {formErrors.type && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1.75 }}>
                {formErrors.type}
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
              placeholder='Ecrivez le contenu du document...'
              minHeight={200}
              error={!!formErrors.content}
            />
            {formErrors.content && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                {formErrors.content}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant='body2' className='mb-2' color='text.secondary'>
              Fichier (optionnel)
            </Typography>
            <Box className='flex flex-wrap items-center gap-2'>
              <Button variant='outlined' component='label' disabled={fileUploading}>
                {fileUploading ? 'Telechargement...' : 'Choisir un fichier'}
                <input
                  type='file'
                  hidden
                  onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
                />
              </Button>
              {fileName && (
                <Typography variant='body2' color='text.secondary'>
                  {fileName}
                </Typography>
              )}
              {formData.file && (
                <Button variant='text' color='error' onClick={onClearFile}>
                  Retirer
                </Button>
              )}
            </Box>
            {formErrors.file && (
              <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                {formErrors.file}
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
                <MenuItem value='archived'>Archive</MenuItem>
              </Select>
            </FormControl>
          )}

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


