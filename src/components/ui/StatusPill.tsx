'use client'

import Box from '@mui/material/Box'
import { alpha, useTheme } from '@mui/material/styles'

import type { UiPalette } from './StatCard'

export type StatusPillProps = {
  label: string
  palette?: UiPalette
}

/** Pastille de statut teintée (statuts, compteurs, tags). */
export const StatusPill = ({ label, palette = 'primary' }: StatusPillProps) => {
  const theme = useTheme()
  const color = theme.palette[palette].main

  return (
    <Box
      component='span'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        px: 1.25,
        py: 0.4,
        borderRadius: '999px',
        color,
        backgroundColor: alpha(color, 0.14),
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </Box>
  )
}

export default StatusPill
