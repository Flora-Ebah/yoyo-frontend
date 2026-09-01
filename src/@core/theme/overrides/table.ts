// MUI Imports
import type { Theme } from '@mui/material/styles'

/**
 * Harmonisation légère des tableaux (toutes les tables, y compris les CRUD non migrés
 * vers `components/ui/DataTable`). Ne fait que poser des DÉFAUTS : tout `sx` inline
 * d'une page l'emporte, donc aucune régression sur les tables déjà stylées.
 *
 * Objectif : en-tête cohérent (fond papier, libellés secondaires, semi-gras) et
 * bordures alignées sur le divider du thème.
 */
const table: Theme['components'] = {
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: 'var(--mui-palette-divider)'
      },
      head: {
        backgroundColor: 'var(--mui-palette-background-paper)',
        color: 'var(--mui-palette-text-secondary)',
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }
    }
  }
}

export default table
