'use client'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import NotificationsButton from '@components/layout/shared/NotificationsButton'
import type { ShortcutsType } from '@components/layout/shared/ShortcutsDropdown'
import ShortcutsDropdown from '@components/layout/shared/ShortcutsDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Hook Imports
import useHorizontalNav from '@menu/hooks/useHorizontalNav'

// Util Imports
import { horizontalLayoutClasses } from '@layouts/utils/layoutClasses'

import NavToggle from './NavToggle'

// Vars
// Vars - Shortcuts de démonstration (à remplacer par des données réelles depuis l'API)
const shortcuts: ShortcutsType[] = [
  {
    url: '/home',
    icon: 'tabler-home',
    title: 'Accueil',
    subtitle: 'Accueil du site'
  }
]

const NavbarContent = () => {
  // Hooks
  const { isBreakpointReached } = useHorizontalNav()

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {/* Hide Logo on Smaller screens */}
        {!isBreakpointReached && <Logo />}
      </div>
      <div className='flex items-center'>
        <ModeDropdown />
        <ShortcutsDropdown shortcuts={shortcuts} />
        <NotificationsButton />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
