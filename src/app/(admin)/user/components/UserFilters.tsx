import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

interface UserFiltersProps {
  statusFilter: string
  roleFilter: string
  searchFilter: string
  hideRoleFilter?: boolean
  onStatusFilterChange: (value: string) => void
  onRoleFilterChange: (value: string) => void
  onSearchFilterChange: (value: string) => void
}

export const UserFilters = ({
  statusFilter,
  roleFilter,
  searchFilter,
  hideRoleFilter = false,
  onStatusFilterChange,
  onRoleFilterChange,
  onSearchFilterChange
}: UserFiltersProps) => {
  return (
    <Box className='flex flex-wrap gap-4'>
      <TextField
        size='small'
        placeholder='Rechercher par nom, email, contact...'
        value={searchFilter}
        onChange={e => onSearchFilterChange(e.target.value)}
        sx={{ minWidth: 250 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <i className='tabler-search' />
            </InputAdornment>
          )
        }}
      />

      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Statut</InputLabel>
        <Select value={statusFilter} label='Statut' onChange={e => onStatusFilterChange(e.target.value)}>
          <MenuItem value='all'>Tous les statuts</MenuItem>
          <MenuItem value='active'>Actif</MenuItem>
          <MenuItem value='inactive'>Inactif</MenuItem>
          <MenuItem value='suspended'>Suspendu</MenuItem>
          <MenuItem value='banned'>Banni</MenuItem>
          <MenuItem value='pending'>En attente</MenuItem>
        </Select>
      </FormControl>

      {!hideRoleFilter ? (
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>Role</InputLabel>
          <Select value={roleFilter} label='Role' onChange={e => onRoleFilterChange(e.target.value)}>
            <MenuItem value='all'>Tous les roles</MenuItem>
            <MenuItem value='admin'>Administrateur</MenuItem>
            <MenuItem value='provider'>Prestataire</MenuItem>
            <MenuItem value='user'>Utilisateur</MenuItem>
          </Select>
        </FormControl>
      ) : null}
    </Box>
  )
}
