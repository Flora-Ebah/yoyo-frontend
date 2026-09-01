'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

type QuickActionCardProps = {
  title: string
  description: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

const QuickActionCard = ({ title, description, icon, color }: QuickActionCardProps) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'var(--mui-customShadows-lg)'
        }
      }}
    >
      <CardContent>
        <Box className='flex items-start gap-4'>
          <Box
            className='flex items-center justify-center rounded'
            sx={{
              width: 48,
              height: 48,
              backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
              color: `var(--mui-palette-${color}-main)`
            }}
          >
            <i className={icon} style={{ fontSize: '1.5rem' }} />
          </Box>
          <Box className='flex-1'>
            <Typography variant='h6' className='mb-1'>
              {title}
            </Typography>
            <Typography variant='body2' className='text-textSecondary'>
              {description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default QuickActionCard

