'use client'

// Third-party Imports
import classnames from 'classnames'

// MUI Imports
import Box from '@mui/material/Box'

// Type Imports
import type { ChildrenType } from '@core/types'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { usePermissions } from '@/hooks/usePermissions'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

// Styled Component Imports
import StyledMain from '@layouts/styles/shared/StyledMain'

const LayoutContent = ({ children }: ChildrenType) => {
  // Hooks
  const { settings } = useSettings()
  const { ready, can } = usePermissions()

  // Vars
  const contentCompact = settings.contentWidth === 'compact'
  const contentWide = settings.contentWidth === 'wide'

  // Un commercial (droit pros sans dashboard) profite de gouttières plus larges sur desktop.
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  return (
    <StyledMain
      isContentCompact={contentCompact}
      className={classnames(verticalLayoutClasses.content, 'flex-auto', {
        [`${verticalLayoutClasses.contentCompact} is-full`]: contentCompact,
        [verticalLayoutClasses.contentWide]: contentWide
      })}
    >
      {isCommercial ? (
        <Box sx={{ px: { xs: 0, lg: 16, xl: 24 }, width: '100%', maxWidth: { lg: 1040, xl: 1200 }, mx: { lg: 'auto' } }}>
          {children}
        </Box>
      ) : (
        children
      )}
    </StyledMain>
  )
}

export default LayoutContent
