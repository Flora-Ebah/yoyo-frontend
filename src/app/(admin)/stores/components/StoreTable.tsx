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
import { type Store } from '@/services/store.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'
import { getStatusColor, getStatusLabel, getTypeColor, getTypeLabel, formatOwnerName } from '../utils/store.utils'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface StoreTableProps {
  stores: Store[]
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
  onEdit: (store: Store) => void
  onDelete: (store: Store) => void
}

export const StoreTable = ({
  stores,
  loading,
  error,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: StoreTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box className='flex items-center justify-center' sx={{ minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : stores.length === 0 ? (
          <Alert severity='info'>Aucune boutique trouvée</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Propriétaire</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Adresse</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow key={store._id} hover>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {store.name}
                        </Typography>
                        {store.description && (
                          <Typography variant='caption' color='text.secondary' display='block'>
                            {store.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getTypeLabel(store.type)} palette={toPalette(getTypeColor(store.type))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {formatOwnerName(store.owner)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {store.email || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {store.address || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getStatusLabel(store.status)} palette={toPalette(getStatusColor(store.status))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(store.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <RowActions
                          actions={[
                            { label: 'Modifier', color: 'info', onClick: () => onEdit(store) },
                            { label: 'Supprimer', color: 'error', onClick: () => onDelete(store) }
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
              page={pagination.page - 1}
              onPageChange={(_event, newPage) => onPageChange(newPage + 1)}
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

