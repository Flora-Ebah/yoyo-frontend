// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Lucide Icons (pour Transactions / Notifications / chevrons)
import { Receipt, ChevronRight, Dot } from 'lucide-react'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { usePermissions } from '@/hooks/usePermissions'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const ICON_SIZE = 19

// Base commune des SVG (style lucide : contour, currentColor)
const svgBase = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
})

// --- Icônes SVG fournies ---
const IcoDashboard = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <rect width='7' height='9' x='3' y='3' rx='1' />
    <rect width='7' height='5' x='14' y='3' rx='1' />
    <rect width='7' height='9' x='14' y='12' rx='1' />
    <rect width='7' height='5' x='3' y='16' rx='1' />
  </svg>
)

// Clients : users-round modifié → 3 têtes
const IcoClients = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <circle cx='12' cy='7' r='3' />
    <circle cx='5' cy='8.5' r='2.3' />
    <circle cx='19' cy='8.5' r='2.3' />
    <path d='M7.2 21a5 5 0 0 1 9.6 0' />
    <path d='M1.5 21a3.6 3.6 0 0 1 4.3-3.42' />
    <path d='M22.5 21a3.6 3.6 0 0 0-4.3-3.42' />
  </svg>
)

const IcoStore = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <path d='M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5' />
    <path d='M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244' />
    <path d='M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05' />
  </svg>
)

// Modération : shield-check (design révisé)
const IcoModeration = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' />
    <path d='m9 12 2 2 4-4' />
  </svg>
)

const IcoAdminCog = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <path d='m14.305 19.53.923-.382' />
    <path d='m15.228 16.852-.923-.383' />
    <path d='m16.852 15.228-.383-.923' />
    <path d='m16.852 20.772-.383.924' />
    <path d='m19.148 15.228.383-.923' />
    <path d='m19.53 21.696-.382-.924' />
    <path d='M2 21a8 8 0 0 1 10.434-7.62' />
    <path d='m20.772 16.852.924-.383' />
    <path d='m20.772 19.148.924.383' />
    <circle cx='10' cy='8' r='5' />
    <circle cx='18' cy='18' r='3' />
  </svg>
)

// Activité commerciale : graphique en ligne montant (performance des ventes / enrôlements),
// plus parlant qu'un « ajout d'utilisateur » pour cette section (classement + KPIs commerciaux).
const IcoCommercial = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <path d='M3 3v16a2 2 0 0 0 2 2h16' />
    <path d='m19 9-5 5-4-4-3 3' />
  </svg>
)

const IcoMegaphone = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
    <path d='M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' />
    <path d='M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14' />
    <path d='M8 6v8' />
  </svg>
)

const IcoMonitorCog = ({ size }: { size: number }) => (
  <svg {...svgBase(size)}>
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

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <ChevronRight size={18} />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { can } = usePermissions()

  const adminVisible = can('read', 'admins')
  const notifVisible = can('read', 'notifications')
  const settingsVisible = can('read', 'settings')
  const enrolVisible = can('read', 'enrolments')
  const showAdminSection = adminVisible || notifVisible || settingsVisible || enrolVisible

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <Dot size={16} /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {can('read', 'dashboard') && (
          <MenuItem href='/dashboard' icon={<IcoDashboard size={ICON_SIZE} />}>
            Tableau de bord
          </MenuItem>
        )}
        {can('read', 'clients') && (
          <MenuItem href='/clients' icon={<IcoClients size={ICON_SIZE} />}>
            Clients
          </MenuItem>
        )}
        {can('read', 'pros') && (
          <MenuItem href='/pros' exactMatch={false} activeUrl='/pros' icon={<IcoStore size={ICON_SIZE} />}>
            Professionnels
          </MenuItem>
        )}
        {can('read', 'transactions') && (
          <MenuItem href='/transactions' icon={<Receipt size={ICON_SIZE} />}>
            Transactions
          </MenuItem>
        )}
        {can('read', 'moderation') && (
          <MenuItem href='/moderation' icon={<IcoModeration size={ICON_SIZE} />}>
            Modération
          </MenuItem>
        )}

        {showAdminSection && (
          <MenuSection label='Administration'>
            {adminVisible && (
              <MenuItem href='/admins' icon={<IcoAdminCog size={ICON_SIZE} />}>
                Comptes admin
              </MenuItem>
            )}
            {enrolVisible && (
              <MenuItem href='/enrolments' icon={<IcoCommercial size={ICON_SIZE} />}>
                Activité commerciale
              </MenuItem>
            )}
            {notifVisible && (
              <MenuItem href='/notifications' icon={<IcoMegaphone size={ICON_SIZE} />}>
                Notifications
              </MenuItem>
            )}
            {settingsVisible && (
              <MenuItem href='/account-settings' icon={<IcoMonitorCog size={ICON_SIZE} />}>
                Paramètres
              </MenuItem>
            )}
          </MenuSection>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
