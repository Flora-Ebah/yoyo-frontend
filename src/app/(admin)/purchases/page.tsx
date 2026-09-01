'use client'

import { useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

import PageContainer from '@/components/PageContainer'

// Local Imports
import { PurchaseTable } from './components/PurchaseTable'
import { PurchaseFilters } from './components/PurchaseFilters'
import { usePurchases } from './hooks/usePurchases'

export default function PurchasesPage() {
  // États pour les filtres
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all')
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string>('all')

  // Pagination (MUI DataGrid / TablePagination utilise 0-indexé, notre API 1-indexé)
  // usePurchases gère la conversion, ici on garde 0-indexé pour l'UI
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  // Hook pour charger les achats
  const { purchases, pagination, loading, error, reload } = usePurchases({
    page,
    limit,
    type: typeFilter,
    paymentStatus: paymentStatusFilter,
    subscriptionStatus: subscriptionStatusFilter
  })

  // Gestion de la pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setLimit(rowsPerPage)
    setPage(0)
  }

  // Gestion des filtres
  const handleTypeChange = (value: string) => {
    setTypeFilter(value)
    setPage(0)
  }

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatusFilter(value)
    setPage(0)
  }

  const handleSubscriptionStatusChange = (value: string) => {
    setSubscriptionStatusFilter(value)
    setPage(0)
  }

  const handleResetFilters = () => {
    setTypeFilter('all')
    setPaymentStatusFilter('all')
    setSubscriptionStatusFilter('all')
    setPage(0)
  }

  const pageStats = useMemo(() => {
    const totalAmount = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0)
    const completed = purchases.filter(purchase => purchase.paymentStatus === 'completed').length
    const pending = purchases.filter(purchase => purchase.paymentStatus === 'pending').length
    const failed = purchases.filter(purchase => purchase.paymentStatus === 'failed').length
    const refunded = purchases.filter(purchase => purchase.paymentStatus === 'refunded').length

    return {
      totalAmount,
      completed,
      pending,
      failed,
      refunded
    }
  }, [purchases])

  return (
    <PageContainer
      centerContent={false}
      title='Achats'
      subtitle='Suivez les transactions, paiements et abonnements de vos utilisateurs.'
    >
      <Box className='flex flex-col gap-6'>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  Total achats
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `${theme.palette.primary.main}20`,
                    color: theme => theme.palette.primary.main
                  }}
                >
                  <i className='tabler-shopping-cart text-xl' />
                </Box>
              </Box>
              <Typography variant='h5' fontWeight={700}>
                {pagination.total}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  Payés
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `${theme.palette.success.main}20`,
                    color: theme => theme.palette.success.main
                  }}
                >
                  <i className='tabler-check text-xl' />
                </Box>
              </Box>
              <Typography variant='h5' fontWeight={700}>
                {pageStats.completed}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  En attente
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `${theme.palette.warning.main}20`,
                    color: theme => theme.palette.warning.main
                  }}
                >
                  <i className='tabler-clock text-xl' />
                </Box>
              </Box>
              <Typography variant='h5' fontWeight={700}>
                {pageStats.pending}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  Échoués
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `${theme.palette.error.main}20`,
                    color: theme => theme.palette.error.main
                  }}
                >
                  <i className='tabler-alert-circle text-xl' />
                </Box>
              </Box>
              <Typography variant='h5' fontWeight={700}>
                {pageStats.failed}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  Remboursés
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `${theme.palette.info.main}20`,
                    color: theme => theme.palette.info.main
                  }}
                >
                  <i className='tabler-rotate text-xl' />
                </Box>
              </Box>
              <Typography variant='h5' fontWeight={700}>
                {pageStats.refunded}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-3'>
                <Typography variant='body2' color='text.secondary'>
                  Montant
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme => `${theme.palette.secondary.main}20`,
                    color: theme => theme.palette.secondary.main
                  }}
                >
                  <i className='tabler-currency-dollar text-xl' />
                </Box>
              </Box>
              <Typography variant='h5' fontWeight={700}>
                {pageStats.totalAmount.toLocaleString('fr-FR')} XAF
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Card>
          <PurchaseFilters
            onTypeChange={handleTypeChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onSubscriptionStatusChange={handleSubscriptionStatusChange}
            onReset={handleResetFilters}
          />
        </Card>

        {error && (
          <Alert
            severity='error'
            action={
              <Button color='inherit' size='small' onClick={reload}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <PurchaseTable
          purchases={purchases}
          loading={loading}
          page={page}
          limit={limit}
          total={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Box>
    </PageContainer>
  )
}
