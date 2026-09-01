'use client'

// React Imports
import { useState, useEffect } from 'react'
import type { ReactElement } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Component Imports
import UserProfile from '@/views/pages/user-profile'
import ProfileTab from '@/views/pages/user-profile/profile'

// Service Imports
import { userService } from '@/services/user.service'

// Type Imports
import type { Data, ProfileHeaderType, ProfileTabType } from '@/views/pages/user-profile/types'
import type { User } from '@/services/user.service'

const UserProfilePage = () => {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await userService.getCurrentUser()
        
        // Transformation des données pour le template
        const fullName =
          `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim() || currentUser.username || 'Utilisateur'

        // Transformation des données pour le template
        const profileHeader: ProfileHeaderType = {
          fullName,
          coverImg: '/images/pages/profile-banner.png',
          profileImg: '/images/avatars/1.png',
          designation: currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur',
          designationIcon: 'tabler-user',
          location: 'Non spécifié', // Pas de localisation dans les données API
          joiningDate: new Date(currentUser.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }

        const about = [
          { property: 'Nom complet', value: fullName, icon: 'tabler-user' },
          { property: 'Statut', value: currentUser.status === 'active' ? 'Actif' : 'Inactif', icon: 'tabler-check' },
          { property: 'Rôle', value: currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur', icon: 'tabler-crown' },
          // { property: 'Pays', value: 'Non spécifié', icon: 'tabler-flag' },
          // { property: 'Langue', value: 'Français', icon: 'tabler-language' }
        ]

        const contacts = [
          { property: 'Email', value: currentUser.email || '', icon: 'tabler-mail' }
        ]
        
        // Ajout du téléphone s'il existe (non présent dans l'interface User actuelle mais possible dans les données brutes)
        // if ((currentUser as any).phone) {
        //   contacts.unshift({ property: 'Contact', value: (currentUser as any).phone, icon: 'tabler-phone' })
        // }

        const overview = [
          // Données fictives pour l'instant
          // { property: 'Tâches complétées', value: '0', icon: 'tabler-check' },
          // { property: 'Connexions', value: '0', icon: 'tabler-users' },
          // { property: 'Projets', value: '0', icon: 'tabler-layout-grid' }
        ]
        
        if (currentUser.isEmailConfirmed) {
            overview.push({ property: 'Email confirmé', value: 'Oui', icon: 'tabler-mail-check' })
        }
        
        if (currentUser.isPhoneConfirmed) {
             overview.push({ property: 'Téléphone confirmé', value: 'Oui', icon: 'tabler-phone-check' })
        }

        const userProfile: ProfileTabType = {
          about,
          contacts,
          teams: [],
          overview
        }

        setData({
          profileHeader,
          userProfile
        })
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const tabContentList: { [key: string]: ReactElement } = {
    profile: <ProfileTab data={data?.userProfile} />,
    teams: <div className='flex justify-center p-5'>Fonctionnalité Équipes à venir</div>,
    projects: <div className='flex justify-center p-5'>Fonctionnalité Projets à venir</div>,
    connections: <div className='flex justify-center p-5'>Fonctionnalité Connexions à venir</div>
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <UserProfile tabContentList={tabContentList} data={data || undefined} />
}

export default UserProfilePage






