'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import Link from 'next/link'

// Lucide Icons
import { PanelLeft, PanelLeftClose } from 'lucide-react'

// MUI Imports
import { styled, useColorScheme, useTheme } from '@mui/material/styles'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import VerticalNav, { NavHeader, NavCollapseIcons } from '@menu/vertical-menu'
import VerticalMenu from './VerticalMenu'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { useSettings } from '@core/hooks/useSettings'
import { usePermissions } from '@/hooks/usePermissions'

// Style Imports
import navigationCustomStyles from '@core/styles/vertical/navigationCustomStyles'

// Config Imports
import { APP_CONFIG } from '@/configs/constants'

type Props = {
  mode: Mode
}

const StyledBoxForShadow = styled('div')(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(var(--mui-palette-background-paper) ${
    theme.direction === 'rtl' ? '95%' : '5%'
  }, rgb(var(--mui-palette-background-paperChannel) / 0.85) 30%, rgb(var(--mui-palette-background-paperChannel) / 0.5) 65%, rgb(var(--mui-palette-background-paperChannel) / 0.3) 75%, transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = (props: Props) => {
  // Props
  const { mode } = props

  // Hooks
  const verticalNavOptions = useVerticalNav()
  const { updateSettings, settings } = useSettings()
  const { mode: muiMode, systemMode: muiSystemMode } = useColorScheme()
  const theme = useTheme()
  const { ready, can } = usePermissions()

  // Rôle commercial : droit pros mais pas dashboard → aucune sidebar (il ne voit que son activité).
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  // Refs
  const shadowRef = useRef(null)

  // Vars
  const { isCollapsed, isHovered, collapseVerticalNav, isBreakpointReached } = verticalNavOptions
  const isSemiDark = settings.semiDark

  const currentMode = muiMode === 'system' ? muiSystemMode : muiMode || mode

  const isDark = currentMode === 'dark'

  const scrollMenu = (container: any, isPerfectScrollbar: boolean) => {
    container = isBreakpointReached || !isPerfectScrollbar ? container.target : container

    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('scrolled')) {
        // @ts-ignore
        shadowRef.current.classList.add('scrolled')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('scrolled')
    }
  }

  useEffect(() => {
    if (settings.layout === 'collapsed') {
      collapseVerticalNav(true)
    } else {
      collapseVerticalNav(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout])

  // Pas de sidebar pour le commercial
  if (isCommercial) return null

  return (
    // eslint-disable-next-line lines-around-comment
    // Sidebar Vertical Menu
    <VerticalNav
      customStyles={navigationCustomStyles(verticalNavOptions, theme)}
      width={230}
      collapsedWidth={71}
      backgroundColor='var(--mui-palette-background-paper)'
      // eslint-disable-next-line lines-around-comment
      // The following condition adds the data-dark attribute to the VerticalNav component
      // when semiDark is enabled and the mode or systemMode is light
      {...(isSemiDark &&
        !isDark && {
          'data-dark': ''
        })}
    >
      {/* Nav Header including Logo & nav toggle icons  */}
      <NavHeader>
        <Link href='/'>
          <Logo />
        </Link>
        {!(isCollapsed && !isHovered) && (
          <NavCollapseIcons
            lockedIcon={<PanelLeftClose size={20} />}
            unlockedIcon={<PanelLeft size={20} />}
            closeIcon={<PanelLeftClose size={20} />}
            onClick={() => updateSettings({ layout: !isCollapsed ? 'collapsed' : 'vertical' })}
          />
        )}
      </NavHeader>
      <StyledBoxForShadow ref={shadowRef} />
      <VerticalMenu scrollMenu={scrollMenu} />
      {!(isCollapsed && !isHovered) && (
        <div
          style={{
            marginTop: 'auto',
            padding: '12px 16px 16px',
            borderTop: '1px solid var(--mui-palette-divider)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          <Link
            href='/faq'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 0,
              textDecoration: 'none',
              backgroundColor: 'var(--mui-palette-action-hover)',
              color: 'var(--mui-palette-text-primary)'
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                flexShrink: 0,
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mui-palette-primary-main)',
                backgroundColor: 'var(--mui-palette-primary-lightOpacity)'
              }}
            >
              <i className='tabler-help-circle' style={{ fontSize: '1.15rem' }} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontSize: 13, fontWeight: 800 }}>Aide &amp; FAQ</span>
              <span style={{ fontSize: 11.5, color: 'var(--mui-palette-text-secondary)' }}>Guide des pages</span>
            </span>
          </Link>
          <p style={{ fontSize: 11.5, color: 'var(--mui-palette-text-secondary)', margin: 0, textAlign: 'center' }}>
            {`© ${new Date().getFullYear()} `}
            <span style={{ color: 'var(--mui-palette-primary-main)', fontWeight: 700 }}>
              {APP_CONFIG.name || 'Coddyger'}
            </span>
            {` v${APP_CONFIG.version}`}
          </p>
        </div>
      )}
    </VerticalNav>
  )
}

export default Navigation
