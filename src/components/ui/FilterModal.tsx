'use client'

import { useState, type ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

type FilterModalProps = {
  /** un filtre est actif (point indicateur + couleur du bouton) */
  active?: boolean
  /** synchronise le brouillon avec les valeurs appliquées à l'ouverture */
  onOpen?: () => void
  /** valide le brouillon (commit des filtres) */
  onApply: () => void
  /** réinitialise les filtres */
  onReset: () => void
  title?: string
  subtitle?: string
  /** les champs du filtre, chacun sous la forme <Box><label/><control/></Box> */
  children: ReactNode
}

const Funnel = ({ size = 16 }: { size?: number }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z' />
  </svg>
)

/**
 * Bouton « Filtre » (carré, fond + bordure) ouvrant un modal contenant les
 * filtres, avec Appliquer / Réinitialiser. Le brouillon n'est appliqué qu'au
 * clic sur Appliquer. La page fournit les champs (liés à son état brouillon).
 */
export const FilterModal = ({ active, onOpen, onApply, onReset, title = 'Filtrer', subtitle, children }: FilterModalProps) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    onOpen?.()
    setOpen(true)
  }

  const apply = () => {
    onApply()
    setOpen(false)
  }

  const reset = () => {
    onReset()
    setOpen(false)
  }

  return (
    <>
      <Box
        component='button'
        onClick={handleOpen}
        aria-label='Filtre'
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.75, flexShrink: 0,
          height: 36, px: 1.5, cursor: 'pointer',
          borderRadius: 0, border: 'none',
          backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : 'action.hover',
          color: active ? 'primary.main' : 'text.secondary',
          fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          transition: 'color .15s, background-color .15s',
          '&:hover': { color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }
        }}
      >
        <Funnel />
        Filtre
        {active && <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'primary.main', ml: 0.25 }} />}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='xs' fullWidth PaperProps={{ sx: { boxShadow: 'none', borderRadius: 0 } }}>
        {/* En-tête */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
            <Funnel size={20} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{subtitle}</Typography>}
          </Box>
          <IconButton size='small' onClick={() => setOpen(false)}><i className='tabler-x' /></IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, '& > * > *:last-child': { width: '100%' } }}>
            {children}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3 }}>
            <Button onClick={reset} disableElevation sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              Réinitialiser
            </Button>
            <Button onClick={apply} disableElevation variant='contained' sx={{ height: 36, borderRadius: 0, textTransform: 'none', px: 2.5 }}>
              Appliquer
            </Button>
          </Box>
        </Box>
      </Dialog>
    </>
  )
}

/** Champ de filtre étiqueté pour le modal : <FilterField label><control/></FilterField>. */
export const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <Box>
    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 0.75 }}>{label}</Typography>
    {children}
  </Box>
)

export default FilterModal
