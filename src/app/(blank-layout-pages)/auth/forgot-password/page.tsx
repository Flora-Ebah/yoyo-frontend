'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus_Jakarta_Sans } from 'next/font/google'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { ROUTES } from '@/configs/constants'
import { authClientService } from '@/services/auth.client.service'

// Police des apps mobiles YoYo
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

const BRAND = '#FF6100'
const BRAND_DARK = '#E85400'
const RADIUS = 0
const BORDER = '#E5E7EB'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!login) {
      setError("Veuillez renseigner votre email ou nom d'utilisateur")

      return
    }

    try {
      setLoading(true)

      const response = await authClientService.forgotPassword(login)

      setSuccess(response.message || 'Si un compte existe, un email a été envoyé.')

      setTimeout(() => {
        router.push(`${ROUTES.auth.verifyOtp}?login=${encodeURIComponent(login)}`)
      }, 2000)
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue lors de la demande.')
    } finally {
      setLoading(false)
    }
  }

  const labelSx = { fontSize: 13, fontWeight: 600, mb: 0.75, color: '#374151' }
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 44,
      borderRadius: RADIUS,
      '& fieldset': { borderColor: BORDER },
      '&:hover fieldset': { borderColor: '#D1D5DB' },
      '&.Mui-focused fieldset': { borderColor: BRAND, borderWidth: '1.5px' }
    },
    '& input::placeholder': { color: '#9CA3AF', opacity: 1, fontSize: 13 }
  }
  const alertSx = {
    mb: 2.5,
    borderRadius: RADIUS,
    py: 0.25,
    px: 1.25,
    alignItems: 'center',
    '& .MuiAlert-icon': { fontSize: 18, mr: 1, py: 0 },
    '& .MuiAlert-message': { py: 0.75, fontSize: 12.5, fontWeight: 700 },
    '& .MuiAlert-action': { pt: 0, mr: 0, '& svg': { fontSize: 16 } }
  }

  return (
    <Box className={jakarta.className} sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
      <style>{`.yoyo-login, .yoyo-login *{font-family:${jakarta.style.fontFamily} !important;} .yoyo-login input::-ms-reveal,.yoyo-login input::-ms-clear{display:none;}`}</style>

      <Box className='yoyo-login' sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 4, sm: 9 }, py: 2.25, borderBottom: `1px solid ${BORDER}` }}>
          <Image src='/images/logo/yoyo-wordmark.png' alt='YoYo' width={92} height={36} priority style={{ objectFit: 'contain' }} />
        </Box>

        {/* Contenu — centré */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
          <Box sx={{ width: '100%', maxWidth: 380 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.15, mb: 1, color: '#111827' }}>
              Mot de passe oublié
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 5 }}>
              Entrez votre email pour recevoir les instructions de réinitialisation.
            </Typography>

            {error && (
              <Alert severity='error' sx={alertSx} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity='success' sx={alertSx} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                <Box>
                  <Typography sx={labelSx}>Email ou nom d’utilisateur</Typography>
                  <TextField
                    fullWidth
                    size='small'
                    type='text'
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    disabled={loading}
                    placeholder='ex. nom@email.com'
                    sx={fieldSx}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>Vous vous souvenez ?</Typography>
                  <Link href={ROUTES.auth.login} className='no-underline'>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: BRAND, '&:hover': { textDecoration: 'underline' } }}>
                      Se connecter
                    </Typography>
                  </Link>
                </Box>

                <Button
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={loading}
                  disableElevation
                  sx={{
                    mt: 1,
                    height: 46,
                    py: 0,
                    borderRadius: RADIUS,
                    fontWeight: 700,
                    fontSize: 15,
                    textTransform: 'none',
                    bgcolor: BRAND,
                    '&:hover': { bgcolor: BRAND_DARK }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} color='inherit' className='mr-2' />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
