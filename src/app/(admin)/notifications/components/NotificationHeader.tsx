import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { AddIcon } from '@/components/ui'

import CustomAvatar from '@core/components/mui/Avatar'
import PageHeader from '@/components/page/PageHeader'

interface NotificationHeaderProps {
  onAdd: () => void
  onMarkAllRead: () => void
  onDeleteRead: () => void
  totalCount: number
  unreadCount: number
  readCount: number
}

const NotificationHeader = ({
  onAdd,
  onMarkAllRead,
  onDeleteRead,
  totalCount,
  unreadCount,
  readCount
}: NotificationHeaderProps) => {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: theme => `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        overflow: 'hidden',
        bgcolor: theme =>
          `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.background.paper} 60%)`
      }}
    >
      <CardContent sx={{ p: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexGrow: 1 }}>
            <CustomAvatar skin='light' color='primary' variant='rounded' size={52}>
              <i className='tabler-bell' style={{ fontSize: '1.9rem' }} />
            </CustomAvatar>
            <PageHeader
              title='Notifications'
              subtitle='Gerez et diffusez des messages a vos utilisateurs en temps reel'
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              columnGap: 2,
              rowGap: 1.5,
              width: { xs: '100%', md: 'auto' },
              maxWidth: '100%',
              justifyContent: { xs: 'stretch', md: 'flex-end' },
              alignItems: 'center'
            }}
          >
            <Button
              variant='contained'
              onClick={onAdd}
              sx={{
                px: 3.5,
                py: 1.25,
                minHeight: 44,
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap'
              }}
            >
              Nouveau message
            </Button>
            <Button
              variant='tonal'
              color='primary'
              onClick={onMarkAllRead}
              sx={{
                px: 3.5,
                py: 1.25,
                minHeight: 44,
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap'
              }}
            >
              Tout marquer lu
            </Button>
            <Button
              variant='tonal'
              color='error'
              onClick={onDeleteRead}
              sx={{
                px: 3.5,
                py: 1.25,
                minHeight: 44,
                borderRadius: 2,
                width: { xs: '100%', sm: 'auto' },
                whiteSpace: 'nowrap'
              }}
            >
              Nettoyer les lues
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 5,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            alignItems: 'stretch'
          }}
        >
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: theme => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              minHeight: 96,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.5
            }}
          >
            <Typography variant='overline' color='text.secondary'>
              Total
            </Typography>
            <Typography
              variant='h4'
              sx={{ lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', fontSize: { xs: '1.6rem', md: '2rem' } }}
            >
              {totalCount}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: theme => `1px solid ${theme.palette.primary.main}30`,
              bgcolor: theme => `${theme.palette.primary.main}08`,
              minHeight: 96,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.5
            }}
          >
            <Typography variant='overline' color='text.secondary'>
              Non lues
            </Typography>
            <Typography
              variant='h4'
              color='primary'
              sx={{ lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', fontSize: { xs: '1.6rem', md: '2rem' } }}
            >
              {unreadCount}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              border: theme => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              minHeight: 96,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 0.5
            }}
          >
            <Typography variant='overline' color='text.secondary'>
              Lues
            </Typography>
            <Typography
              variant='h4'
              sx={{ lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', fontSize: { xs: '1.6rem', md: '2rem' } }}
            >
              {readCount}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default NotificationHeader
