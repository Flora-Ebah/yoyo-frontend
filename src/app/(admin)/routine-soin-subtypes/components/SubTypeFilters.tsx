import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'

import { ROUTINE_SOIN_SUBTYPE_STATUSES, ROUTINE_SOIN_TYPES } from '../utils/subtype.utils'

interface SubTypeFiltersProps {
  statusFilter: string
  typeFilter: string
  search: string
  onStatusFilterChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
  onSearchChange: (value: string) => void
}

export const SubTypeFilters = ({
  statusFilter,
  typeFilter,
  search,
  onStatusFilterChange,
  onTypeFilterChange,
  onSearchChange
}: SubTypeFiltersProps) => {
  return (
    <Card>
      <CardContent>
        <Box className='flex gap-4 flex-wrap items-center'>
          <TextField
            size='small'
            label='Rechercher (nom ou slug)'
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            sx={{ minWidth: 260 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='tabler-search' />
                </InputAdornment>
              )
            }}
          />

          <FormControl size='small' sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} label='Type' onChange={e => onTypeFilterChange(e.target.value)}>
              <MenuItem value='all'>Tous</MenuItem>
              {ROUTINE_SOIN_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={statusFilter} label='Statut' onChange={e => onStatusFilterChange(e.target.value)}>
              <MenuItem value='all'>Tous</MenuItem>
              {ROUTINE_SOIN_SUBTYPE_STATUSES.map(status => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}

