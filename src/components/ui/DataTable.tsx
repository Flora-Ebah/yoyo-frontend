'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

export type Column<T> = {
  /** clé unique de colonne */
  key: string
  header: ReactNode
  align?: 'left' | 'center' | 'right'
  /** rendu d'une cellule */
  render: (row: T, index: number) => ReactNode
}

export type DataTablePagination = {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
  rowsPerPageOptions?: number[]
}

export type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T, index: number) => string
  onRowClick?: (row: T) => void
  /** état vide */
  empty?: { icon?: string; label?: string }
  /** hauteur max (scroll interne) */
  maxHeight?: number | string
  /** occupe toute la hauteur du parent (flex column : table scrollable + pied fixe) */
  fillHeight?: boolean
  /** pied de page de pagination */
  pagination?: DataTablePagination
}

/**
 * Tableau de données standard : bord carré, traits de colonnes, en-tête sticky,
 * état vide intégré, pagination optionnelle. Basé sur une config `columns`.
 */
export function DataTable<T>({ columns, rows, getRowKey, onRowClick, empty, maxHeight, fillHeight, pagination }: DataTableProps<T>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', pt: 1, ...(fillHeight ? { height: '100%', minHeight: 0 } : {}) }}>
      <TableContainer sx={{ overflowX: 'auto', ...(fillHeight ? { flex: 1, minHeight: 0, overflowY: 'auto' } : maxHeight ? { maxHeight, overflowY: 'auto' } : {}) }}>
        <Table
          stickyHeader
          size='small'
          sx={{
            minWidth: 0,
            '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider', paddingInline: '12px' },
            '& td:last-of-type, & th:last-of-type': { borderRight: 'none' },
            '& thead th': { backgroundColor: 'background.paper' }
          }}
        >
          <TableHead>
            <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
              {columns.map(c => (
                <TableCell key={c.key} align={c.align}>{c.header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    {empty?.icon && <i className={`${empty.icon} text-4xl`} />}
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{empty?.label || 'Aucune donnée'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={getRowKey(row, index)}
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ ...(onRowClick ? { cursor: 'pointer' } : {}), '& td': { borderColor: 'divider' } }}
                >
                  {columns.map(c => (
                    <TableCell key={c.key} align={c.align}>{c.render(row, index)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <TablePagination
          component='div'
          count={pagination.count}
          page={pagination.page}
          onPageChange={(_e, p) => pagination.onPageChange(p)}
          rowsPerPage={pagination.rowsPerPage}
          onRowsPerPageChange={e => pagination.onRowsPerPageChange(Number(e.target.value))}
          rowsPerPageOptions={pagination.rowsPerPageOptions || [5, 10, 25]}
          sx={{ borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        />
      )}
    </Box>
  )
}

export default DataTable
