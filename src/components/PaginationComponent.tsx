'use client'

// MUI Imports
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

interface PaginationComponentProps {
  page: number
  totalPages: number
  totalRows: number
  countRowsPerPage: number
  onChange: (event: React.ChangeEvent<unknown>, page: number) => void
  showFirstButton?: boolean
  showLastButton?: boolean
  shape?: 'rounded' | 'circular'
  color?: 'primary' | 'secondary' | 'standard'
  variant?: 'text' | 'outlined' | 'tonal'
}

const PaginationComponent = ({
  page,
  totalPages,
  totalRows,
  countRowsPerPage,
  onChange,
  showFirstButton = true,
  showLastButton = true,
  shape = 'rounded',
  color = 'primary',
  variant = 'tonal'
}: PaginationComponentProps) => {
  // Calculer les indices de début et de fin
  const startIndex = totalRows === 0 ? 0 : (page - 1) * countRowsPerPage + 1
  const endIndex = Math.min(page * countRowsPerPage, totalRows)

  return (
    <Box className='flex justify-between items-center flex-wrap pli-6 border-bs bs-auto plb-[12.5px] gap-2'>
      <Typography color='text.disabled'>
        {totalRows === 0
          ? 'Aucune entrée'
          : `Affichage de ${startIndex} à ${endIndex} sur ${totalRows} entrées`}
      </Typography>
      <Pagination
        shape={shape}
        color={color}
        variant={variant}
        count={totalPages}
        page={page}
        onChange={onChange}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
      />
    </Box>
  )
}

export default PaginationComponent

