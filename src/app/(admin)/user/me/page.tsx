'use client'

// React Imports
import type { ReactElement, SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'

// MUI Imports
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'

// Type Imports
import CustomTabList from '@core/components/mui/TabList'

import type { Data, ProfileTabType } from '@/types/pages/profileTypes'

// Component Imports
import ProfileTab from './profile'
import LoginHistoryTable from './profile/LoginHistoryTable'

// Service Imports
import { userService } from '@/services/user.service'

const UserProfileView = ({
  tabContentList,
  data
}: {
  tabContentList: { [key: string]: ReactElement }
  data?: Data
}) => {
  // States
  const [activeTab, setActiveTab] = useState('profile')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-user-check text-lg' />
                    Profil
                  </div>
                }
                value='profile'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-link text-lg' />
                    Connexions
                  </div>
                }
                value='connections'
              />
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

const UserProfilePage = () => {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await userService.getCurrentUser()

        if (!currentUser) {
          throw new Error("Impossible de récupérer les informations de l'utilisateur")
        }

        const about = [
          {
            property: 'Nom complet',
            value: `${currentUser.firstname || ''} ${currentUser.lastname || ''}`.trim() || currentUser.username || '',
            icon: 'tabler-user'
          },
          {
            property: "Nom d'utilisateur",
            value: currentUser.username || '',
            icon: 'tabler-at'
          },
          { property: 'Statut', value: currentUser.status === 'active' ? 'Actif' : 'Inactif', icon: 'tabler-check' },
          {
            property: 'Rôle',
            value: currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur',
            icon: 'tabler-crown'
          },
          {
            property: 'Membre depuis',
            value: new Date(currentUser.createdAt).toLocaleDateString('fr-FR'),
            icon: 'tabler-calendar'
          }
        ]

        const contacts = [{ property: 'Email', value: currentUser.email || '', icon: 'tabler-mail' }]

        if (currentUser.contact) {
          contacts.push({ property: 'Téléphone', value: currentUser.contact, icon: 'tabler-phone' })
        }

        const overview: any[] = []

        if (currentUser.isEmailConfirmed !== undefined) {
          overview.push({
            property: 'Email confirmé',
            value: currentUser.isEmailConfirmed ? 'Oui' : 'Non',
            icon: currentUser.isEmailConfirmed ? 'tabler-mail-check' : 'tabler-mail-exclamation'
          })
        }

        if (currentUser.isPhoneConfirmed !== undefined) {
          overview.push({
            property: 'Téléphone confirmé',
            value: currentUser.isPhoneConfirmed ? 'Oui' : 'Non',
            icon: currentUser.isPhoneConfirmed ? 'tabler-phone-check' : 'tabler-phone-off'
          })
        }

        if (currentUser.isDocumentVerified !== undefined) {
          overview.push({
            property: 'Identité vérifiée',
            value: currentUser.isDocumentVerified ? 'Oui' : 'Non',
            icon: currentUser.isDocumentVerified ? 'tabler-id' : 'tabler-id-off'
          })
        }

        if (currentUser.isCertified !== undefined) {
          overview.push({
            property: 'Certifié',
            value: currentUser.isCertified ? 'Oui' : 'Non',
            icon: currentUser.isCertified ? 'tabler-certificate' : 'tabler-certificate-off'
          })
        }

        if (currentUser.profileCompleted !== undefined) {
          overview.push({
            property: 'Profil complété',
            value: currentUser.profileCompleted ? 'Oui' : 'Non',
            icon: currentUser.profileCompleted ? 'tabler-list-check' : 'tabler-list'
          })
        }

        if (currentUser.authProvider) {
          overview.push({
            property: 'Authentification',
            value: currentUser.authProvider,
            icon: 'tabler-lock'
          })
        }

        if (currentUser.securityPreferences?.twoFactorEnabled !== undefined) {
          overview.push({
            property: 'Double authentification',
            value: currentUser.securityPreferences.twoFactorEnabled ? 'Activé' : 'Désactivé',
            icon: 'tabler-shield-lock'
          })
        }

        const userProfile: ProfileTabType = {
          about,
          contacts,
          teams: [],
          overview
        }

        setData({
          user: currentUser,
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
    connections: <LoginHistoryTable />
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <UserProfileView tabContentList={tabContentList} data={data || undefined} />
}

export default UserProfilePage
