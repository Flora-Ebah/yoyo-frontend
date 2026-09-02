import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { type CreateProductRequest, type UpdateProductRequest } from '@/services/product.service'

interface ProductFormDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  formData: CreateProductRequest | UpdateProductRequest
  formErrors: Record<string, string>
  submitting: boolean
  categories: any[]
  stores: any[]
  loadingCategories: boolean
  loadingStores: boolean
  onClose: () => void
  onSubmit: () => void
  onFormDataChange: (data: CreateProductRequest | UpdateProductRequest) => void
}

export const ProductFormDialog = ({
  open,
  mode,
  formData,
  formErrors,
  submitting,
  categories,
  stores,
  loadingCategories,
  loadingStores,
  onClose,
  onSubmit,
  onFormDataChange
}: ProductFormDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box className='flex items-center gap-2'>
          <i className='tabler-shopping-bag text-2xl' />
          <Typography variant='h5' fontWeight={600}>
            {mode === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
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
            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                disabled={mode === 'edit'}
                label='Nom *'
                value={formData.name || ''}
                onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
                error={!!formErrors.name}
                helperText={formErrors.name}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-shopping-bag' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                disabled={mode === 'edit'}
                label='Description'
                value={formData.description || ''}
                onChange={e => onFormDataChange({ ...formData, description: e.target.value })}
                multiline
                rows={2}
                fullWidth
              />
            </Box>

            <Box>
              <FormControl fullWidth required error={!!formErrors.category}>
                <InputLabel>Catégorie *</InputLabel>
                <Select
                  value={formData.category || ''}
                  label='Catégorie *'
                  onChange={e => onFormDataChange({ ...formData, category: e.target.value })}
                  disabled={loadingCategories || mode === 'edit'}
                >
                  <MenuItem value=''>
                    <em>Sélectionner une catégorie</em>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
                {loadingCategories && <FormHelperText>Chargement des catégories...</FormHelperText>}
              </FormControl>
            </Box>

            <Box>
              <FormControl fullWidth required error={!!formErrors.store}>
                <InputLabel>Boutique *</InputLabel>
                <Select
                  value={formData.store || ''}
                  label='Boutique *'
                  onChange={e => onFormDataChange({ ...formData, store: e.target.value })}
                  disabled={loadingStores || mode === 'edit'}
                >
                  <MenuItem value=''>
                    <em>Sélectionner une boutique</em>
                  </MenuItem>
                  {stores.map(store => (
                    <MenuItem key={store._id} value={store._id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.store && <FormHelperText>{formErrors.store}</FormHelperText>}
                {loadingStores && <FormHelperText>Chargement des boutiques...</FormHelperText>}
              </FormControl>
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label='Prix (XOF) *'
                type='number'
                value={formData.price || 0}
                onChange={e => onFormDataChange({ ...formData, price: parseFloat(e.target.value) || 0 })}
                error={!!formErrors.price}
                helperText={formErrors.price}
                fullWidth
                required
                inputProps={{ min: 0, step: 100 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-currency-franc' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.status || 'pending'}
                  label='Statut'
                  onChange={e => onFormDataChange({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value='pending'>En attente</MenuItem>
                  <MenuItem value='active'>Actif</MenuItem>
                  <MenuItem value='inactive'>Inactif</MenuItem>
                  <MenuItem value='denied'>Refusé</MenuItem>
                  <MenuItem value='out-of-stock'>Rupture de stock</MenuItem>
                  <MenuItem value='archived'>Archivé</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                Caractéristiques capillaires
              </Typography>
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label='Volume'
                value={formData.volume || ''}
                onChange={e => onFormDataChange({ ...formData, volume: e.target.value })}
                fullWidth
                placeholder='Ex: 250ml, 500ml, 1L'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-ruler' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label='Format'
                value={formData.format || ''}
                onChange={e => onFormDataChange({ ...formData, format: e.target.value })}
                fullWidth
                placeholder='Ex: Spray, Crème, Huile, Gel'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-package' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label='Composante principale'
                value={formData.composantePrincipale || ''}
                onChange={e => onFormDataChange({ ...formData, composantePrincipale: e.target.value })}
                fullWidth
                placeholder='Ingrédient principal'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-leaf' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label='Couleur'
                value={formData.color || ''}
                onChange={e => onFormDataChange({ ...formData, color: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-palette' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label='Dimension'
                value={formData.dimension || ''}
                onChange={e => onFormDataChange({ ...formData, dimension: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-ruler-2' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box>
              <TextField
                disabled={mode === 'edit'}
                label="Type d'extraction"
                value={formData.typeExtraction || ''}
                onChange={e => onFormDataChange({ ...formData, typeExtraction: e.target.value })}
                fullWidth
                placeholder='Pour les huiles'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-droplet' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={mode === 'edit'}
                    checked={Boolean(formData.composantNaturel)}
                    onChange={e => onFormDataChange({ ...formData, composantNaturel: e.target.checked as any })}
                  />
                }
                label='Composants naturels'
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <FormControlLabel
                control={
                  <Switch
                    disabled={mode === 'edit'}
                    checked={formData.disponibilite === undefined ? true : Boolean(formData.disponibilite)}
                    onChange={e => onFormDataChange({ ...formData, disponibilite: e.target.checked as any })}
                  />
                }
                label='Disponible'
              />
            </Box>

            <Box sx={{ gridColumn: '1 / -1' }}>
              <TextField
                disabled={mode === 'edit'}
                label='Contenu détaillé'
                value={formData.content || ''}
                onChange={e => onFormDataChange({ ...formData, content: e.target.value })}
                multiline
                rows={4}
                fullWidth
                helperText='Description détaillée du produit'
              />
            </Box>
          </Box>

          {formErrors.submit && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {formErrors.submit}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disableElevation sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>Annuler</Button>
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



