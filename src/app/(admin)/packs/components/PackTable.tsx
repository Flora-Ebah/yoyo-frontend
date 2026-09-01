import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import { type Pack } from '@/services/pack.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'
import { getStatusColor, getStatusLabel, getTypeColor, getTypeLabel, formatPrice } from '../utils/pack.utils'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface PackTableProps {
  packs: Pack[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  onEdit: (pack: Pack) => void
  onDelete: (pack: Pack) => void
}

export const PackTable = ({
  packs,
  loading,
  error,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: PackTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box className='flex items-center justify-center' sx={{ minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : packs.length === 0 ? (
          <Alert severity='info'>Aucun pack trouvé</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Prix</TableCell>
                    <TableCell>Nombre d'éléments</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packs.map((pack) => (
                    <TableRow key={pack._id} hover>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {pack.name}
                        </Typography>
                        {pack.description && (
                          <Typography variant='caption' color='text.secondary' display='block'>
                            {pack.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getTypeLabel(pack.type)} palette={toPalette(getTypeColor(pack.type))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {formatPrice(pack.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {pack.nombreElements}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getStatusLabel(pack.status)} palette={toPalette(getStatusColor(pack.status))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(pack.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <RowActions
                          actions={[
                            { label: 'Modifier', color: 'info', onClick: () => onEdit(pack) },
                            { label: 'Supprimer', color: 'error', onClick: () => onDelete(pack) }
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component='div'
              count={pagination.total}
              page={pagination.page}
              onPageChange={(_event, newPage) => onPageChange(newPage)}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage='Lignes par page:'
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

