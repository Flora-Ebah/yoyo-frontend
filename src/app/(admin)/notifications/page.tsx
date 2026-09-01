'use client'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { AddIcon, StatCard, StatCardGrid, SectionCard } from '@/components/ui'
import NotificationFormDialog from './components/NotificationFormDialog'
import NotificationList from './components/NotificationList'
import { useNotificationActions } from './hooks/useNotificationActions'
import { useNotificationForm } from './hooks/useNotificationForm'
import { useNotifications } from './hooks/useNotifications'
import { useSession } from '@/hooks/useSession'

export default function NotificationsPage() {
  const theme = useTheme()

  const { notifications, loading, refresh, setNotifications, pagination, handlePageChange, handleRowsPerPageChange } =
    useNotifications()

  const { session } = useSession()
  const currentUserId =
    typeof session?.user?._id === 'string'
      ? session.user._id
      : typeof session?.user?.id === 'string'
        ? session.user.id
        : undefined

  const { handleMarkAsRead, handleDelete, handleMarkAllAsRead, handleDeleteRead } = useNotificationActions(
    setNotifications,
    currentUserId
  )

  const { open, submitting, formData, setFormData, users, setUserSearch, handleOpen, handleClose, handleSubmit } =
    useNotificationForm(refresh)

  const unreadCount = notifications.filter(notification => !notification.isRead).length
  const readCount = notifications.length - unreadCount

  const baseBtn = {
    height: 38,
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: 13,
    textTransform: 'none' as const,
    px: 1.75,
    '& .MuiButton-startIcon': { marginRight: '6px' },
    '& .MuiButton-startIcon i': { fontSize: '1.05rem' }
  }

  const softBtn = {
    ...baseBtn,
    color: 'primary.main',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) }
  }

  const stats = [
    { label: 'Total', value: notifications.length, caption: 'Notifications', icon: 'tabler-bell', palette: 'primary' as const },
    { label: 'Non lues', value: unreadCount, caption: 'À consulter', icon: 'tabler-mail', palette: 'warning' as const },
    { label: 'Lues', value: readCount, caption: 'Traitées', icon: 'tabler-mail-opened', palette: 'success' as const }
  ]

  return (
    <PageContainer
      title='Notifications YoYo'
      subtitle='Gérez et diffusez des messages à vos utilisateurs en temps réel'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            disableElevation
            onClick={handleOpen}
            sx={baseBtn}
          >
            Nouveau message
          </Button>
          <Button onClick={handleMarkAllAsRead} disableElevation sx={softBtn}>
            Tout marquer lu
          </Button>
          <Button
            onClick={handleDeleteRead}
            disableElevation
            sx={{ ...baseBtn, color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.1), '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.18) } }}
          >
            Nettoyer les lues
          </Button>
        </Box>
      }
    >
      {/* Cartes stats */}
      <StatCardGrid columns={3}>
        {stats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} caption={s.caption} icon={s.icon} palette={s.palette} />
        ))}
      </StatCardGrid>

      {/* Liste */}
      <SectionCard>
        <NotificationList
          loading={loading}
          notifications={notifications}
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          currentUserId={currentUserId}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </SectionCard>

      <NotificationFormDialog
        open={open}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        submitting={submitting}
        formData={formData}
        setFormData={setFormData}
        users={users}
        setUserSearch={setUserSearch}
      />
    </PageContainer>
  )
}
