import { useEffect, useState } from 'react'

import { useSocket } from '@/contexts/SocketContext'
import { notificationService, type INotification } from '@/services/notification.service'

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const { on, off } = useSocket()

  const fetchNotifications = async () => {
    setLoading(true)

    try {
      const response: any = await notificationService.getAllNotifications({
        page: pagination.page,
        pageSize: pagination.limit
      })

      if (Array.isArray(response)) {
        setNotifications(response)
        setPagination(prev => ({
          ...prev,
          total: response.length,
          totalPages: response.length > 0 ? 1 : 0
        }))
      } else if (response && Array.isArray(response.data)) {
        setNotifications(response.data)

        if (response.pagination) {
          setPagination(response.pagination)
        } else {
          setPagination(prev => ({
            ...prev,
            total: response.data.length,
            totalPages: response.data.length > 0 ? 1 : 0
          }))
        }
      } else {
        setNotifications([])
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }))
      }
    } catch (error) {
      console.error('Failed to load notifications', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [refreshTrigger, pagination.page, pagination.limit])

  useEffect(() => {
    const handleNewNotification = () => {
      setRefreshTrigger(prev => prev + 1)
    }

    on('notification:new', handleNewNotification)

    return () => {
      off('notification:new', handleNewNotification)
    }
  }, [on, off])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleRowsPerPageChange = (newLimit: number) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }))
  }

  return {
    notifications,
    loading,
    refresh: () => setRefreshTrigger(prev => prev + 1),
    setNotifications,
    pagination,
    handlePageChange,
    handleRowsPerPageChange
  }
}
