import { notificationService, type INotification } from '@/services/notification.service'

export const useNotificationActions = (
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>,
  currentUserId?: string | null
) => {
  const handleMarkAsRead = async (notification: INotification) => {
    if (!currentUserId || notification.userId !== currentUserId) {
      return
    }

    try {
      await notificationService.markAsRead(notification._id)
      setNotifications(prev => prev.map(n => (n._id === notification._id ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error('Error marking as read', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.delete(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (error) {
      console.error('Error deleting notification', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!currentUserId) {
      return
    }

    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => (n.userId === currentUserId ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error('Error marking all as read', error)
    }
  }

  const handleDeleteRead = async () => {
    try {
      await notificationService.deleteRead()
      setNotifications(prev => prev.filter(n => !n.isRead))
    } catch (error) {
      console.error('Error deleting read notifications', error)
    }
  }

  return {
    handleMarkAsRead,
    handleDelete,
    handleMarkAllAsRead,
    handleDeleteRead
  }
}
