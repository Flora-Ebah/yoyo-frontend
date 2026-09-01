'use client'

import { useMemo, useState } from 'react'

import Link from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import PageContainer from '@/components/PageContainer'

type FaqEntry = {
  title: string
  href: string
  icon: string
  objectif: string
  actions: string[]
  conseils: string[]
}

const faqEntries: FaqEntry[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: 'tabler-layout-dashboard',
    objectif: 'Vue globale des indicateurs clients, professionnels, transactions et modération.',
    actions: ['Vérifier les compteurs', 'Contrôler les tendances de paiement', 'Accéder rapidement aux modules'],
    conseils: ['Cliquer sur Actualiser en cas de décalage', 'Comparer avec la page Transactions pour confirmer les montants']
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: 'tabler-users',
    objectif: 'Suivre les comptes clients finaux et leur statut de vérification.',
    actions: ['Rechercher un client', 'Filtrer par statut', 'Ouvrir les actions de modération'],
    conseils: ['Utiliser la recherche par email/contact', 'Vérifier le statut KYC avant toute action manuelle']
  },
  {
    title: 'Professionnels',
    href: '/pros',
    icon: 'tabler-building-store',
    objectif: 'Pilotage des comptes partenaires/professionnels.',
    actions: ['Lister les comptes pro', 'Filtrer les statuts', 'Vérifier les informations de contact'],
    conseils: ['Contrôler les catégories associées', 'Vérifier les comptes inactifs avant réactivation']
  },
  {
    title: 'Transactions',
    href: '/transactions',
    icon: 'tabler-receipt-2',
    objectif: 'Suivi des paiements et correction des statuts métier.',
    actions: ['Filtrer les transactions', 'Vérifier paymentStatus', 'Mettre à jour un statut métier'],
    conseils: ['Comparer statut métier et statut de paiement', 'Actualiser après une correction de statut']
  },
  {
    title: 'Modération',
    href: '/moderation',
    icon: 'tabler-shield-check',
    objectif: 'Validation KYC et contrôle des questions secrètes.',
    actions: ['Valider/Rejeter un dossier KYC', 'Renseigner un motif de rejet', 'Activer/désactiver des questions'],
    conseils: ['Toujours ajouter une note de revue en rejet', 'Vérifier la cohérence langue/catégorie des questions']
  },
  {
    title: 'Comptes admin',
    href: '/admins',
    icon: 'tabler-user-shield',
    objectif: 'CRUD des comptes administrateurs du back-office.',
    actions: ['Créer un admin', 'Modifier les informations', 'Activer/suspendre/supprimer un compte'],
    conseils: ['Limiter la création de comptes', 'Associer un profil de droits adapté']
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: 'tabler-bell',
    objectif: 'Envoyer des messages ciblés et suivre les lectures.',
    actions: ['Composer une notification', 'Cibler un utilisateur', 'Marquer comme lues'],
    conseils: ['Éviter les messages trop longs', 'Prioriser les alertes importantes']
  },
  {
    title: 'Paramètres',
    href: '/account-settings',
    icon: 'tabler-settings',
    objectif: 'Réglages personnels du compte connecté.',
    actions: ['Mettre à jour les infos', 'Modifier les préférences', 'Vérifier les paramètres de sécurité'],
    conseils: ['Mettre à jour le mot de passe régulièrement', 'Vérifier l’email du compte admin']
  }
]

export default function FaqPage() {
  const theme = useTheme()
  const [query, setQuery] = useState('')

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return faqEntries

    return faqEntries.filter(e =>
      [e.title, e.objectif, ...e.actions, ...e.conseils].join(' ').toLowerCase().includes(q)
    )
  }, [query])

  const primary = theme.palette.primary.main

  const Section = ({ icon, title, items }: { icon: string; title: string; items: string[] }) => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
        <i className={icon} style={{ fontSize: '1rem', color: primary }} />
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.03em' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {items.map(it => (
          <Box key={it} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', mt: '7px', flexShrink: 0, backgroundColor: alpha(primary, 0.5) }} />
            <Typography sx={{ fontSize: 13.5, color: 'text.primary', lineHeight: 1.5 }}>{it}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )

  return (
    <PageContainer
      title='FAQ YoYo Admin'
      subtitle='Guide rapide pour comprendre chaque page et les actions disponibles'
    >
      {/* Recherche */}
      <Box
        sx={{
          position: 'relative',
          maxWidth: 460,
          '& input': {
            width: '100%',
            height: 44,
            borderRadius: '6px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'action.hover',
            padding: '0 14px 0 40px',
            fontSize: 14,
            fontFamily: 'inherit',
            color: 'var(--mui-palette-text-primary)'
          }
        }}
      >
        <i className='tabler-search' style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }} />
        <input placeholder='Rechercher une rubrique…' value={query} onChange={e => setQuery(e.target.value)} />
      </Box>

      {/* Grille de cartes (2 par ligne) */}
      {entries.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, py: 8, color: 'text.secondary' }}>
          <i className='tabler-search-off text-4xl' />
          <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucune rubrique</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
          {entries.map(entry => (
            <Box
              key={entry.href}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 3, borderRadius: '6px', backgroundColor: 'background.paper' }}
            >
              {/* En-tête */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary, backgroundColor: alpha(primary, 0.14) }}>
                  <i className={entry.icon} style={{ fontSize: '1.35rem' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{entry.title}</Typography>
                    <Box component='span' sx={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, px: 1, py: 0.25, borderRadius: '6px', color: primary, backgroundColor: alpha(primary, 0.12) }}>
                      {entry.href}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>{entry.objectif}</Typography>
                </Box>
              </Box>

              <Section icon='tabler-bolt' title='Actions principales' items={entry.actions} />
              <Section icon='tabler-bulb' title='Bonnes pratiques' items={entry.conseils} />

              <Box sx={{ mt: 'auto' }}>
                <Button
                  component={Link}
                  href={entry.href}
                  disableElevation
                  sx={{ height: 38, borderRadius: '6px', fontWeight: 500, fontSize: 13, textTransform: 'none', px: 2, color: 'primary.main', backgroundColor: alpha(primary, 0.1), '&:hover': { backgroundColor: alpha(primary, 0.18) } }}
                >
                  Ouvrir {entry.title}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </PageContainer>
  )
}
