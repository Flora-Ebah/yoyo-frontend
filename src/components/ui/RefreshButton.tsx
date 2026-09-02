'use client'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

type RefreshButtonProps = {
  onClick: () => void
  spinning?: boolean
  label?: string
  /** pousse le bouton à droite dans un conteneur flex */
  pushRight?: boolean
}

/**
 * Bouton « Actualiser » standard : texte sur desktop (sm+), icône SVG seule sur
 * mobile, carré, teinté primaire. À placer à droite dans les en-têtes de page.
 */
export const RefreshButton = ({ onClick, spinning, label = 'Actualiser', pushRight = true }: RefreshButtonProps) => {
  const theme = useTheme()

  return (
    <Box
      component='button'
      onClick={onClick}
      disabled={spinning}
      aria-label={label}
      title={label}
      sx={{
        ...(pushRight ? { ml: 'auto' } : {}),
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        height: 36,
        width: { xs: 36, sm: 'auto' },
        px: { xs: 0, sm: 2 },
        border: 'none',
        borderRadius: 0,
        cursor: spinning ? 'default' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 600,
        color: 'primary.main',
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        transition: 'background-color .15s',
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
        '& svg': spinning ? { animation: 'yoyo-spin .8s linear infinite' } : undefined,
        '@keyframes yoyo-spin': { to: { transform: 'rotate(360deg)' } }
      }}
    >
      <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
        <path d='M21 3v5h-5' />
        <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
        <path d='M8 16H3v5' />
      </svg>
      <Box component='span' sx={{ display: { xs: 'none', sm: 'inline' } }}>{label}</Box>
    </Box>
  )
}

export default RefreshButton
