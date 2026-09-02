'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus_Jakarta_Sans } from 'next/font/google'

// MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

// Actions Imports
import { loginAction, resolveLandingRoute } from '@/app/actions/auth.actions'

// Util Imports
import { ROUTES } from '@/configs/constants'

// Police des apps mobiles YoYo
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

const BRAND = '#FF6100'
const BRAND_DARK = '#E85400'
const RADIUS = 0
const BORDER = '#E5E7EB'

export default function LoginPage() {
  // States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams?.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')

      return
    }

    try {
      setLoading(true)

      const result = await loginAction({
        login: email, // Le backend utilise 'login' (email ou username)
        password,
        rememberMe
      })

      if (result.success) {
        // Destination décidée par le backend (autoritaire) : un commercial va TOUJOURS
        // vers /commercial, jamais /dashboard, quel que soit le `redirect` mémorisé.
        let target = redirectUrl

        try {
          target = await resolveLandingRoute(searchParams?.get('redirect') || undefined)
        } catch {
          // repli : comportement précédent
        }

        window.location.href = target
      } else {
        setError(result.error || 'Erreur lors de la connexion')
      }
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error)
      setError(error.message || 'Une erreur est survenue')
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
            <Typography sx={{ fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.1, mb: 1, color: '#111827' }}>Connexion</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 5 }}>Ravi de vous revoir 👋</Typography>

            {error && (
              <Alert severity='error' sx={alertSx} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                {/* Email */}
                <Box>
                  <Typography sx={labelSx}>Email</Typography>
                  <TextField
                    fullWidth
                    size='small'
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    placeholder='ex. nom@email.com'
                    sx={fieldSx}
                  />
                </Box>

                {/* Mot de passe */}
                <Box>
                  <Typography sx={labelSx}>Mot de passe</Typography>
                  <TextField
                    fullWidth
                    size='small'
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder='Votre mot de passe'
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' size='small' onClick={() => setShowPassword(!showPassword)} disabled={loading} aria-label='Afficher/masquer le mot de passe'>
                            {showPassword ? (
                              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49' />
                                <path d='M14.084 14.158a3 3 0 0 1-4.242-4.242' />
                                <path d='M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143' />
                                <path d='m2 2 20 20' />
                              </svg>
                            ) : (
                              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#9CA3AF' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' />
                                <circle cx='12' cy='12' r='3' />
                              </svg>
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                {/* Remember + forgot */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size='small'
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        disabled={loading}
                        sx={{ '&.Mui-checked': { color: BRAND } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Se souvenir de moi</Typography>}
                  />
                  <Link href={ROUTES.auth.forgotPassword} className='no-underline'>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: BRAND, '&:hover': { textDecoration: 'underline' } }}>
                      Mot de passe oublié ?
                    </Typography>
                  </Link>
                </Box>

                {/* Bouton connexion */}
                <Button
                  fullWidth
                  variant='contained'
                  type='submit'
                  disabled={loading}
                  disableElevation
                  sx={{
                    mt: 1.5,
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
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
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
