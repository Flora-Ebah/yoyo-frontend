import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

interface ProductFiltersProps {
  filters: {
    store?: string
    category?: string
    disponibilite?: boolean
    search?: string
    onlyActive?: boolean
  }
  onFilterChange: (filters: ProductFiltersProps['filters']) => void
  stores?: any[]
  categories?: any[]
}

export const ProductFilters = ({ filters, onFilterChange, stores, categories }: ProductFiltersProps) => {
  return (
    <Box className='flex flex-wrap gap-3 mb-4'>
      <TextField
        label='Rechercher'
        size='small'
        value={filters.search || ''}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        sx={{ minWidth: 200 }}
        InputProps={{
          startAdornment: <i className='tabler-search mr-2' />
        }}
      />
      {stores && stores.length > 0 && (
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Boutique</InputLabel>
          <Select
            value={filters.store || ''}
            label='Boutique'
            onChange={(e) => onFilterChange({ ...filters, store: e.target.value || undefined })}
          >
            <MenuItem value=''>Toutes</MenuItem>
            {stores.map((store) => (
              <MenuItem key={store._id} value={store._id}>
                {store.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {categories && categories.length > 0 && (
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={filters.category || ''}
            label='Catégorie'
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
          >
            <MenuItem value=''>Toutes</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Disponibilité</InputLabel>
        <Select
          value={filters.disponibilite === undefined ? '' : filters.disponibilite ? 'true' : 'false'}
          label='Disponibilité'
          onChange={(e) => {
            const value = String(e.target.value)

            onFilterChange({
              ...filters,
              disponibilite: value === '' ? undefined : value === 'true'
            })
          }}
        >
          <MenuItem value=''>Tous</MenuItem>
          <MenuItem value='true'>Disponible</MenuItem>
          <MenuItem value='false'>Rupture</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}


