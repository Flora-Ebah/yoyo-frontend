'use client'

import type { SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'

import Alert from '@mui/material/Alert'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'

import PageContainer from '@/components/PageContainer'
import { useSocket } from '@/contexts/SocketContext'
import { categoryService } from '@/services/category.service'
import { productService } from '@/services/product.service'
import { storeService } from '@/services/store.service'
import { ProductFilters } from './components/ProductFilters'
import { ProductFormDialog } from './components/ProductFormDialog'
import { ProductHeader } from './components/ProductHeader'
import { ProductTable } from './components/ProductTable'
import { useProductActions } from './hooks/useProductActions'
import { useProductForm } from './hooks/useProductForm'
import { useProducts } from './hooks/useProducts'

type ProductCreatedEvent = {
  productId: string | null
  name: string | null
  status: string | null
}

export default function ProductsPage() {
  const [stores, setStores] = useState<any[]>([])

  const [stats, setStats] = useState<{
    total: number
    active: number
    pending: number
    denied: number
    outOfStock: number
  } | null>(null)

  const [productCreatedToastOpen, setProductCreatedToastOpen] = useState(false)
  const [productCreatedToastMessage, setProductCreatedToastMessage] = useState('')

  const { on, off } = useSocket()

  const {
    products,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleRowsPerPageChange,
    handleFilterChange,
    refresh
  } = useProducts({ page: 1, limit: 10 })

  const {
    dialogOpen,
    formMode,
    formData,
    setFormData,
    formErrors,
    submitting,
    categories: formCategories,
    stores: formStores,
    loadingCategories,
    loadingStores,
    handleEdit,
    handleSubmit,
    handleClose
  } = useProductForm({ onSuccess: refresh })

  const { deleteProduct } = useProductActions({
    onSuccess: refresh
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [storesRes, statsRes] = await Promise.all([
          storeService.getAll({ onlyActive: true, limit: 100 }).catch(() => ({ data: [] })),
          productService.getStats().catch(() => null)
        ])

        setStores(storesRes.data || [])
        setStats(statsRes || null)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const handleProductCreated = (data: ProductCreatedEvent) => {
      const name = data.name || 'Nouveau produit'

      setProductCreatedToastMessage(`Produit créé
 : ${name}`)
      setProductCreatedToastOpen(true)
      refresh()
    }

    on<ProductCreatedEvent>('product:created', handleProductCreated)

    return () => {
      off<ProductCreatedEvent>('product:created', handleProductCreated)
    }
  }, [on, off, refresh])

  const handleProductCreatedToastClose = (event?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setProductCreatedToastOpen(false)
  }

  return (
    <PageContainer>
      <ProductHeader />

      {stats && (
        <Grid container spacing={6} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, sm: 3, md: 3, lg: 3 }}>
            <Card>
              <CardContent className='flex flex-col items-center'>
                <Typography variant='h4' color='primary'>
                  {stats.total}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 3, md: 3, lg: 3 }}>
            <Card>
              <CardContent className='flex flex-col items-center'>
                <Typography variant='h4' color='primary'>
                  {stats.active}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Actifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
            <Card>
              <CardContent className='flex flex-col items-center'>
                <Typography variant='h4' color='primary'>
                  {stats.pending}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  En attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
            <Card>
              <CardContent className='flex flex-col items-center'>
                <Typography variant='h4' color='primary'>
                  {stats.denied}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Rejetés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 2, md: 2, lg: 2 }}>
            <Card>
              <CardContent className='flex flex-col items-center'>
                <Typography variant='h4' color='primary'>
                  {stats.outOfStock}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Rupture de stock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ProductFilters filters={filters} onFilterChange={handleFilterChange} stores={stores} />
      <ProductTable
        products={products}
        loading={loading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEdit}
        onDelete={deleteProduct}
      />
      <ProductFormDialog
        open={dialogOpen}
        mode={formMode}
        formData={formData}
        formErrors={formErrors}
        submitting={submitting}
        categories={formCategories}
        stores={formStores}
        loadingCategories={loadingCategories}
        loadingStores={loadingStores}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
      <Snackbar
        open={productCreatedToastOpen}
        autoHideDuration={4000}
        onClose={handleProductCreatedToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleProductCreatedToastClose} severity='success' variant='filled' sx={{ width: '100%' }}>
          {productCreatedToastMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  )
}
