import { useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

interface PurchaseFiltersProps {
  onTypeChange: (value: string) => void
  onPaymentStatusChange: (value: string) => void
  onSubscriptionStatusChange: (value: string) => void
  onReset: () => void
}

export const PurchaseFilters = ({
  onTypeChange,
  onPaymentStatusChange,
  onSubscriptionStatusChange,
  onReset
}: PurchaseFiltersProps) => {
  const [type, setType] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [subscriptionStatus, setSubscriptionStatus] = useState('all')

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setType(value)
    onTypeChange(value)
  }

  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setPaymentStatus(value)
    onPaymentStatusChange(value)
  }

  const handleSubscriptionStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setSubscriptionStatus(value)
    onSubscriptionStatusChange(value)
  }

  const handleReset = () => {
    setType('all')
    setPaymentStatus('all')
    setSubscriptionStatus('all')
    onReset()
  }

  const hasActiveFilters = type !== 'all' || paymentStatus !== 'all' || subscriptionStatus !== 'all'

  const activeChips = [
    type !== 'all' && { label: `Type: ${type === 'pack' ? 'Pack' : 'Abonnement'}`, key: 'type' },
    paymentStatus !== 'all' && {
      label:
        paymentStatus === 'completed'
          ? 'Paiement: Payé'
          : paymentStatus === 'pending'
            ? 'Paiement: En attente'
            : paymentStatus === 'failed'
              ? 'Paiement: Échoué'
              : 'Paiement: Remboursé',
      key: 'payment'
    },
    subscriptionStatus !== 'all' && {
      label:
        subscriptionStatus === 'active'
          ? 'Abonnement: Actif'
          : subscriptionStatus === 'expired'
            ? 'Abonnement: Expiré'
            : 'Abonnement: Annulé',
      key: 'subscription'
    }
  ].filter(Boolean) as { label: string; key: string }[]

  return (
    <CardContent>
      <Box className='flex items-center justify-between mb-4 flex-wrap gap-3'>
        <Box>
          <Typography variant='h6'>Filtres</Typography>
          <Typography variant='body2' color='text.secondary'>
            Affinez la liste des achats selon le type et le statut.
          </Typography>
        </Box>
        <Button variant='outlined' onClick={handleReset} disabled={!hasActiveFilters}>
          Réinitialiser
        </Button>
      </Box>
      <Divider className='mb-4' />
      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }
        }}
      >
        <Box>
          <TextField
            select
            fullWidth
            label='Type'
            value={type}
            onChange={handleTypeChange}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value='all'>Tous</MenuItem>
            <MenuItem value='pack'>Pack</MenuItem>
            <MenuItem value='subscription'>Abonnement</MenuItem>
          </TextField>
        </Box>
        <Box>
          <TextField
            select
            fullWidth
            label='Statut de paiement'
            value={paymentStatus}
            onChange={handlePaymentStatusChange}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value='all'>Tous</MenuItem>
            <MenuItem value='completed'>Payé</MenuItem>
            <MenuItem value='pending'>En attente</MenuItem>
            <MenuItem value='failed'>Échoué</MenuItem>
            <MenuItem value='refunded'>Remboursé</MenuItem>
          </TextField>
        </Box>
        <Box>
          <TextField
            select
            fullWidth
            label='Statut abonnement'
            value={subscriptionStatus}
            onChange={handleSubscriptionStatusChange}
            sx={{ minWidth: 240 }}
          >
            <MenuItem value='all'>Tous</MenuItem>
            <MenuItem value='active'>Actif</MenuItem>
            <MenuItem value='expired'>Expiré</MenuItem>
            <MenuItem value='cancelled'>Annulé</MenuItem>
          </TextField>
        </Box>
      </Box>
      {activeChips.length > 0 && (
        <Stack direction='row' spacing={1} className='mt-4 flex-wrap'>
          {activeChips.map(chip => (
            <Chip key={chip.key} label={chip.label} variant='outlined' />
          ))}
        </Stack>
      )}
    </CardContent>
  )
}

