import Box from '@mui/material/Box'
import { StatusPill } from '@/components/ui'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import type { INotification } from '@/services/notification.service'

interface NotificationListProps {
  loading: boolean
  notifications: INotification[]
  page: number
  limit: number
  total: number
  currentUserId?: string | null
  onMarkAsRead: (notification: INotification) => void
  onDelete: (id: string) => void
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rowsPerPage: number) => void
}

type Palette = 'primary' | 'success' | 'error' | 'warning' | 'info'

const typeMeta = (type: string): { label: string; palette: Palette; icon: string } => {
  switch ((type || 'info').toUpperCase()) {
    case 'SUCCESS':
      return { label: 'Succès', palette: 'success', icon: 'tabler-check' }
    case 'ERROR':
    case 'DANGER':
      return { label: 'Erreur', palette: 'error', icon: 'tabler-alert-circle' }
    case 'WARNING':
      return { label: 'Alerte', palette: 'warning', icon: 'tabler-alert-triangle' }
    case 'SYSTEM':
      return { label: 'Système', palette: 'info', icon: 'tabler-settings' }
    default:
      return { label: 'Info', palette: 'primary', icon: 'tabler-info-circle' }
  }
}

const NotificationList = ({
  loading,
  notifications,
  page,
  limit,
  total,
  currentUserId,
  onMarkAsRead,
  onDelete,
  onPageChange,
  onRowsPerPageChange
}: NotificationListProps) => {
  const theme = useTheme()

  const Pill = StatusPill

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <TableContainer sx={{ overflowX: 'auto' }}>
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
              <TableCell>Type</TableCell>
              <TableCell>Titre &amp; message</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <i className='tabler-bell-off text-4xl' />
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucune notification</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              notifications.map(notification => {
                const meta = typeMeta(notification.type)
                const color = theme.palette[meta.palette].main

                return (
                  <TableRow key={notification._id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 32, height: 32, flexShrink: 0, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color, backgroundColor: alpha(color, 0.14) }}>
                          <i className={`${meta.icon} text-base`} />
                        </Box>
                        <Pill label={meta.label} palette={meta.palette} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 420 }}>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.title}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Pill label={notification.isRead ? 'Lue' : 'Non lue'} palette={notification.isRead ? 'success' : 'primary'} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {new Date(notification.createdAt).toLocaleDateString('fr-FR')} ·{' '}
                      {new Date(notification.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell align='right' sx={{ whiteSpace: 'nowrap' }}>
                      {!notification.isRead && notification.userId === currentUserId && (
                        <Tooltip title='Marquer comme lu'>
                          <IconButton size='small' color='primary' onClick={() => onMarkAsRead(notification)}>
                            <i className='tabler-mail-opened' />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title='Supprimer'>
                        <IconButton size='small' color='error' onClick={() => onDelete(notification._id)}>
                          <i className='tabler-trash' />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        count={total}
        page={page - 1}
        onPageChange={(_event, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={limit}
        onRowsPerPageChange={event => onRowsPerPageChange(parseInt(event.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage='Lignes par page:'
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
      />
    </>
  )
}

export default NotificationList
