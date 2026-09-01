'use client'

// React Imports
import { useState, useEffect, Suspense, useContext } from 'react'

// MUI Imports
import { Box, CircularProgress, Typography, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'

// Context Imports
import { SocketContext } from '@/contexts/SocketContext'

// Styled component pour le loader
const LoaderOverlay = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(4px)',
  transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out',
  '&.hidden': {
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none'
  }
}))

const LoaderContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24
})

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 8
})

const LogoImage = styled('img')<{ themeMode: 'light' | 'dark' }>(({ themeMode }) => ({
  height: '60px',
  width: 'auto',
  objectFit: 'contain',
  filter: themeMode === 'dark'
    ? 'drop-shadow(0 2px 8px rgba(255, 255, 255, 0.1)) brightness(1.1)'
    : 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15))',
  transition: 'filter 0.3s ease-in-out, opacity 0.3s ease-in-out',
  opacity: themeMode === 'dark' ? 0.95 : 1
}))

const PageLoaderContent = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [socketReady, setSocketReady] = useState(false)
  const theme = useTheme()
  const themeMode = theme.palette.mode

  // Utiliser useContext directement pour éviter l'erreur si le provider n'est pas disponible
  const socketContext = useContext(SocketContext)
  const isConnected = socketContext?.isConnected ?? false
  const status = socketContext?.status ?? 'disconnected'
  const on = socketContext?.on

  // Écouter les événements socket pour détecter la connexion (si disponible)
  useEffect(() => {
    // Si le socket n'est pas disponible, ignorer
    if (!on) {
      return
    }

    // Si déjà connecté, marquer comme prêt
    if (isConnected && status === 'connected') {
      setSocketReady(true)

      return
    }

    // Écouter l'événement de connexion
    const handleConnect = () => {
      console.log('🔌 Socket connecté - PageLoader')
      setSocketReady(true)
    }

    const handleAuthenticated = () => {
      console.log('✅ Socket authentifié - PageLoader')
      setSocketReady(true)
    }

    // Écouter les événements socket
    on('connect', handleConnect)
    on('authenticated', handleAuthenticated)

    return () => {
      // Nettoyer les listeners
      if (socketContext?.off) {
        socketContext.off('connect', handleConnect)
        socketContext.off('authenticated', handleAuthenticated)
      }
    }
  }, [isConnected, status, on, socketContext])

  // Gérer uniquement le chargement initial (refresh/reload)
  useEffect(() => {
    // Détecter si c'est un vrai refresh (F5, Ctrl+R, etc.) ou un chargement initial
    // En Next.js App Router, la navigation entre pages ne recharge pas la page
    // On utilise performance API pour détecter le type de navigation

    // Vérifier si l'utilisateur est connecté (pour attendre la connexion socket)
    const shouldWaitForSocket = typeof window !== 'undefined' &&
      (document.cookie.includes('user=') || localStorage.getItem('auth_token'))

    const hideLoader = () => {
      // Si l'utilisateur est connecté, attendre la connexion socket
      if (shouldWaitForSocket) {
        // Vérifier immédiatement si le socket est déjà connecté
        if (socketReady || isConnected) {
          setIsLoading(false)

          return
        }

        // Sinon, attendre la connexion socket avec un timeout de sécurité
        const maxWaitTime = 2000 // 2 secondes maximum en cas de problème
        const startTime = Date.now()

        const checkSocket = setInterval(() => {
          const elapsed = Date.now() - startTime

          // Si le socket est prêt ou si on a dépassé le timeout de sécurité
          if (socketReady || isConnected || elapsed >= maxWaitTime) {
            clearInterval(checkSocket)
            setIsLoading(false)
          }
        }, 50)
      } else {
        // Utilisateur non connecté, masquer immédiatement si la page est chargée
        setIsLoading(false)
      }
    }

    // Fonction pour vérifier si la page est chargée
    const checkPageLoaded = () => {
      if (typeof window === 'undefined') {
        return false
      }

      // Vérifier l'état de chargement du document
      if (document.readyState === 'complete') {
        return true
      }

      // Vérifier si les ressources sont chargées
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing
        const loadTime = timing.loadEventEnd - timing.navigationStart

        if (loadTime > 0) {
          return true
        }
      }

      return false
    }

    // Vérifier si l'API Performance Navigation Timing est disponible
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

      if (navigation) {
        // 'reload' = refresh (F5, Ctrl+R)
        // 'navigate' = première visite ou navigation directe
        // 'back_forward' = navigation via boutons précédent/suivant
        const isReload = navigation.type === 'reload'
        const isInitialNavigate = navigation.type === 'navigate' && !sessionStorage.getItem('hasLoaded')

        if (isReload || isInitialNavigate) {
          // Marquer que la page a été chargée
          sessionStorage.setItem('hasLoaded', 'true')

          // Attendre que la page soit chargée
          if (checkPageLoaded()) {
            hideLoader()
          } else {
            // Écouter l'événement de chargement
            const handleLoad = () => {
              hideLoader()
            }

            // Si le document est déjà chargé, masquer immédiatement
            if (document.readyState === 'complete') {
              hideLoader()
            } else {
              window.addEventListener('load', handleLoad)
              document.addEventListener('DOMContentLoaded', handleLoad)

              return () => {
                window.removeEventListener('load', handleLoad)
                document.removeEventListener('DOMContentLoaded', handleLoad)
              }
            }
          }
        } else {
          // Navigation SPA (pas de refresh), ne pas afficher le loader
          setIsLoading(false)
        }
      } else {
        // Fallback : utiliser sessionStorage si l'API n'est pas disponible
        const isInitialLoad = !sessionStorage.getItem('hasLoaded')

        if (isInitialLoad) {
          sessionStorage.setItem('hasLoaded', 'true')

          if (checkPageLoaded()) {
            hideLoader()
          } else {
            const handleLoad = () => {
              hideLoader()
            }

            if (document.readyState === 'complete') {
              hideLoader()
            } else {
              window.addEventListener('load', handleLoad)
              document.addEventListener('DOMContentLoaded', handleLoad)

              return () => {
                window.removeEventListener('load', handleLoad)
                document.removeEventListener('DOMContentLoaded', handleLoad)
              }
            }
          }
        } else {
          setIsLoading(false)
        }
      }
    } else {
      // Fallback : utiliser sessionStorage si l'API n'est pas disponible
      const isInitialLoad = !sessionStorage.getItem('hasLoaded')

      if (isInitialLoad) {
        sessionStorage.setItem('hasLoaded', 'true')

        if (checkPageLoaded()) {
          hideLoader()
        } else {
          const handleLoad = () => {
            hideLoader()
          }

          if (document.readyState === 'complete') {
            hideLoader()
          } else {
            window.addEventListener('load', handleLoad)
            document.addEventListener('DOMContentLoaded', handleLoad)

            return () => {
              window.removeEventListener('load', handleLoad)
              document.removeEventListener('DOMContentLoaded', handleLoad)
            }
          }
        }
      } else {
        setIsLoading(false)
      }
    }
  }, [socketReady, isConnected, status])

  // Ne pas afficher le loader si ce n'est pas un chargement initial
  if (!isLoading) {
    return null
  }

  return (
    <LoaderOverlay className={!isLoading ? 'hidden' : ''}>
      <LoaderContent>
        <div
          style={{
            position: 'relative',
            width: 84,
            height: 84,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <CircularProgress
            size={84}
            thickness={6}
            sx={{
              color: '#FF6100',
              position: 'absolute',
              inset: 0,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round'
              }
            }}
          />
          <img
            src='/images/logo/logo-transparent.png'
            alt='YoYo'
            style={{ width: 40, height: 40, objectFit: 'contain' }}
          />
        </div>
        <Typography
          variant='body2'
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500
          }}
        >
          Chargement...
        </Typography>
      </LoaderContent>
    </LoaderOverlay>
  )
}

const PageLoader = () => {
  return (
    <Suspense fallback={null}>
      <PageLoaderContent />
    </Suspense>
  )
}

export default PageLoader

