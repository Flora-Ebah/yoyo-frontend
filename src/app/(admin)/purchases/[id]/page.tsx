'use client'

// React Imports
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Component Imports
import PageContainer from '@/components/PageContainer'

// Service Imports
import { purchaseService, type Purchase } from '@/services/purchase.service'

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

export default function PurchaseDetailsPage() {
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchase, setPurchase] = useState<Purchase | null>(null)

  useEffect(() => {
    const loadPurchase = async () => {
      if (!id) return

      try {
        setLoading(true)
        setError(null)
        const data = await purchaseService.getById(id)
        setPurchase(data)
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'achat:', err)
        setError(err.message || 'Impossible de charger les details de l\'achat')
      } finally {
        setLoading(false)
      }
    }

    loadPurchase()
  }, [id])

  if (loading) {
    return (
      <Box className='flex items-center justify-center min-h-[400px]'>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !purchase) {
    return (
      <PageContainer>
        <Alert severity='error' className='mb-6'>
          {error || 'Achat introuvable'}
        </Alert>
        <Button variant='contained' component={Link} href='/purchases'>
          Retour à la liste
        </Button>
      </PageContainer>
    )
  }

  const user = typeof purchase.user === 'object' ? purchase.user : null

  return (
    <PageContainer
      title="Détails de l'achat"
      actions={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            label={purchase.paymentStatus === 'completed' ? 'Paye' : purchase.paymentStatus}
            color={purchase.paymentStatus === 'completed' ? 'success' : purchase.paymentStatus === 'pending' ? 'warning' : 'error'}
            variant='filled'
          />
          <Button variant='outlined' component={Link} href='/purchases'>
            Retour
          </Button>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'grid',
          gap: 6,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 8fr) minmax(0, 4fr)' }
        }}
      >
        {/* Info Principales */}
        <Box>
          <Card className='mb-6'>
            <CardHeader title='Informations Générales' />
            <Divider />
            <CardContent>
              <Box
                sx={{
                  display: 'grid',
                  gap: 4,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
                }}
              >
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>ID Transaction</Typography>
                  <Typography variant='body1'>{purchase.transactionId || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>Date</Typography>
                  <Typography variant='body1'>{formatDate(purchase.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>Montant</Typography>
                  <Typography variant='h6' color='primary.main'>
                    {formatCurrency(purchase.amount, purchase.currency)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>Type</Typography>
                  <Typography variant='body1' sx={{ textTransform: 'capitalize' }}>
                    {purchase.type === 'pack' ? 'Pack' : 'Abonnement'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='subtitle2' color='text.secondary'>Méthode de paiement</Typography>
                  <Typography variant='body1'>
                    {purchase.paymentMethod || '-'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Détails de l'élément acheté */}
          <Card>
            <CardHeader title={`Détails du ${purchase.type === 'pack' ? 'Pack' : 'Abonnement'}`} />
            <Divider />
            <CardContent>
                <Box
                sx={{
                  display: 'grid',
                  gap: 4,
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }
                }}
              >
                    <Box>
                        <Typography variant='subtitle2' color='text.secondary'>Nom</Typography>
                        <Typography variant='body1'>
                            {purchase.metadata?.packName || purchase.itemId || '-'}
                        </Typography>
                    </Box>
                     {purchase.type === 'pack' && (
                        <Box>
                            <Typography variant='subtitle2' color='text.secondary'>Nombre d'éléments</Typography>
                            <Typography variant='body1'>
                                {purchase.metadata?.nombreElements || '-'}
                            </Typography>
                        </Box>
                     )}
                     {purchase.type === 'subscription' && (
                        <>
                            <Box>
                                <Typography variant='subtitle2' color='text.secondary'>Début</Typography>
                                <Typography variant='body1'>{formatDate(purchase.subscriptionStartDate!)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant='subtitle2' color='text.secondary'>Fin</Typography>
                                <Typography variant='body1'>{formatDate(purchase.subscriptionEndDate!)}</Typography>
                            </Box>
                             <Box>
                                <Typography variant='subtitle2' color='text.secondary'>Statut Abonnement</Typography>
                                <Typography variant='body1'>{purchase.subscriptionStatus || '-'}</Typography>
                            </Box>
                        </>
                     )}
                </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Sidebar Info Client */}
        <Box>
          <Card>
            <CardHeader title='Client' />
            <Divider />
            <CardContent>
              {user ? (
                <Box className='flex flex-col gap-4'>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>Nom complet</Typography>
                    <Typography variant='body1' fontWeight={600}>
                      {user.firstname} {user.lastname}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>Email</Typography>
                    <Typography variant='body1'>{user.email}</Typography>
                  </Box>
                  {user.username && (
                    <Box>
                        <Typography variant='subtitle2' color='text.secondary'>Nom d'utilisateur</Typography>
                        <Typography variant='body1'>{user.username}</Typography>
                    </Box>
                  )}
                  <Button variant='outlined' size='small' component={Link} href={`/user/view/${user._id}`}>
                    Voir profil
                  </Button>
                </Box>
              ) : (
                <Typography color='text.secondary'>Information client non disponible</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageContainer>
  )
}





