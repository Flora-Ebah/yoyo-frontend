'use client'

// Third-party Imports
import classnames from 'classnames'

// Lucide Icons
import { Search } from 'lucide-react'

// MUI Imports
import Box from '@mui/material/Box'
import { useColorScheme, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// Component Imports
import NotificationsButton from '@components/layout/shared/NotificationsButton'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { usePermissions } from '@/hooks/usePermissions'

import NavToggle from './NavToggle'

const svgBase = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const IconSun = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgBase}>
    <circle cx='12' cy='12' r='4' />
    <path d='M12 2v2' />
    <path d='M12 20v2' />
    <path d='m4.93 4.93 1.41 1.41' />
    <path d='m17.66 17.66 1.41 1.41' />
    <path d='M2 12h2' />
    <path d='M20 12h2' />
    <path d='m6.34 17.66-1.41 1.41' />
    <path d='m19.07 4.93-1.41 1.41' />
  </svg>
)
const IconMoon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgBase}>
    <path d='M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401' />
  </svg>
)
const IconSystem = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} {...svgBase}>
    <path d='M12 17v4' />
    <path d='m14.305 7.53.923-.382' />
    <path d='m15.228 4.852-.923-.383' />
    <path d='m16.852 3.228-.383-.924' />
    <path d='m16.852 8.772-.383.923' />
    <path d='m19.148 3.228.383-.924' />
    <path d='m19.53 9.696-.382-.924' />
    <path d='m20.772 4.852.924-.383' />
    <path d='m20.772 7.148.924.383' />
    <path d='M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7' />
    <path d='M8 21h8' />
    <circle cx='18' cy='6' r='3' />
  </svg>
)

const MODES = [
  { key: 'light', Icon: IconSun, label: 'Clair' },
  { key: 'dark', Icon: IconMoon, label: 'Sombre' },
  { key: 'system', Icon: IconSystem, label: 'Système' }
] as const

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  height: 40,
  borderRadius: 0,
  border: 'none',
  background: 'var(--mui-palette-background-paper)',
  padding: '0 14px 0 38px',
  fontSize: 14,
  color: 'var(--mui-palette-text-primary)',
  outline: 'none'
}

const NavbarContent = () => {
  const { mode, setMode } = useColorScheme()
  const theme = useTheme()
  const { ready, can } = usePermissions()

  // Rôle commercial : droit pros mais pas dashboard → pas de recherche, le sélecteur
  // de thème prend la place de la recherche (à gauche).
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  // Recherche : desktop (lg+) seulement, et jamais pour le commercial.
  const showSearch = useMediaQuery(theme.breakpoints.up('lg')) && !isCommercial

  const modeSelector = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: 40,
        padding: '0 4px',
        borderRadius: 0,
        border: 'none',
        background: 'var(--mui-palette-background-paper)'
      }}
    >
      {MODES.map(({ key, Icon, label }) => {
        const active = mode === key

        return (
          <button
            key={key}
            type='button'
            aria-label={label}
            onClick={() => setMode(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: 0,
              border: 'none',
              cursor: 'pointer',
              transition: 'all .15s',
              background: active ? 'var(--mui-palette-primary-lightOpacity)' : 'transparent',
              color: active ? 'var(--mui-palette-primary-main)' : 'var(--mui-palette-text-primary)'
            }}
          >
            <Icon size={16} />
          </button>
        )
      })}
    </div>
  )

  return (
    <Box
      className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
      sx={isCommercial ? { px: { xs: 0, lg: 16, xl: 24 }, maxWidth: { lg: 1040, xl: 1200 }, mx: { lg: 'auto' } } : undefined}
    >
      {/* Gauche : toggle + (recherche desktop) OU (sélecteur thème pour le commercial) */}
      <div className='flex items-center gap-3' style={{ flex: 1 }}>
        <NavToggle />
        {isCommercial ? (
          modeSelector
        ) : (
          showSearch && (
            <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--mui-palette-text-primary)' }}
              />
              <input placeholder='Recherche rapide' style={searchInputStyle} />
            </div>
          )
        )}
      </div>

      {/* Droite */}
      <div className='flex items-center' style={{ gap: 8 }}>
        {!isCommercial && modeSelector}
        <NotificationsButton />
        <UserDropdown />
      </div>
    </Box>
  )
}

export default NavbarContent
