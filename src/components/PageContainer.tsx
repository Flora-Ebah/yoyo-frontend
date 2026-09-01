'use client'

import type { ReactNode } from 'react'

import classnames from 'classnames'

import Box from '@mui/material/Box'

// Type Imports
import type { ChildrenType } from '@core/types'

import PageHeader from './page/PageHeader'

type Props = ChildrenType & {
  className?: string
  hasPadding?: boolean
  centerContent?: boolean
  title?: string
  subtitle?: string
  actions?: ReactNode
  gap?: number | string
}

/**
 * Composant conteneur pour les pages qui s'aligne avec la largeur du navbar
 * et propose une structure visuelle coherente (header + contenu).
 */
const PageContainer = ({
  children,
  className,
  hasPadding = true,
  centerContent = false,
  title,
  subtitle,
  actions,
  gap = 6
}: Props) => {
  return (
    <div
      className={classnames(
        // Centrage conditionnel - si true, on centre avec mli-auto
        // Si false, on remplit toute la largeur (pas de mli-auto)
        centerContent && 'mli-auto',

        // Limites de largeur conditionnelles - seulement si on centre
        // Correspond exactement a la navbar: inline-size calc(100% - 48px) avec margin-inline auto
        centerContent && [
          // Mobile: largeur avec marges (comme navbar)
          'is-[calc(100%-48px)]',

          // Desktop 900px: max-width calc(900px - 48px)
          'md:is-[calc(100%-48px)] md:max-is-[calc(900px-48px)]',

          // Desktop 1200px: max-width calc(1200px - 48px)
          'lg:is-[calc(100%-48px)] lg:max-is-[calc(1200px-48px)]',

          // Desktop 1920px: max-width calc(1440px - 48px)
          'xl:is-[calc(100%-48px)] xl:max-is-[calc(1440px-48px)]'
        ],

        // Si centerContent est false, on remplit toute la largeur
        !centerContent && 'is-full',

        // Padding conditionnel
        hasPadding && 'pt-6 pb-6',

        className
      )}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap
        }}
      >
        {title && <PageHeader title={title} subtitle={subtitle} actions={actions} />}
        {children}
      </Box>
    </div>
  )
}

export default PageContainer