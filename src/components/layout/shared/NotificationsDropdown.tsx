'use client'

// React Imports
import type { MouseEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import type { Theme } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { CustomAvatarProps } from '@core/components/mui/Avatar'
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'

export type NotificationsType = {
  _id?: string
  title: string
  subtitle: string
  time: string
  read: boolean
  type?: string
  category?: string
  metadata?: any
  productId?: string
} & (
  | {
      avatarImage?: string
      avatarIcon?: never
      avatarText?: never
      avatarColor?: never
      avatarSkin?: never
    }
  | {
      avatarIcon?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarText?: never
    }
  | {
      avatarText?: string
      avatarColor?: ThemeColor
      avatarSkin?: CustomAvatarProps['skin']
      avatarImage?: never
      avatarIcon?: never
    }
)

const ScrollWrapper = ({ children, hidden }: { children: ReactNode; hidden: boolean }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = (
  params: Pick<NotificationsType, 'avatarImage' | 'avatarIcon' | 'title' | 'avatarText' | 'avatarColor' | 'avatarSkin'>
) => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const NotificationDropdown = ({
  notifications,
  onRead,
  onRemove,
  onReadAll,
  onItemClick
}: {
  notifications: NotificationsType[]
  onRead?: (id: string) => void
  onRemove?: (id: string) => void
  onReadAll?: () => void
  onItemClick?: (notification: NotificationsType) => void
}) => {
  // States
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [notificationsState, setNotificationsState] = useState(notifications)

  // Update notifications state when props change
  useEffect(() => {
    setNotificationsState(notifications)
  }, [notifications])

  // Vars
  const notificationCount = notificationsState.filter(notification => !notification.read).length
  const readAll = notificationsState.every(notification => notification.read)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  // Hooks
  const hidden = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
  const { settings } = useSettings()

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  // Read notification when notification is clicked
  const handleReadNotification = (event: MouseEvent<HTMLElement>, value: boolean, index: number) => {
    event.stopPropagation()
    const notification = notificationsState[index]
    const newNotifications = [...notificationsState]

    newNotifications[index].read = value
    setNotificationsState(newNotifications)

    if (value && notification._id && onRead) {
      onRead(notification._id)
    }
  }

  // Remove notification when close icon is clicked
  const handleRemoveNotification = (event: MouseEvent<HTMLElement>, index: number) => {
    event.stopPropagation()
    const notification = notificationsState[index]
    const newNotifications = [...notificationsState]

    newNotifications.splice(index, 1)
    setNotificationsState(newNotifications)

    if (notification._id && onRemove) {
      onRemove(notification._id)
    }
  }

  // Read or unread all notifications when read all icon is clicked
  const readAllNotifications = () => {
    const newNotifications = [...notificationsState]

    newNotifications.forEach(notification => {
      notification.read = !readAll
    })
    setNotificationsState(newNotifications)

    if (!readAll && onReadAll) {
      onReadAll()
    }
  }

  useEffect(() => {
    const adjustPopoverHeight = () => {
      if (ref.current) {
        // Calculate available height, subtracting any fixed UI elements' height as necessary
        const availableHeight = window.innerHeight - 100

        ref.current.style.height = `${Math.min(availableHeight, 550)}px`
      }
    }

    window.addEventListener('resize', adjustPopoverHeight)
  }, [])

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleToggle}
        className='text-textPrimary'
        sx={{
          borderRadius: 0,
          border: 'none',
          backgroundColor: 'var(--mui-palette-background-paper)',
          '&:hover': { backgroundColor: 'var(--mui-palette-action-hover)' }
        }}
      >
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={notificationCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 4, right: 4, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <svg
            width={20}
            height={20}
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M10.268 21a2 2 0 0 0 3.464 0' />
            <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
          </svg>
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal={!isSmallScreen}
        placement={isSmallScreen ? 'bottom' : 'bottom-end'}
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: '!mbs-3 z-[1] max-bs-[calc(100vh-120px)] bs-auto',
              modifiers: [
                {
                  name: 'preventOverflow',
                  enabled: true,
                  options: {
                    padding: 0,
                    boundariesElement: 'viewport'
                  }
                },
                {
                  name: 'offset',
                  options: {
                    offset: [0, 8]
                  }
                },
                {
                  name: 'computeStyles',
                  options: {
                    adaptive: false
                  }
                }
              ],
              style: {
                width: anchorRef.current?.offsetParent
                  ? (anchorRef.current.offsetParent as HTMLElement).offsetWidth
                  : '100%'
              }
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => {
          // Calculer la largeur de la navbarContent pour les petits écrans
          let navbarContentWidth: number | null = null

          if (isSmallScreen && anchorRef.current) {
            const navbarContent = anchorRef.current.closest('[class*="navbarContent"]') as HTMLElement

            if (navbarContent) {
              navbarContentWidth = navbarContent.offsetWidth
            }
          }

          return (
            <Fade
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}
            >
              <Paper
                className={classnames('bs-full', settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg')}
                sx={
                  isSmallScreen && navbarContentWidth
                    ? {
                        width: `${navbarContentWidth}px`,
                        maxWidth: `${navbarContentWidth}px`,
                        borderRadius: 0,
                        borderLeft: 'none',
                        borderRight: 'none',
                        marginLeft: anchorRef.current
                          ? `${anchorRef.current.getBoundingClientRect().left - (anchorRef.current.closest('[class*="navbarContent"]') as HTMLElement)?.getBoundingClientRect().left || 0}px`
                          : 0
                      }
                    : isSmallScreen
                      ? {
                          width: '100%',
                          maxWidth: '100%',
                          borderRadius: 0,
                          borderLeft: 'none',
                          borderRight: 'none'
                        }
                      : { borderRadius: '6px', overflow: 'hidden' }
                }
              >
                <ClickAwayListener onClickAway={handleClose}>
                  <div className='bs-full flex flex-col'>
                    {/* En-tête */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.25, py: 1.75 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '6px',
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'var(--mui-palette-primary-lightOpacity)',
                          color: 'primary.main',
                          flexShrink: 0
                        }}
                      >
                        <svg width={20} height={20} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
                          <path d='M10.268 21a2 2 0 0 0 3.464 0' />
                          <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
                        </svg>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                          Notifications
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.3 }}>
                          {notificationCount > 0 ? `${notificationCount} non lue${notificationCount > 1 ? 's' : ''}` : 'Tout est à jour'}
                        </Typography>
                      </Box>
                      {notificationsState.length > 0 && (
                        <Tooltip
                          title={readAll ? 'Marquer comme non lues' : 'Tout marquer comme lu'}
                          placement={placement === 'bottom-end' ? 'left' : 'right'}
                        >
                          <IconButton
                            size='small'
                            onClick={() => readAllNotifications()}
                            sx={{
                              borderRadius: '6px',
                              border: '1px solid var(--mui-palette-divider)',
                              color: 'text.secondary',
                              '&:hover': { bgcolor: 'action.hover', color: 'primary.main' }
                            }}
                          >
                            <i className={readAll ? 'tabler-mail' : 'tabler-mail-opened'} style={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    {/* Onglets Toutes / Non lues */}
                    <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, mx: 1.5, my: 1.25, borderRadius: '6px', bgcolor: 'action.hover' }}>
                      {([
                        { key: 'all', label: 'Toutes', count: notificationsState.length },
                        { key: 'unread', label: 'Non lues', count: notificationCount }
                      ] as const).map(t => {
                        const active = tab === t.key

                        return (
                          <Box
                            key={t.key}
                            role='button'
                            onClick={() => setTab(t.key)}
                            sx={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.75,
                              height: 32,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: 12.5,
                              fontWeight: 700,
                              transition: 'all .15s',
                              color: active ? 'primary.main' : 'text.secondary',
                              bgcolor: active ? 'background.paper' : 'transparent',
                              boxShadow: active ? 'var(--mui-customShadows-xs)' : 'none'
                            }}
                          >
                            {t.label}
                            {t.count > 0 && (
                              <Box
                                component='span'
                                sx={{
                                  minWidth: 18,
                                  height: 18,
                                  px: 0.5,
                                  borderRadius: '6px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  bgcolor: active ? 'var(--mui-palette-primary-lightOpacity)' : 'var(--mui-palette-divider)',
                                  color: active ? 'primary.main' : 'text.secondary'
                                }}
                              >
                                {t.count}
                              </Box>
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    {/* Liste filtrée */}
                    {(() => {
                      const items = notificationsState
                        .map((n, i) => ({ n, i }))
                        .filter(({ n }) => tab === 'all' || !n.read)

                      if (items.length === 0) {
                        return (
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 7, px: 3 }}>
                            <Box sx={{ width: 56, height: 56, borderRadius: '6px', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'text.disabled' }}>
                              <svg width={26} height={26} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round'>
                                <path d='M10.268 21a2 2 0 0 0 3.464 0' />
                                <path d='M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326' />
                              </svg>
                            </Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>
                              {tab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
                            </Typography>
                            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', textAlign: 'center' }}>
                              {tab === 'unread' ? 'Vous êtes à jour, tout a été lu.' : 'Vous serez prévenu ici dès qu’il y a du nouveau.'}
                            </Typography>
                          </Box>
                        )
                      }

                      return (
                        <ScrollWrapper hidden={hidden}>
                          {items.map(({ n, i }, pos) => {
                            const {
                              title,
                              subtitle,
                              time,
                              read,
                              avatarImage,
                              avatarIcon,
                              avatarText,
                              avatarColor,
                              avatarSkin
                            } = n

                            return (
                              <Box
                                key={i}
                                className='group'
                                onClick={e => {
                                  handleReadNotification(e, true, i)
                                  onItemClick?.(notificationsState[i])
                                  handleClose()
                                }}
                                sx={{
                                  display: 'flex',
                                  gap: 1.5,
                                  px: 2.25,
                                  py: 1.75,
                                  cursor: 'pointer',
                                  position: 'relative',
                                  transition: 'background-color .15s',
                                  borderBottom: pos !== items.length - 1 ? '1px dashed var(--mui-palette-divider)' : 'none',
                                  bgcolor: read ? 'transparent' : 'var(--mui-palette-primary-lightOpacity)',
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                {getAvatar({ avatarImage, avatarIcon, title, avatarText, avatarColor, avatarSkin })}
                                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary', lineHeight: 1.35, mb: 0.25 }}>
                                    {title}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.4, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {subtitle}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>{time}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                                  <Badge
                                    variant='dot'
                                    color={read ? 'secondary' : 'primary'}
                                    onClick={e => handleReadNotification(e, !read, i)}
                                    className={classnames('mbs-1 mie-1', { 'invisible group-hover:visible': read })}
                                  />
                                  <i
                                    className='tabler-x invisible group-hover:visible'
                                    style={{ fontSize: 18, color: 'var(--mui-palette-text-disabled)' }}
                                    onClick={e => handleRemoveNotification(e, i)}
                                  />
                                </Box>
                              </Box>
                            )
                          })}
                        </ScrollWrapper>
                      )
                    })()}
                  </div>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )
        }}
      </Popper>
    </>
  )
}

export default NotificationDropdown
