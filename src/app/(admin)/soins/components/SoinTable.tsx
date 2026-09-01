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
import Link from 'next/link'
import { type Soin } from '@/services/soin.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'
import { getStatusColor, getStatusLabel, formatUserName } from '../utils/soin.utils'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface SoinTableProps {
  soins: Soin[]
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
  onEdit: (soin: Soin) => void
  onDelete: (soin: Soin) => void
}

export const SoinTable = ({
  soins,
  loading,
  error,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: SoinTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box className='flex items-center justify-center' sx={{ minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : soins.length === 0 ? (
          <Alert severity='info'>Aucun soin trouvé</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Titre</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {soins.map((soin) => (
                    <TableRow key={soin._id} hover>
                      <TableCell>
                        <Typography
                          variant='body2'
                          fontWeight={500}
                          component={Link}
                          href={`/soins/${soin.slug}`}
                          sx={{
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {soin.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={soin.category.name} palette='primary' />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {formatUserName(soin.user)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getStatusLabel(soin.status)} palette={toPalette(getStatusColor(soin.status))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(soin.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <RowActions
                          actions={[
                            { label: 'Modifier', color: 'info', onClick: () => onEdit(soin) },
                            { label: 'Supprimer', color: 'error', onClick: () => onDelete(soin) }
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

