'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'

import PageContainer from '@/components/PageContainer'
import type { Product, Store } from '@/services/product.service'
import { productService } from '@/services/product.service'

import {
  formatCategoryName,
  formatComposantNaturel,
  formatDate,
  formatPrice,
  formatProductFormat,
  formatTypeExtraction,
  getImageUrl,
  getStatusLabel
} from '../utils/product.utils'

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [openValidationDialog, setOpenValidationDialog] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'active' | 'denied'>('active')
  const [rejectionReason, setRejectionReason] = useState('')

  const id = params?.id as string

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const data = await productService.getById(id)

      setProduct(data)
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValidateClick = () => {
    setValidationStatus('active')
    setRejectionReason('')
    setOpenValidationDialog(true)
  }

  const handleValidationSubmit = async () => {
    if (!product) return

    try {
      await productService.update(product._id, {
        status: validationStatus,
        rejectionReason: validationStatus === 'denied' ? rejectionReason : undefined
      })
      setOpenValidationDialog(false)
      loadProduct()
    } catch (error) {
      console.error('Error updating product status:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!product) {
    return (
      <PageContainer>
        <Typography>Produit non trouvé</Typography>
      </PageContainer>
    )
  }

  const store = typeof product.store === 'object' ? (product.store as Store) : null
  const owner = store?.owner

  return (
    <PageContainer>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 8, md: 8, lg: 8 }}>
          <Card>
            <CardHeader title='Détails du produit' />
            <CardContent className='flex flex-col pbs-12 gap-6'>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
                <Box
                  sx={{
                    width: { xs: '100%', sm: 250 },
                    height: 250,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    p: 2,
                    flexShrink: 0
                  }}
                >
                  <img
                    src={getImageUrl(product.images)}
                    alt={product.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant='h5' fontWeight='bold' gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant='h4' color='primary' sx={{ mb: 2, fontWeight: 'bold' }}>
                    {formatPrice(product.price)}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    <Chip label={formatCategoryName(product.category)} color='default' variant='outlined' />
                    <Chip
                      label={product.disponibilite ? 'Disponible' : 'Indisponible'}
                      color={product.disponibilite ? 'success' : 'error'}
                      variant='filled'
                    />
                    <Chip
                      label={`Statut: ${getStatusLabel(product.status)}`}
                      color={product.status === 'active' ? 'success' : 'default'}
                      variant='outlined'
                    />
                  </Box>

                  <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    <Typography variant='caption' display='block'>
                      Ajouté le: {formatDate(product.createdAt)}
                    </Typography>
                    <Typography variant='caption' display='block'>
                      Dernière modification: {formatDate(product.updatedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant='body1' color='text.secondary' sx={{ whiteSpace: 'pre-line' }}>
                  {product.description || 'Aucune description disponible pour ce produit.'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box>
                <Typography variant='h6' gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Caractéristiques
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 2,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))'
                    }
                  }}
                >
                  {[
                    { label: "Type d'extraction", value: formatTypeExtraction(product.typeExtraction) },
                    { label: 'Volume', value: product.volume },
                    { label: 'Composante Principale', value: product.composantePrincipale },
                    { label: 'Format', value: formatProductFormat(product.format) },
                    { label: 'Dimension', value: product.dimension },
                    { label: 'Couleur', value: product.color },
                    { label: 'Composant naturel', value: formatComposantNaturel(product.composantNaturel) }
                  ].map(
                    (item, index) =>
                      item.value && (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2
                          }}
                        >
                          <Typography variant='body2' color='text.secondary'>
                            {item.label}
                          </Typography>
                          <Typography variant='body2' fontWeight='medium' textAlign='right'>
                            {item.value}
                          </Typography>
                        </Box>
                      )
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
          {product.status === 'denied' && product.rejectionReason && (
            <Card sx={{ mt: 3, borderColor: 'error.main', borderWidth: 1, borderStyle: 'solid' }}>
              <CardHeader title='Motif du refus' titleTypographyProps={{ color: 'error' }} />
              <Divider />
              <CardContent>
                <Typography color='error'>{product.rejectionReason}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column: Requester/Store Details */}
        <Grid size={{ xs: 12, sm: 4, md: 4, lg: 4 }}>
          <Card className='mb-6'>
            <CardHeader title='Détails du demandeur' />
            <CardContent className='flex flex-col pbs-12 gap-6'>
              <List dense disablePadding className='w-full'>
                <ListItem divider>
                  <ListItemText
                    primary='Nom'
                    secondary={store?.name || '-'}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                  />
                </ListItem>
                <ListItem divider>
                  <ListItemText
                    primary='Contact'
                    secondary={owner?.contact || '-'}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary='WhatsApp'
                    secondary={store?.socialNetwork?.whatsapp || '-'}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.primary' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Button
                fullWidth
                variant='contained'
                color={product.status === 'active' ? 'success' : 'primary'}
                onClick={handleValidateClick}
                size='large'
              >
                {product.status === 'active' ? 'Produit Validé' : 'Valider / Modifier Statut'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openValidationDialog} onClose={() => setOpenValidationDialog(false)}>
        <DialogTitle>Valider le produit</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, minWidth: 300 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={validationStatus}
                label='Statut'
                onChange={e => setValidationStatus(e.target.value as 'active' | 'denied')}
              >
                <MenuItem value='active'>Accepter</MenuItem>
                <MenuItem value='denied'>Refuser</MenuItem>
              </Select>
            </FormControl>

            {validationStatus === 'denied' && (
              <TextField
                fullWidth
                label='Motif du refus'
                multiline
                rows={4}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenValidationDialog(false)} disableElevation sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>Annuler</Button>
          <Button onClick={handleValidationSubmit} variant='contained'>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  )
}
