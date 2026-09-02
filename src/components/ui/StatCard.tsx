'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

export type UiPalette = 'primary' | 'success' | 'warning' | 'info' | 'error' | 'secondary'

export type StatCardProps = {
  label: string
  value: ReactNode
  caption?: string
  /** classe d'icône tabler, ex. 'tabler-users' */
  icon?: string
  palette?: UiPalette
  /** taille de la valeur (défaut 28) — utile pour les montants longs */
  valueFontSize?: number
}

/** Carte de statistique standard du back-office (libellé, valeur, légende, icône). */
export const StatCard = ({ label, value, caption, icon, palette = 'primary', valueFontSize = 28 }: StatCardProps) => {
  const theme = useTheme()
  const color = theme.palette[palette].main

  return (
    <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>{label}</Typography>
          {icon && (
            <Box sx={{ width: 38, height: 38, flexShrink: 0, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color, backgroundColor: alpha(color, 0.14) }}>
              <i className={`${icon} text-xl`} />
            </Box>
          )}
        </Box>
        <Typography sx={{ fontSize: valueFontSize, fontWeight: 800, color: 'text.primary', lineHeight: 1.1 }} noWrap>{value}</Typography>
        {caption && (
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }} noWrap>{caption}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export type StatCardGridProps = {
  children: ReactNode
  /** nombre de colonnes sur md+ (défaut 4) */
  columns?: number
}

/** Grille responsive pour aligner des StatCard (2 par ligne en mobile). */
export const StatCardGrid = ({ children, columns = 4 }: StatCardGridProps) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${columns}, 1fr)` }, gap: { xs: 2, sm: 3 } }}>
    {children}
  </Box>
)

export default StatCard
