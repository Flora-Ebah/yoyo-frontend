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

import { type LegalDocument } from '@/services/document.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'
import { getStatusColor, getStatusLabel, formatUserName, getDocumentTypeLabel } from '../utils/document.utils'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface DocumentTableProps {
  documents: LegalDocument[]
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
  onEdit: (document: LegalDocument) => void
  onDelete: (document: LegalDocument) => void
}

export const DocumentTable = ({
  documents,
  loading,
  error,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: DocumentTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box className='flex items-center justify-center' sx={{ minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : documents.length === 0 ? (
          <Alert severity='info'>Aucun document trouvé</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Titre</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Fichier</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((document) => (
                    <TableRow key={document._id} hover>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {document.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getDocumentTypeLabel(document.type)} palette='primary' />
                      </TableCell>
                      <TableCell>
                        {document.file ? (
                          <StatusPill label='Oui' palette='info' />
                        ) : (
                          <StatusPill label='Non' palette={toPalette('default')} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {formatUserName(document.user)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getStatusLabel(document.status)} palette={toPalette(getStatusColor(document.status))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <RowActions
                          actions={[
                            { label: 'Modifier', color: 'info', onClick: () => onEdit(document) },
                            { label: 'Supprimer', color: 'error', onClick: () => onDelete(document) }
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


