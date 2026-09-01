'use client'

// React Imports
import type { MouseEvent } from 'react'
import { useRef, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Divider from '@mui/material/Divider'
import Fade from '@mui/material/Fade'
import MenuItem from '@mui/material/MenuItem'
import MenuList from '@mui/material/MenuList'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

import { useSession } from '@/hooks/useSession'

// Server Actions
import { logoutAction } from '@/app/actions/auth.actions'

// Utils
import { getInitials } from '@/utils/getInitials'

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const { session, isLoading } = useSession()

  const handleDropdownOpen = () => {
    !open ? setOpen(true) : setOpen(false)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      await logoutAction()

      // redirect('/login') est gere cote serveur dans logoutAction
    } catch (error) {
      console.error('Erreur lors de la deconnexion:', error)
      router.replace('/login')
    }
  }

  // Afficher un placeholder si la session n'est pas encore chargee
  const displayName = session?.user?.username || session?.user?.email || 'Utilisateur'
  const displayEmail = session?.user?.email || ''

  // Pour les initiales, utiliser le username si disponible, sinon extraire de l'email
  const nameForInitials = session?.user?.username
    ? session.user.username
    : displayEmail.includes('@')
      ? displayEmail.split('@')[0] // Utiliser la partie avant @ pour les emails
      : displayName

  const userInitials = getInitials(nameForInitials)

  // Verifier si l'avatar est disponible
  const avatarValue = session?.user?.avatar
  const userAvatar = typeof avatarValue === 'string' && avatarValue.trim() !== '' ? avatarValue : undefined

  return (
    <>
      <Box
        ref={anchorRef}
        onClick={handleDropdownOpen}
        className='cursor-pointer mis-2'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderRadius: '6px',
          border: { xs: 'none', sm: '1px solid var(--mui-palette-divider)' },
          backgroundColor: { xs: 'transparent', sm: 'var(--mui-palette-background-paper)' },
          padding: { xs: 0, sm: '4px' },
          paddingInlineEnd: { xs: 0, sm: '12px' }
        }}
      >
        <Avatar alt={displayName} src={userAvatar} className='bs-[36px] is-[36px]'>
          {!userAvatar && userInitials}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', lineHeight: 1.25 }}>
            {displayName}
          </Typography>
          {displayEmail && (
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', lineHeight: 1.25 }}>{displayEmail}</Typography>
          )}
        </Box>
      </Box>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}
              sx={{ borderRadius: '6px', overflow: 'hidden', minWidth: 260 }}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <div>
                  {/* En-tête profil */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.25, py: 2 }} tabIndex={-1}>
                    <Avatar alt={displayName} src={userAvatar} sx={{ width: 44, height: 44, fontWeight: 600 }}>
                      {!userAvatar && userInitials}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {isLoading ? 'Chargement...' : displayName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayEmail || 'Non connecté'}
                      </Typography>
                      {session?.user?.role && (
                        <Box
                          component='span'
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            mt: 0.75,
                            px: 1,
                            py: 0.25,
                            borderRadius: '7px',
                            fontSize: 11,
                            fontWeight: 600,
                            bgcolor: 'var(--mui-palette-primary-lightOpacity)',
                            color: 'primary.main'
                          }}
                        >
                          {session.user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  {/* Liens rapides */}
                  <MenuList sx={{ py: 1 }}>
                    <MenuItem
                      onClick={e => handleDropdownClose(e, '/account-settings')}
                      sx={{ mx: 1, borderRadius: '6px', gap: 1.5, py: 1, fontSize: 13.5, fontWeight: 500 }}
                    >
                      <i className='tabler-user' style={{ fontSize: 19, color: 'var(--mui-palette-text-secondary)' }} />
                      Mon profil
                    </MenuItem>
                  </MenuList>
                  <Divider sx={{ borderStyle: 'dashed' }} />
                  <Box sx={{ p: 1.5 }}>
                    <Button
                      fullWidth
                      variant='tonal'
                      color='error'
                      size='small'
                      onClick={handleUserLogout}
                      disabled={isLoggingOut}
                      sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 500, '& .MuiButton-endIcon': { marginInlineStart: 1 } }}
                    >
                      {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
                    </Button>
                  </Box>
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown

