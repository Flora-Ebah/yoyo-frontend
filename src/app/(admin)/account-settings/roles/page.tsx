'use client'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import PageContainer from '@/components/PageContainer'
import { usePermissions } from '@/hooks/usePermissions'
import RolesPermissionsManager from '../components/RolesPermissionsManager'

export default function RolesPage() {
  const router = useRouter()
  const { can, ready } = usePermissions()
  const canRoles = can('read', 'roles')

  return (
    <PageContainer
      title='Rôles & permissions'
      subtitle='Définissez les rôles et leurs droits d’accès aux modules'
      actions={
        <Button
          variant='text'
          disableRipple
          onClick={() => router.push('/account-settings')}
          sx={{ ml: 'auto', height: 36, borderRadius: 0, textTransform: 'none', px: 1.5, color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' } }}
        >
          Retour
        </Button>
      }
    >
      {ready && !canRoles ? (
        <Alert severity='warning'>Vous n&apos;avez pas la permission de gérer les rôles &amp; permissions.</Alert>
      ) : (
        <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
          <CardContent sx={{ p: 3 }}>
            <RolesPermissionsManager />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
