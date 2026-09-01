'use client'

import type { MouseEvent } from 'react'

import Box from '@mui/material/Box'

import type { UiPalette } from './StatCard'

export type RowAction = {
  label: string
  onClick: () => void
  /** couleur du texte (défaut primary ; ex. 'error' pour Supprimer) */
  color?: UiPalette
  disabled?: boolean
}

/**
 * Actions de ligne SOUS FORME DE TEXTE (pas d'icône ni de menu «…»).
 * Ex. « Voir · Modifier · Supprimer ». Chaque action est un libellé cliquable.
 */
export const RowActions = ({ actions, align = 'right' }: { actions: RowAction[]; align?: 'left' | 'right' }) => {
  const stop = (e: MouseEvent) => e.stopPropagation()

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2, justifyContent: align === 'left' ? 'flex-start' : 'flex-end' }} onClick={stop}>
      {actions.map((a, i) => (
        <Box
          key={a.label + i}
          component='button'
          type='button'
          disabled={a.disabled}
          onClick={e => { stop(e); a.onClick() }}
          sx={{
            border: 'none',
            background: 'none',
            p: 0,
            font: 'inherit',
            cursor: a.disabled ? 'not-allowed' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: a.disabled ? 'text.disabled' : `${a.color || 'primary'}.main`,
            opacity: a.disabled ? 0.6 : 1,
            '&:hover': { textDecoration: a.disabled ? 'none' : 'underline' }
          }}
        >
          {a.label}
        </Box>
      ))}
    </Box>
  )
}

export default RowActions
