import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { Field } from '@/components/ui'
import { type Category, type CreateCategoryRequest } from '@/services/category.service'

interface CategoryFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateCategoryRequest
  formErrors: Record<string, string>
  submitting: boolean
  parentCategories: Category[]
  selectedCategoryId?: string
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateCategoryRequest) => void
}

export const CategoryFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  parentCategories,
  selectedCategoryId,
  onClose,
  onSubmit,
  onFormDataChange
}: CategoryFormDialogProps) => {
  const theme = useTheme()

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { boxShadow: 'none' } }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
          <i className='tabler-category' style={{ fontSize: '1.35rem' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
            {mode === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>Taxonomie des services et produits.</Typography>
        </Box>
        <IconButton size='small' onClick={onClose}><i className='tabler-x' /></IconButton>
      </Box>

      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Field label='Nom' required>
            <TextField
              size='small'
              placeholder='Nom de la catégorie'
              value={formData.name}
              onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              fullWidth
            />
          </Field>

          <Field label='Slug'>
            <TextField
              size='small'
              placeholder='Généré automatiquement si vide'
              value={formData.slug}
              onChange={e => onFormDataChange({ ...formData, slug: e.target.value })}
              fullWidth
            />
          </Field>

          <Field label='Description'>
            <TextField
              size='small'
              placeholder='Quelques mots sur la catégorie…'
              value={formData.content || ''}
              onChange={e => onFormDataChange({ ...formData, content: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
          </Field>

          <Field label='Catégorie parente'>
            <Select
              size='small'
              fullWidth
              displayEmpty
              value={formData.parent || ''}
              onChange={e => onFormDataChange({ ...formData, parent: e.target.value === '' ? null : e.target.value })}
              renderValue={val => {
                if (!val) return <Box component='span' sx={{ color: 'text.disabled' }}>Aucune (catégorie racine)</Box>

                return parentCategories.find(c => c._id === val)?.name || ''
              }}
            >
              <MenuItem value=''><em>Aucune (catégorie racine)</em></MenuItem>
              {parentCategories
                .filter(cat => (mode === 'edit' ? cat._id !== selectedCategoryId : true))
                .map(category => (
                  <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                ))}
            </Select>
          </Field>

          <Field label='Statut'>
            <Select
              size='small'
              fullWidth
              value={formData.status || 'active'}
              onChange={e => onFormDataChange({ ...formData, status: e.target.value as any })}
            >
              <MenuItem value='active'>Actif</MenuItem>
              <MenuItem value='inactive'>Inactif</MenuItem>
              <MenuItem value='archived'>Archivé</MenuItem>
            </Select>
          </Field>

          {formErrors.submit && <Alert severity='error'>{formErrors.submit}</Alert>}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
          <Button onClick={onClose} disableElevation sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
            Annuler
          </Button>
          <Button
            variant='contained'
            onClick={onSubmit}
            disabled={submitting}
            disableElevation
            startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : undefined}
            sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5 }}
          >
            Enregistrer
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
