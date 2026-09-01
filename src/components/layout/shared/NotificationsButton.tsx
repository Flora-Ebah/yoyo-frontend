'use client'

// React Imports
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

// Component Imports
import { useRouter } from 'next/navigation'

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

import NotificationDropdown from './NotificationsDropdown'

// Hook Imports
import { useSession } from '@/hooks/useSession'
import { usePermissions } from '@/hooks/usePermissions'

// Mock Imports
import { COMMERCIAL_NOTIFICATIONS_MOCK } from '@/data/commercial-notifications.mock'

// Context Imports
import { SocketContext } from '@/contexts/SocketContext'

// Type Imports
import type { NotificationsType } from './NotificationsDropdown'

// Service Imports
import type { INotification } from '@/services/notification.service'
import { notificationService } from '@/services/notification.service'

/**
 * Composant de bouton de notifications avec gestion des événements socket
 * Affiche le bouton uniquement si l'utilisateur est authentifié
 */
const NotificationsButton = () => {
  const { isAuthenticated } = useSession()
  const { ready, can } = usePermissions()
  const router = useRouter()

  // Commercial : droit pros mais pas dashboard.
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')
  const socketContext = useContext(SocketContext)
  const isConnected = socketContext?.isConnected ?? false
  const on = socketContext?.on
  const off = socketContext?.off
  const [notifications, setNotifications] = useState<NotificationsType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<NotificationsType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getProductId = useCallback((notification: NotificationsType) => {
    const metadata = notification.metadata as any

    return (
      notification.productId ||
      metadata?.productId ||
      metadata?.product_id ||
      metadata?.product?._id ||
      metadata?.product?.id ||
      null
    )
  }, [])

  const isProductNotification = useCallback(
    (notification: NotificationsType) => {
      const typeValue = notification.type?.toUpperCase() || ''
      const categoryValue = notification.category?.toUpperCase() || ''
      const metadata = notification.metadata as any

      if (typeValue === 'PRODUCT' || categoryValue === 'PRODUCT') {
        return true
      }

      if (metadata?.type === 'product' || metadata?.entity === 'product') {
        return true
      }

      return !!getProductId(notification)
    },
    [getProductId]
  )

  const handleNotificationOpen = useCallback(
    (notification: NotificationsType) => {
      if (isProductNotification(notification)) {
        const productId = getProductId(notification)

        if (productId) {
          router.push(`/products/${productId}`)

          return
        }
      }

      setSelectedNotification(notification)
      setDialogOpen(true)
    },
    [getProductId, isProductNotification, router]
  )

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false)
    setSelectedNotification(null)
  }, [])

  const playNotificationSound = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!notificationAudioRef.current) {
      notificationAudioRef.current = new Audio('/sounds/notification-effect.mp3')
    }

    const audio = notificationAudioRef.current

    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  // Charger les notifications initiales
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)

      return
    }

    const loadNotifications = async () => {
      try {
        const data = await notificationService.getMyNotifications({ pageSize: 10 })

        // Mapper les notifications backend vers le format frontend
        const formattedNotifications = (Array.isArray(data) ? data : []).map(n =>
          notificationService.toFrontendFormat(n as unknown as INotification)
        )

        setNotifications(formattedNotifications)
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [isAuthenticated])

  // Écouter les événements socket pour les nouvelles notifications
  useEffect(() => {
    if (!isAuthenticated || !isConnected || !on) {
      return
    }

    // Handler pour les notifications génériques
    const handleNotification = (data: {
      title: string
      body: string
      category: string
      timestamp: string
      [key: string]: any
    }) => {
      const newNotification: NotificationsType = {
        title: data.title || 'Nouvelle notification',
        subtitle: data.body || '',
        time: new Date(data.timestamp || Date.now()).toLocaleString('fr-FR', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        read: false,
        avatarIcon: getNotificationIcon(data.category),
        avatarColor: getNotificationColor(data.category) as any,
        category: data.category,
        metadata: data.metadata,
        productId: data.productId
      }

      setNotifications(prev => [newNotification, ...prev])
      playNotificationSound()
      handleNotificationOpen(newNotification)
    }

    // S'abonner aux événements
    on('notification:new', handleNotification)

    return () => {
      // Nettoyer les listeners
      if (off) {
        off('notification:new', handleNotification)
      }
    }
  }, [isAuthenticated, isConnected, on, off, playNotificationSound, handleNotificationOpen])

  // Ne pas afficher si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return null
  }

  // Commercial : on complète avec les notifications fictives (en attendant les
  // vraies notifications backend — cf. CONTRAT-API-ONBOARDING-MARCHAND.md).
  const displayedNotifications = isCommercial
    ? [...COMMERCIAL_NOTIFICATIONS_MOCK.filter(m => !notifications.some(n => n._id === m._id)), ...notifications]
    : notifications

  return (
    <>
      <NotificationDropdown
        notifications={displayedNotifications}
        onRead={async id => {
          try {
            await notificationService.markAsRead(id)
          } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error)
          }
        }}
        onRemove={async id => {
          try {
            await notificationService.delete(id)
          } catch (error) {
            console.error('Erreur lors de la suppression:', error)
          }
        }}
        onReadAll={async () => {
          try {
            await notificationService.markAllAsRead()
          } catch (error) {
            console.error('Erreur lors du marquage de tout comme lu:', error)
          }
        }}
        onItemClick={handleNotificationOpen}
      />
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth='sm' fullWidth>
        <DialogTitle>{selectedNotification?.title || 'Notification'}</DialogTitle>
        <DialogContent>
          <Box className='flex flex-col gap-3'>
            {selectedNotification?.subtitle && (
              <Typography variant='body1' color='text.primary'>
                {selectedNotification.subtitle}
              </Typography>
            )}
            {selectedNotification?.time && (
              <Typography variant='caption' color='text.secondary'>
                {selectedNotification.time}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} variant='contained'>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

/**
 * Obtenir l'icône appropriée selon la catégorie de notification
 */
const getNotificationIcon = (category: string): string => {
  const categoryUpper = category?.toUpperCase() || 'INFO'

  switch (categoryUpper) {
    case 'SUCCESS':
      return 'tabler-check'
    case 'ERROR':
    case 'DANGER':
      return 'tabler-alert-circle'
    case 'WARNING':
      return 'tabler-alert-triangle'
    default:
      return 'tabler-bell'
  }
}

/**
 * Obtenir la couleur appropriée selon la catégorie de notification
 */
const getNotificationColor = (category: string): string => {
  const categoryUpper = category?.toUpperCase() || 'INFO'

  switch (categoryUpper) {
    case 'SUCCESS':
      return 'success'
    case 'ERROR':
    case 'DANGER':
      return 'error'
    case 'WARNING':
      return 'warning'
    case 'INVITATION':
      return 'info'
    case 'MATCH':
      return 'primary'
    case 'TOURNAMENT':
      return 'secondary'
    default:
      return 'primary'
  }
}

export default NotificationsButton
