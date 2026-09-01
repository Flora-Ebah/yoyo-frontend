import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import type { RoutineSoinSubType } from '@/services/routine-soin-subtype.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'
import { getRoutineSoinTypeLabel, getStatusColor, getStatusLabel } from '../utils/subtype.utils'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface SubTypeTableProps {
  subTypes: RoutineSoinSubType[]
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
  onEdit: (subType: RoutineSoinSubType) => void
  onDelete: (subType: RoutineSoinSubType) => void
  onRowClick?: (subType: RoutineSoinSubType) => void
}

export const SubTypeTable = ({
  subTypes,
  loading,
  error,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onRowClick
}: SubTypeTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box className='flex items-center justify-center' sx={{ minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : subTypes.length === 0 ? (
          <Alert severity='info'>Aucun sous-type trouvé</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Champs</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Dernière mise à jour</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subTypes.map(subType => (
                    <TableRow
                      key={subType._id}
                      hover
                      onClick={() => onRowClick?.(subType)}
                      sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                      <TableCell>
                        <Typography variant='body2' fontWeight={600}>
                          {subType.name}
                        </Typography>
                        {subType.description ? (
                          <Typography variant='caption' color='text.secondary' display='block' noWrap>
                            {subType.description}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {subType.slug || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getRoutineSoinTypeLabel(subType.type)} palette='primary' />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={subType.fields?.length ? `${subType.fields.length} champ(s)` : 'Aucun champ'}>
                          <Chip label={`${subType.fields?.length || 0}`} size='small' color='info' variant='outlined' />
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getStatusLabel(subType.status)} palette={toPalette(getStatusColor(subType.status))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(subType.updatedAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='right' onClick={e => e.stopPropagation()}>
                        <RowActions
                          actions={[
                            { label: 'Modifier', color: 'info', onClick: () => onEdit(subType) },
                            { label: 'Supprimer', color: 'error', onClick: () => onDelete(subType) }
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
              onRowsPerPageChange={event => onRowsPerPageChange(parseInt(event.target.value, 10))}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage='Lignes par page:'
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

