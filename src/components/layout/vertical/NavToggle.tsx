'use client'

// Lucide Icons
import { PanelLeft } from 'lucide-react'

// MUI Imports
import IconButton from '@mui/material/IconButton'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { usePermissions } from '@/hooks/usePermissions'

const NavToggle = () => {
  // Hooks
  const { toggleVerticalNav, isBreakpointReached } = useVerticalNav()
  const { ready, can } = usePermissions()

  // Commercial (droit pros, pas dashboard) : pas de sidebar → pas de hamburger.
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  if (isCommercial || !isBreakpointReached) return null

  return (
    <IconButton
      onClick={() => toggleVerticalNav()}
      aria-label='Ouvrir le menu'
      sx={{
        height: 40,
        width: 40,
        borderRadius: '6px',
        border: '1px solid var(--mui-palette-divider)',
        backgroundColor: 'var(--mui-palette-background-paper)',
        color: 'var(--mui-palette-text-primary)',
        '&:hover': { backgroundColor: 'var(--mui-palette-action-hover)' }
      }}
    >
      <PanelLeft size={20} />
    </IconButton>
  )
}

export default NavToggle
