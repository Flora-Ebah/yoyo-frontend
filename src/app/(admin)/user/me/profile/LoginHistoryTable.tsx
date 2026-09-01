'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

// Third-party Imports
import type { ColumnDef } from '@tanstack/react-table'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import classnames from 'classnames'

// Type Imports
import tableStyles from '@core/styles/table.module.css'

import type { LoginHistoryEntry } from '@/services/user.service'

// Component Imports
// Style Imports

// Service Imports
import { userService } from '@/services/user.service'

const columnHelper = createColumnHelper<LoginHistoryEntry>()

const LoginHistoryTable = () => {
  // States
  const [data, setData] = useState<LoginHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  })

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)

      try {
        const response = await userService.getLoginHistory({
          page: pagination.pageIndex + 1,
          limit: pagination.pageSize
        })

        setData(response.data || [])
        setTotal(response.pagination?.total || 0)
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [pagination.pageIndex, pagination.pageSize])

  const columns = useMemo<ColumnDef<LoginHistoryEntry, any>[]>(
    () => [
      columnHelper.accessor('status', {
        header: 'État',
        cell: ({ row }) => {
          const status = row.original.status
          let color: 'success' | 'error' | 'warning' | 'default' = 'default'
          let label: string = status

          switch (status) {
            case 'success':
              color = 'success'
              label = 'Réussi'
              break
            case 'failed':
              color = 'error'
              label = 'Échoué'
              break
            case 'revoked':
              color = 'warning'
              label = 'Révoqué'
              break
          }

          return <Chip label={label} color={color} size='small' variant='tonal' />
        }
      }),
      columnHelper.accessor('ip', {
        header: 'Adresse IP',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.ip}</Typography>
      }),
      columnHelper.accessor('userAgent', {
        header: 'Navigateur / OS',
        cell: ({ row }) => {
          // Simple parser pour afficher quelque chose de plus lisible
          const ua = row.original.userAgent
          let display = ua

          if (ua.includes('Mozilla')) {
            if (ua.includes('Windows')) display = 'Windows'
            else if (ua.includes('Mac')) display = 'MacOS'
            else if (ua.includes('Linux')) display = 'Linux'

            if (ua.includes('Firefox')) display += ' / Firefox'
            else if (ua.includes('Chrome')) display += ' / Chrome'
            else if (ua.includes('Safari')) display += ' / Safari'
          } else if (ua === 'node') {
            display = 'Serveur / Node.js'
          }

          return (
            <div className='flex flex-col'>
              <Typography color='text.primary'>{display}</Typography>
              <Typography variant='caption' className='truncate max-w-[200px]' title={ua}>
                {ua}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('createdAt', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography color='text.primary'>{new Date(row.original.createdAt).toLocaleString('fr-FR')}</Typography>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    filterFns: {} as any,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: Math.ceil(total / pagination.pageSize)
  })

  return (
    <Card>
      <CardHeader title='Historique des connexions' />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className='tabler-chevron-up text-xl' />,
                          desc: <i className='tabler-chevron-down text-xl' />
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-5'>
                  Chargement...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center p-5'>
                  Aucun historique disponible
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        count={total}
        rowsPerPage={pagination.pageSize}
        page={pagination.pageIndex}
        onPageChange={(_, page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
        onRowsPerPageChange={e => setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), pageIndex: 0 }))}
      />
    </Card>
  )
}

export default LoginHistoryTable

