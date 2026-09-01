'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import PageContainer from '@/components/PageContainer'
import { useSession } from '@/hooks/useSession'
import { usePermissions } from '@/hooks/usePermissions'
import { userService, type User } from '@/services/user.service'
import { getInitials } from '@/utils/getInitials'

export default function ProfilPage() {
  const router = useRouter()
  const { can, ready } = usePermissions()
  const isSuperAdmin = can('manage', 'all')
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  const { session, isLoading: isSessionLoading } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await userService.getCurrentUser()

        setUser(currentUser)
      } catch {
        if (session?.user) {
          setUser({
            _id: session.user.id,
            email: session.user.email,
            username: session.user.username,
            firstname: session.user.firstname,
            lastname: session.user.lastname,
            role: session.user.role as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User)
        }
      } finally {
        setLoading(false)
      }
    }

    if (!isSessionLoading) {
      if (session?.user) fetchUserData()
      else setLoading(false)
    }
  }, [session, isSessionLoading])

  const displayName = user
    ? user.firstname && user.lastname
      ? `${user.firstname} ${user.lastname}`
      : user.username || user.email || 'Utilisateur'
    : 'Utilisateur'

  const backTo = isCommercial ? '/commercial' : '/account-settings'

  return (
    <PageContainer
      title='Mon profil'
      subtitle='Vos informations de compte'
      actions={
        <Button
          variant='text'
          disableRipple
          onClick={() => router.push(backTo)}
          sx={{ ml: 'auto', height: 36, borderRadius: '6px', textTransform: 'none', px: 1.5, color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' } }}
        >
          Retour
        </Button>
      }
    >
      {loading ? (
        <Box className='flex items-center justify-center min-h-[300px]'>
          <CircularProgress />
        </Box>
      ) : !user ? (
        <Alert severity='error'>Utilisateur non trouvé</Alert>
      ) : (
        <Card sx={{ borderRadius: '5px', border: 'none', boxShadow: 'none', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, backgroundColor: 'var(--mui-palette-action-hover)' }}>
            <Avatar src={user.avatar} alt={displayName} sx={{ width: 72, height: 72, fontSize: 26, fontWeight: 800, color: 'primary.main', backgroundColor: 'background.paper', border: '2px solid', borderColor: 'var(--mui-palette-primary-lightOpacity)' }}>
              {getInitials(displayName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{displayName}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>{user.email || '-'}</Typography>
              <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 700, px: 1.25, py: 0.5, borderRadius: '6px', color: 'primary.main', backgroundColor: 'var(--mui-palette-primary-lightOpacity)' }}>
                {user.role === 'admin' ? 'Administrateur' : user.role === 'provider' ? 'Prestataire' : 'Utilisateur'}
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '.03em' }}>
              Détails du compte
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, columnGap: 4 }}>
              {[
                { k: 'Prénom', v: user.firstname || '-' },
                { k: 'Nom', v: user.lastname || '-' },
                { k: 'Email', v: user.email || '-' },
                { k: 'Téléphone', v: user.contact || '-' },
                { k: "Nom d'utilisateur", v: user.username || '-' },
                { k: 'Statut', v: user.status || 'Actif' },
                { k: 'Membre depuis', v: new Date(user.createdAt).toLocaleDateString('fr-FR') }
              ].map(row => (
                <Box key={row.k} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1.5, borderBottom: '2px dashed', borderColor: 'var(--mui-palette-divider)' }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>{row.k}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.v}
                  </Typography>
                </Box>
              ))}
            </Box>

            {isSuperAdmin && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant='contained' disableElevation disabled sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2 }}>
                  Modifier le profil (bientôt)
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  )
}
