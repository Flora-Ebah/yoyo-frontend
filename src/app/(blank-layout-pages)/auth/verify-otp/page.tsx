'use client'

import { Suspense, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { ROUTES } from '@/configs/constants'
import { authClientService } from '@/services/auth.client.service'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [login, setLogin] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loginParam = searchParams.get('login')

    if (loginParam) {
      setLogin(loginParam)
    } else {
      // Si pas de login, rediriger vers forgot password
      router.push(ROUTES.auth.forgotPassword)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!otp) {
      setError('Veuillez renseigner le code de vérification')

      return
    }

    try {
      setLoading(true)

      const response = await authClientService.verifyOTP({ login, otp })

      setSuccess(response.message || 'Code vérifié avec succès.')

      // Accéder au resetToken depuis data
      const responseData = (response as any).data

      if (responseData && responseData.resetToken) {
        // Rediriger vers la page de réinitialisation avec le token
        setTimeout(() => {
          router.push(
            `${ROUTES.auth.resetPassword}?resetToken=${encodeURIComponent(responseData.resetToken)}&login=${encodeURIComponent(login)}`
          )
        }, 1000)
      } else {
        // Fallback si pas de token (ne devrait pas arriver pour PASSWORD_RESET)
        setError('Impossible de récupérer le jeton de réinitialisation.')
      }
    } catch (err: any) {
      setError(err?.message || 'Code invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          boxShadow: theme => `0 20px 60px ${theme.palette.primary.main}40, 0 10px 30px ${theme.palette.primary.main}20`
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box className='text-center mb-6'>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: theme => `0 4px 12px ${theme.palette.primary.main}40`
              }}
            >
              <i className='tabler-shield-check text-3xl text-white' />
            </Box>
            <Typography variant='h4' fontWeight={700} className='mb-2'>
              Vérification
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Entrez le code reçu par email/SMS pour <strong>{login}</strong>
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' className='mb-4' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity='success' className='mb-4' onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Code de vérification'
                type='text'
                value={otp}
                onChange={e => setOtp(e.target.value)}
                disabled={loading}
                placeholder='123456'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-123 text-xl text-textSecondary' />
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                variant='contained'
                size='large'
                type='submit'
                disabled={loading}
                sx={{
                  py: 1.5
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color='inherit' className='mr-2' />
                    Vérification...
                  </>
                ) : (
                  'Vérifier le code'
                )}
              </Button>
            </Box>
          </form>

          <Box className='text-center mt-4 flex flex-col gap-2'>
            <Link href={ROUTES.auth.forgotPassword} className='no-underline'>
              <Typography variant='body2' color='text.secondary' sx={{ '&:hover': { color: 'primary.main' } }}>
                ← Renvoyer le code
              </Typography>
            </Link>
            <Link href={ROUTES.auth.login} className='no-underline'>
              <Typography variant='body2' color='text.secondary' sx={{ '&:hover': { color: 'primary.main' } }}>
                Retour à la connexion
              </Typography>
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <VerifyOtpContent />
    </Suspense>
  )
}
