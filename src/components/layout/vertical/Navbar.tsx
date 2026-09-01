// Component Imports
import LayoutNavbar from '@layouts/components/vertical/Navbar'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

import NavbarContent from './NavbarContent'

const Navbar = () => {
  return (
    <LayoutNavbar
      overrideStyles={{
        backgroundColor: 'transparent !important',
        backgroundImage: 'none !important',
        boxShadow: 'none !important',
        backdropFilter: 'none !important',
        borderBlockEnd: 'none !important',
        '&::before': { display: 'none !important' },
        '&.scrolled': {
          backgroundColor: 'transparent !important',
          backgroundImage: 'none !important',
          boxShadow: 'none !important',
          backdropFilter: 'none !important'
        },
        [`& .${verticalLayoutClasses.navbar}`]: {
          backgroundColor: 'transparent !important',
          boxShadow: 'none !important'
        },
        // Uniquement sur mobile : le header colle au bord gauche (0 marge).
        // Sur desktop, on garde le comportement d'origine (navbar centré/inset).
        '@media (max-width: 600px)': {
          [`& .${verticalLayoutClasses.navbar}`]: {
            paddingInline: '0 !important',
            marginInline: '0 !important',
            inlineSize: '100% !important',
            maxInlineSize: 'unset !important'
          }
        }
      }}
    >
      <NavbarContent />
    </LayoutNavbar>
  )
}

export default Navbar
