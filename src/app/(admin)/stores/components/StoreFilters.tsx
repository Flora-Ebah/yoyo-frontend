import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

interface StoreFiltersProps {
  filters: {
    type?: string
    status?: string
    owner?: string
    search?: string
    onlyActive?: boolean
  }
  onFilterChange: (filters: StoreFiltersProps['filters']) => void
  providers?: any[]
}

export const StoreFilters = ({ filters, onFilterChange, providers }: StoreFiltersProps) => {
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
      <FormControl size='small' sx={{ minWidth: 180 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={filters.type || ''}
          label='Type'
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
        >
          <MenuItem value=''>Tous</MenuItem>
          <MenuItem value='boutique'>Boutique</MenuItem>
          <MenuItem value='salon-coiffure-homme'>Salon Homme</MenuItem>
          <MenuItem value='salon-coiffure-femme'>Salon Femme</MenuItem>
          <MenuItem value='salon-coiffure-mixte'>Salon Mixte</MenuItem>
        </Select>
      </FormControl>
      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Statut</InputLabel>
        <Select
          value={filters.status || ''}
          label='Statut'
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value || undefined })}
        >
          <MenuItem value=''>Tous</MenuItem>
          <MenuItem value='active'>Actif</MenuItem>
          <MenuItem value='inactive'>Inactif</MenuItem>
          <MenuItem value='suspended'>Suspendu</MenuItem>
        </Select>
      </FormControl>
      {providers && providers.length > 0 && (
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Propriétaire</InputLabel>
          <Select
            value={filters.owner || ''}
            label='Propriétaire'
            onChange={(e) => onFilterChange({ ...filters, owner: e.target.value || undefined })}
          >
            <MenuItem value=''>Tous</MenuItem>
            {providers.map((provider) => (
              <MenuItem key={provider._id} value={provider._id}>
                {provider.firstname} {provider.lastname} ({provider.email})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}

