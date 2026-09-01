'use client'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Service Imports
import { type Event } from '@/services/event.service'

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  draft: 'default',
  registration: 'info',
  scheduled: 'primary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error'
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  registration: 'Inscriptions ouvertes',
  scheduled: 'Programmé',
  in_progress: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
}

const TYPE_LABELS: Record<string, string> = {
  tournament: 'Tournoi',
  championship: 'Championnat',
  challenge: 'Défi',
  season: 'Saison',
  custom: 'Personnalisé'
}

interface EventCardProps {
  event: Event
  showDescription?: boolean
  showParticipants?: boolean
  showDate?: boolean
}

export default function EventCard({
  event,
  showDescription = true,
  showParticipants = true,
  showDate = true
}: EventCardProps) {
  const eventId = event.id || event._id

  return (
    <Card
      component={Link}
      href={`/events/${eventId}`}
      className='event-card'
      sx={(theme) => ({
        cursor: 'pointer',
        textDecoration: 'none',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          backgroundColor: theme.palette.mode === 'dark'
            ? '#2a2a2a'
            : '#e8e8e8'
        }
      })}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box className='flex items-start justify-between mb-3'>
          <Box className='flex-1'>
            <Typography variant='h6' className='mb-2'>
              {event.name}
            </Typography>
            <Box className='flex flex-wrap gap-2 mb-2'>
              <Chip
                label={STATUS_LABELS[event.status] || event.status}
                color={STATUS_COLORS[event.status] || 'default'}
                size='small'
              />
              <Chip
                label={TYPE_LABELS[event.type] || event.type}
                size='small'
                variant='outlined'
              />
            </Box>
          </Box>
        </Box>

        {showDescription && event.description && (
          <Typography variant='body2' className='text-textSecondary mb-3 line-clamp-2'>
            {event.description}
          </Typography>
        )}

        {showParticipants && (
          <Box className='flex items-center gap-4 mb-3 text-sm text-textSecondary'>
            {event.participants && (
              <Box className='flex items-center gap-1'>
                <i className='tabler-users text-base' />
                <span>{event.participants.length} participant{event.participants.length > 1 ? 's' : ''}</span>
              </Box>
            )}
            {event.maxParticipants && (
              <Box className='flex items-center gap-1'>
                <i className='tabler-user-plus text-base' />
                <span>Max: {event.maxParticipants}</span>
              </Box>
            )}
          </Box>
        )}

        {showDate && event.startDate && (
          <Typography variant='caption' className='text-textSecondary block mt-auto'>
            <i className='tabler-calendar text-sm mr-1' />
            {new Date(event.startDate).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

