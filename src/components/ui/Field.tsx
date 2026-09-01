'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export type FieldProps = {
  label: string
  required?: boolean
  children: ReactNode
}

/**
 * Champ de formulaire avec label AU-DESSUS (pas de label flottant sur l'input).
 * Enveloppe n'importe quel contrôle (TextField sans `label`, Select, etc.).
 */
export const Field = ({ label, required, children }: FieldProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
    <Typography component='label' sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
      {label}
      {required && <Box component='span' sx={{ color: 'error.main', ml: 0.25 }}>*</Box>}
    </Typography>
    {children}
  </Box>
)

export default Field
