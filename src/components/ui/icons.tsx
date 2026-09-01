import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
})

/** lucide arrow-up-right — utilisé sur les cartes (ex. hub Paramètres). */
export const ArrowUpRightIcon = ({ size = 18, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path d='M7 7h10v10' />
    <path d='M7 17 17 7' />
  </svg>
)

/** lucide pen-line — icône d'édition (boutons/menus Modifier). */
export const EditIcon = ({ size = 18, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <path d='M13 21h8' />
    <path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z' />
  </svg>
)

/** lucide circle-plus — icône d'ajout/création (boutons « Nouveau… »). */
export const AddIcon = ({ size = 18, ...props }: IconProps) => (
  <svg {...base(size)} {...props}>
    <circle cx='12' cy='12' r='10' />
    <path d='M8 12h8' />
    <path d='M12 8v8' />
  </svg>
)
