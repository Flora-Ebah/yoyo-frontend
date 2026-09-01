'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Component Imports
import PageContainer from '@/components/PageContainer'

// Service Imports
import { soinService, type Soin } from '@/services/soin.service'
import { getStatusColor, getStatusLabel, formatUserName } from '../utils/soin.utils'

export default function SoinDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [soin, setSoin] = useState<Soin | null>(null)

  useEffect(() => {
    const loadSoin = async () => {
      if (!slug) {
        setError('Slug manquant')
        setLoading(false)

        return
      }

      try {
        setLoading(true)
        setError(null)

        const data = await soinService.getBySlug(slug)
        setSoin(data)
      } catch (err: any) {
        console.error('Erreur lors du chargement du soin:', err)
        setError(err.message || 'Erreur lors du chargement du soin')
      } finally {
        setLoading(false)
      }
    }

    loadSoin()
  }, [slug])

  if (loading) {
    return (
      <PageContainer>
        <Box className='flex items-center justify-center' sx={{ minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    )
  }

  if (error || !soin) {
    return (
      <PageContainer>
        <Alert severity='error' className='mb-4'>
          {error || 'Soin introuvable'}
        </Alert>
        <Button variant='contained' component={Link} href='/soins'>
          Retour à la liste
        </Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={soin.title}
      actions={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip label={getStatusLabel(soin.status)} color={getStatusColor(soin.status)} size='small' />
          <Button variant='text' component={Link} href='/soins'>
            Retour
          </Button>
        </Box>
      }
    >
      <Box className='flex flex-col gap-6'>
        {/* Informations principales */}
        <Card>
          <CardContent>
            <Box className='flex flex-col gap-4'>
              <Box>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Catégorie
                </Typography>
                <Chip
                  label={soin.category.name}
                  color='primary'
                  variant='outlined'
                  size='small'
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant='body2' color='text.secondary' className='mb-1'>
                  Créé par
                </Typography>
                <Typography variant='body1'>
                  {formatUserName(soin.user)}
                </Typography>
              </Box>

              <Divider />

              <Box className='flex gap-6 flex-wrap'>
                <Box>
                  <Typography variant='body2' color='text.secondary' className='mb-1'>
                    Date de création
                  </Typography>
                  <Typography variant='body1'>
                    {new Date(soin.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary' className='mb-1'>
                    Dernière modification
                  </Typography>
                  <Typography variant='body1'>
                    {new Date(soin.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Contenu */}
        {soin.content && (
          <Card>
            <CardContent>
              <Typography variant='h6' fontWeight={600} className='mb-4'>
                Contenu
              </Typography>
              <Box
                sx={{
                  '& p': {
                    marginBottom: '1rem'
                  },
                  '& ul, & ol': {
                    marginLeft: '1.5rem',
                    marginBottom: '1rem'
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    marginTop: '1.5rem',
                    marginBottom: '1rem',
                    fontWeight: 600
                  },
                  '& blockquote': {
                    borderLeft: '3px solid',
                    borderColor: 'divider',
                    paddingLeft: '1rem',
                    marginLeft: 0,
                    fontStyle: 'italic',
                    color: 'text.secondary'
                  }
                }}
                dangerouslySetInnerHTML={{ __html: soin.content }}
              />
            </CardContent>
          </Card>
        )}

        {!soin.content && (
          <Card>
            <CardContent>
              <Alert severity='info'>Aucun contenu disponible pour ce soin.</Alert>
            </CardContent>
          </Card>
        )}
      </Box>
    </PageContainer>
  )
}

