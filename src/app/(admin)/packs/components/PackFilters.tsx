import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

interface PackFiltersProps {
  statusFilter: string
  typeFilter: string
  onStatusFilterChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
}

export const PackFilters = ({
  statusFilter,
  typeFilter,
  onStatusFilterChange,
  onTypeFilterChange
}: PackFiltersProps) => {
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
              <MenuItem value='archived'>Archivé</MenuItem>
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 200 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label='Type'
              onChange={(e) => onTypeFilterChange(e.target.value)}
            >
              <MenuItem value='all'>Tous</MenuItem>
              <MenuItem value='produit'>Produit</MenuItem>
              <MenuItem value='outil'>Outil</MenuItem>
              <MenuItem value='service'>Service</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  )
}

