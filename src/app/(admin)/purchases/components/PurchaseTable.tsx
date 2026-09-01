'use client'

// React Imports

import { useRouter } from 'next/navigation'

// MUI Imports
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

// Type Imports
import type { Purchase } from '@/services/purchase.service'
import { StatusPill, RowActions, type UiPalette } from '@/components/ui'

const toPalette = (c?: string): UiPalette => (!c || c === 'default' ? 'secondary' : (c as UiPalette))

interface PurchaseTableProps {
  purchases: Purchase[]
  loading: boolean
  page: number
  limit: number
  total: number
  onPageChange: (newPage: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

const formatCurrency = (amount: number, currency = 'XAF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  
return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    case 'refunded':
      return 'info'
    default:
      return 'default'
  }
}

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Payé'
    case 'pending':
      return 'En attente'
    case 'failed':
      return 'Échoué'
    case 'refunded':
      return 'Remboursé'
    default:
      return status
  }
}

export const PurchaseTable = ({
  purchases,
  loading,
  page,
  limit,
  total,
  onPageChange,
  onRowsPerPageChange
}: PurchaseTableProps) => {
  const router = useRouter()

  const handleChangePage = (_: unknown, newPage: number) => {
    onPageChange(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange(parseInt(event.target.value, 10))
  }

  return (
    <Card>
      <CardContent>
        <Box className='flex items-center justify-between flex-wrap gap-2'>
          <Box>
            <Typography variant='h6'>Liste des achats</Typography>
            <Typography variant='body2' color='text.secondary'>
              {total} éléments au total
            </Typography>
          </Box>
        </Box>
      </CardContent>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='table des achats'>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Élément</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Statut Paiement</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align='center'>
                      Aucun achat trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map(purchase => {
                    const user = typeof purchase.user === 'object' ? purchase.user : null
                    const userName = user

                      ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || user.email
                      : 'Inconnu'

                    const itemName = purchase.metadata?.packName || purchase.itemId || '-'

                    return (
                      <TableRow key={purchase._id} hover>
                        <TableCell>
                          <Typography variant='body2'>{formatDate(purchase.createdAt)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant='body2' sx={{ fontWeight: 600 }}>
                              {userName}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {user?.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={purchase.type === 'pack' ? 'Pack' : 'Abonnement'}
                            palette={purchase.type === 'pack' ? 'primary' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{itemName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>
                            {formatCurrency(purchase.amount, purchase.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={getPaymentStatusLabel(purchase.paymentStatus)}
                            palette={toPalette(getPaymentStatusColor(purchase.paymentStatus))}
                          />
                        </TableCell>
                        <TableCell align='right'>
                          <RowActions
                            actions={[
                              { label: 'Voir', color: 'info', onClick: () => router.push(`/purchases/${purchase._id}`) }
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component='div'
            count={total}
            rowsPerPage={limit}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage='Lignes par page :'
          />
        </>
      )}
    </Card>
  )
}
