'use client'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { SystemMode } from '@core/types'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Styled Components
const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const NotFound = ({ mode }: { mode: SystemMode }) => {
  // Vars
  const darkImg = '/images/pages/misc-mask-dark.png'
  const lightImg = '/images/pages/misc-mask-light.png'
  const router = useRouter()

  // Hooks
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const miscBackground = useImageVariant(mode, lightImg, darkImg)

  const handleGoBack = () => {
    router.back()
  }

  return (
    <Box className='flex items-center justify-center min-bs-[100dvh] relative p-6 overflow-x-hidden'>
      <Box className='flex items-center flex-col text-center max-w-2xl'>
        <Box className='flex flex-col gap-4 mbe-8'>
          <Typography
            className='font-medium text-8xl md:text-9xl'
            color='text.primary'
            sx={{ lineHeight: 1, fontWeight: 700 }}
          >
            404
          </Typography>
          <Box className='flex flex-col gap-2'>
            <Typography variant='h3' className='font-semibold'>
              Page introuvable
            </Typography>
            <Typography variant='body1' className='text-textSecondary max-w-md mx-auto'>
              La page que vous recherchez n&apos;existe pas ou a été déplacée. Vérifiez l&apos;URL ou retournez à
              l&apos;accueil.
            </Typography>
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} className='mbe-8'>
          <Button
            href='/dashboard'
            component={Link}
            variant='contained'
            size='large'
            startIcon={<i className='tabler-home' />}
          >
            Retour à l&apos;accueil
          </Button>
          <Button
            variant='outlined'
            size='large'
            onClick={handleGoBack}
            startIcon={<i className='tabler-arrow-left' />}
          >
            Page précédente
          </Button>
        </Stack>

        <Box
          className='flex items-center justify-center mbs-8'
          sx={{
            width: 200,
            height: 200,
            borderRadius: '50%',
            backgroundColor: 'var(--mui-palette-error-lightOpacity)',
            color: 'var(--mui-palette-error-main)'
          }}
        >
          <i className='tabler-alert-octagon' style={{ fontSize: '6rem' }} />
        </Box>
      </Box>
      {!hidden && (
        <MaskImg
          alt='mask'
          src={miscBackground}
          className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
        />
      )}
    </Box>
  )
}

export default NotFound
