'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type PageHeaderProps = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

/**
 * En-tete standardise pour les pages admin.
 * Fournit une structure visuelle coherente (titre, sous-titre, actions).
 */
export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant='h4' fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary'>
            {subtitle}
          </Typography>
        )}
      </Stack>

      {actions}
    </Box>
  )
}

