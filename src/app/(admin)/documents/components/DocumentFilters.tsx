import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { DOCUMENT_TYPES } from '../utils/document.utils'

interface DocumentFiltersProps {
  statusFilter: string
  typeFilter: string
  onStatusFilterChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
}

export const DocumentFilters = ({
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange
}: DocumentFiltersProps) => {
  return (
    <Card>
      <CardContent>
        <Box className='flex gap-4 flex-wrap'>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label='Statut'
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value='all'>Tous</MenuItem>
              <MenuItem value='active'>Actif</MenuItem>
              <MenuItem value='inactive'>Inactif</MenuItem>
              <MenuItem value='archived'>Archive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 220 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label='Type'
              onChange={(e) => onTypeFilterChange(e.target.value)}
            >
              <MenuItem value='all'>Tous</MenuItem>
              {DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}

