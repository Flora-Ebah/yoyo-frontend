'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

const CONTROL_H = 36
const RADIUS = '6px'

// Style « souligné » : pas de bordure sauf la bordure du bas (input + select).
const softField = {
  height: CONTROL_H,
  borderRadius: 0,
  border: 'none',
  borderBottom: '2px solid',
  borderBottomColor: 'divider',
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'inherit',
  color: 'var(--mui-palette-text-primary)',
  transition: 'border-color .15s, background-color .15s',
  '&:hover': { borderBottomColor: 'var(--mui-palette-action-active)' },
  '&:focus': { borderBottomColor: 'var(--mui-palette-primary-main)' }
} as const

// Chevron gris intégré au select (remplace la flèche native, incohérente selon les navigateurs).
const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")"

/** Conteneur flex de filtres (wrap, gap homogène). */
export const FilterBar = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>{children}</Box>
)

/** Champ de recherche soft avec icône loupe. */
export const SearchInput = ({ value, onChange, placeholder = 'Rechercher', minWidth = 220 }: { value: string; onChange: (v: string) => void; placeholder?: string; minWidth?: number }) => (
  <Box sx={{ position: 'relative', flex: 1, minWidth, '& input': { ...softField, width: '100%', padding: '0 14px 0 36px', '&::placeholder': { color: 'var(--mui-palette-text-disabled)' } } }}>
    <i className='tabler-search' style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 17, color: 'var(--mui-palette-text-secondary)', pointerEvents: 'none' }} />
    <input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
  </Box>
)

/** Select soft (liste d'options {value,label}) avec chevron custom. */
export const SelectFilter = ({ value, onChange, options, minWidth = 160 }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; minWidth?: number }) => (
  <Box
    component='select'
    value={value}
    onChange={(e: any) => onChange(e.target.value)}
    sx={{
      ...softField,
      minWidth,
      width: { xs: '100%', sm: 'auto' },
      pl: 1.5,
      pr: 4,
      cursor: 'pointer',
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: CHEVRON,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center'
    }}
  >
    {options.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
  </Box>
)

/** Plage de dates (Du / au) native, compacte, style souligné (bordure basse seule). */
export const DateRangeFilter = ({ from, to, onFrom, onTo }: { from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: CONTROL_H, px: 1.5, borderRadius: 0, border: 'none', borderBottom: '2px solid', borderBottomColor: 'divider', backgroundColor: 'transparent', transition: 'border-color .15s', '&:hover': { borderBottomColor: 'var(--mui-palette-action-active)' }, width: { xs: '100%', sm: 'auto' }, order: { xs: 3, sm: 0 }, '& input': { flex: { xs: 1, sm: 'initial' }, border: 'none', outline: 'none', background: 'transparent', color: 'var(--mui-palette-text-primary)', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', colorScheme: theme.palette.mode } }}>
      <Box component='span' sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>Du</Box>
      <input type='date' value={from} max={to || undefined} onChange={e => onFrom(e.target.value)} />
      <Box component='span' sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>au</Box>
      <input type='date' value={to} min={from || undefined} onChange={e => onTo(e.target.value)} />
    </Box>
  )
}

/** Bouton de réinitialisation des filtres. */
export const ResetButton = ({ onClick, label = 'Réinitialiser' }: { onClick: () => void; label?: string }) => (
  <Box role='button' onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, height: CONTROL_H, px: 2, borderRadius: RADIUS, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'text.secondary', backgroundColor: 'action.hover', transition: 'background-color .15s', '&:hover': { backgroundColor: 'action.selected' } }}>
    <i className='tabler-rotate-2' /> {label}
  </Box>
)

export default FilterBar
