'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

export type SectionCardProps = {
  /** titre affiché dans l'en-tête (optionnel) */
  title?: ReactNode
  /** actions à droite du titre (optionnel) */
  action?: ReactNode
  /** occupe toute la hauteur : flex column, la zone de contenu devient extensible/scrollable */
  fill?: boolean
  children: ReactNode
}

/**
 * Carte de section carrée (bord droit) utilisée pour envelopper tableaux et
 * contenus de liste. En-tête optionnel avec titre + actions.
 */
export const SectionCard = ({ title, action, fill, children }: SectionCardProps) => (
  <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden', ...(fill ? { display: 'flex', flexDirection: 'column', height: '100%' } : {}) }}>
    {(title || action) && (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'nowrap', px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        {typeof title === 'string' ? (
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
        ) : (
          title
        )}
        {action && <Box sx={{ ml: 'auto', flexShrink: 0 }}>{action}</Box>}
      </Box>
    )}
    {fill ? <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</Box> : children}
  </Card>
)

export default SectionCard
