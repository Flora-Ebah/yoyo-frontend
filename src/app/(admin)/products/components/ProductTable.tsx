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
import { type Product } from '@/services/product.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'
import { getStatusColor, getStatusLabel, formatPrice, formatStoreName, formatCategoryName } from '../utils/product.utils'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface ProductTableProps {
  products: Product[]
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
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export const ProductTable = ({
  products,
  loading,
  error,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete
}: ProductTableProps) => {
  return (
    <Card>
      <CardContent>
        {loading ? (
          <Box className='flex items-center justify-center' sx={{ minHeight: '200px' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity='error'>{error}</Alert>
        ) : products.length === 0 ? (
          <Alert severity='info'>Aucun produit trouvé</Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Boutique</TableCell>
                    <TableCell>Prix</TableCell>
                    <TableCell>Disponibilité</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date de création</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id} hover>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {product.name}
                        </Typography>
                        {product.description && (
                          <Typography variant='caption' color='text.secondary' display='block'>
                            {product.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {formatCategoryName(product.category)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {formatStoreName(product.store)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' fontWeight={500}>
                          {formatPrice(product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          label={product.disponibilite ? 'Disponible' : 'Rupture'}
                          palette={product.disponibilite ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusPill label={getStatusLabel(product.status)} palette={toPalette(getStatusColor(product.status))} />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {new Date(product.createdAt).toLocaleDateString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <RowActions
                          actions={[
                            { label: 'Modifier', color: 'info', onClick: () => onEdit(product) },
                            { label: 'Supprimer', color: 'error', onClick: () => onDelete(product) }
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

