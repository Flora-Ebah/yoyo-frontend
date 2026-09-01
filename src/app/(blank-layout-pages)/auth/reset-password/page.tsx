'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

import { authClientService } from '@/services/auth.client.service'
import { ROUTES } from '@/configs/constants'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [resetToken, setResetToken] = useState('')
  const [login, setLogin] = useState('')
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get('resetToken')
    const loginParam = searchParams.get('login')
    
    if (tokenParam) {
      setResetToken(tokenParam)
    } else {
      // Si pas de token, rediriger vers login
      router.push(ROUTES.auth.login)
    }
    
    if (loginParam) {
      setLogin(loginParam)
    }
  }, [searchParams, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!newPassword || !confirmPassword) {
      setError("Veuillez remplir tous les champs")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    try {
      setLoading(true)

      await authClientService.resetPassword({
        resetToken,
        newPassword,
        confirmPassword
      })

      setSuccess('Mot de passe réinitialisé avec succès.')

      // Rediriger vers login après 2 secondes
      setTimeout(() => {
        router.push(ROUTES.auth.login)
      }, 2000)

    } catch (err: any) {
      setError(err?.message || "Erreur lors de la réinitialisation.")
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
              <i className='tabler-key text-3xl text-white' />
            </Box>
            <Typography variant='h4' fontWeight={700} className='mb-2'>
              Nouveau mot de passe
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Définissez votre nouveau mot de passe {login ? `pour ${login}` : ''}
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
                label='Nouveau mot de passe'
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-lock text-xl text-textSecondary' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={showPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                fullWidth
                label='Confirmer le mot de passe'
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='tabler-lock text-xl text-textSecondary' />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={showConfirmPassword ? 'tabler-eye' : 'tabler-eye-off'} />
                      </IconButton>
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
                    Réinitialisation...
                  </>
                ) : (
                  'Réinitialiser le mot de passe'
                )}
              </Button>
            </Box>
          </form>

          <Box className='text-center mt-4'>
            <Link href={ROUTES.auth.login} className='no-underline'>
              <Typography variant='body2' color='text.secondary' sx={{ '&:hover': { color: 'primary.main' } }}>
                ← Retour à la connexion
              </Typography>
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
