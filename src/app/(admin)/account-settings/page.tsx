'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'
import { usePermissions } from '@/hooks/usePermissions'
import { ArrowUpRightIcon, type UiPalette } from '@/components/ui'

type SettingItem = {
  key: string
  label: string
  description: string
  icon: string
  href: string
  palette: UiPalette
  show: boolean
}

export default function SettingsHubPage() {
  const theme = useTheme()
  const router = useRouter()
  const { can, ready } = usePermissions()

  const canRoles = can('read', 'roles')
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  const items: SettingItem[] = [
    { key: 'profil', label: 'Mon profil', description: 'Vos informations de compte', icon: 'tabler-user', href: '/account-settings/profil', palette: 'primary', show: true },
    { key: 'roles', label: 'Rôles & permissions', description: 'Rôles et droits d’accès aux modules', icon: 'tabler-shield-lock', href: '/account-settings/roles', palette: 'info', show: canRoles },
    { key: 'categories', label: 'Catégories', description: 'Taxonomie des services et produits', icon: 'tabler-category', href: '/categories', palette: 'success', show: !isCommercial }
  ]

  const visible = items.filter(i => i.show)

  return (
    <PageContainer
      title='Paramètres'
      subtitle='Configuration du back-office'
      actions={
        isCommercial ? (
          <Button
            variant='text'
            disableRipple
            onClick={() => router.push('/commercial')}
            sx={{ ml: 'auto', height: 36, borderRadius: 0, textTransform: 'none', px: 1.5, color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover', color: 'primary.main' } }}
          >
            Retour
          </Button>
        ) : undefined
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: { xs: 2, sm: 3 } }}>
        {visible.map(item => {
          const color = theme.palette[item.palette].main

          return (
            <Card
              key={item.key}
              component={Link}
              href={item.href}
              sx={{
                borderRadius: 0,
                border: 'none',
                boxShadow: 'none',
                textDecoration: 'none',
                transition: 'background-color .15s',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 46, height: 46, flexShrink: 0, borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color, backgroundColor: alpha(color, 0.14) }}>
                  <i className={`${item.icon} text-2xl`} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: 'text.primary' }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>{item.description}</Typography>
                </Box>
                <ArrowUpRightIcon size={18} style={{ color: 'var(--mui-palette-text-disabled)' }} />
              </CardContent>
            </Card>
          )
        })}
      </Box>
    </PageContainer>
  )
}
