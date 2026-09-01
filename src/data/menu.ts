// Type Imports
import type { HorizontalMenuDataType, VerticalMenuDataType } from '@/types/menuTypes'

/**
 * Menu principal aligne avec les modules YoYo (clients, pros, transactions, moderation).
 */
export const menuData: VerticalMenuDataType[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: 'tabler-dashboard'
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: 'tabler-users'
  },
  {
    label: 'Professionnels',
    href: '/pros',
    icon: 'tabler-building-store'
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: 'tabler-receipt-2'
  },
  {
    label: 'Moderation',
    href: '/moderation',
    icon: 'tabler-shield-check'
  },
  {
    label: 'Administration',
    isSection: true,
    children: [
      {
        label: 'Comptes admin',
        href: '/admins',
        icon: 'tabler-user-shield'
      },
      {
        label: 'Notifications',
        href: '/notifications',
        icon: 'tabler-bell'
      },
      {
        label: 'FAQ',
        href: '/faq',
        icon: 'tabler-help-circle'
      },
      {
        label: 'Parametres',
        href: '/account-settings',
        icon: 'tabler-settings'
      }
    ]
  }
]

/**
 * Construit le menu horizontal a partir du menu vertical.
 */
export const getHorizontalMenuData = (): HorizontalMenuDataType[] => {
  const result: HorizontalMenuDataType[] = []

  const extractHrefItems = (items: VerticalMenuDataType[]): HorizontalMenuDataType[] => {
    const extracted: HorizontalMenuDataType[] = []

    items.forEach(item => {
      if ('href' in item) {
        extracted.push({
          label: item.label,
          href: item.href,
          icon: item.icon
        } as HorizontalMenuDataType)
      } else if ('children' in item && item.children) {
        const children = extractHrefItems(item.children)

        if (children.length > 0) {
          extracted.push({
            label: item.label,
            icon: item.icon,
            children
          } as HorizontalMenuDataType)
        }
      }
    })

    return extracted
  }

  menuData.forEach(item => {
    if ('isSection' in item && item.isSection && 'children' in item) {
      const children = extractHrefItems(item.children)
      result.push(...children)
      return
    }

    if ('children' in item && item.children) {
      const children = extractHrefItems(item.children)
      result.push({
        label: item.label,
        icon: item.icon,
        children
      } as HorizontalMenuDataType)
      return
    }

    if ('href' in item) {
      result.push({
        label: item.label,
        href: item.href,
        icon: item.icon
      } as HorizontalMenuDataType)
    }
  })

  return result
}

export const publicMenuData: HorizontalMenuDataType[] = [
  {
    label: 'Accueil',
    href: '/',
    icon: 'tabler-home'
  },
  {
    label: 'Connexion',
    href: '/login',
    icon: 'tabler-login'
  }
]
