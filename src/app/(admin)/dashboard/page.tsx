'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const ResponsivePie = dynamic(() => import('@nivo/pie').then(m => m.ResponsivePie), { ssr: false })
const ResponsiveLine = dynamic(() => import('@nivo/line').then(m => m.ResponsiveLine), { ssr: false })
const ResponsiveBar = dynamic(() => import('@nivo/bar').then(m => m.ResponsiveBar), { ssr: false })
const CivRegionsMap = dynamic(() => import('@/components/charts/CivRegionsMap'), { ssr: false })

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { Users, Store, Receipt, Wallet, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react'

import PageContainer from '@/components/PageContainer'
import { SelectFilter, DateRangeFilter, RefreshButton } from '@/components/ui'
import { usePermissions } from '@/hooks/usePermissions'
import { dashboardService, type DashboardStats, type DashboardAnalytics } from '@/services/dashboard.service'
import { moderationService, type CertificationItem } from '@/services/moderation.service'

/** Mappe le filtre de statut de l'UI vers la valeur de statut de paiement du backend. */
function statusToPayment(status: 'all' | 'successful' | 'pending' | 'failed'): string | undefined {
  if (status === 'successful') return 'success'
  if (status === 'pending') return 'pending'
  if (status === 'failed') return 'failed'

  return undefined
}

/** Mappe le filtre pro de l'UI vers le paramètre de certification du backend. */
function proToCertified(pro: 'all' | 'certified' | 'uncertified'): string | undefined {
  if (pro === 'certified') return 'certified'
  if (pro === 'uncertified') return 'uncertified'

  return undefined
}

/** Formate une clé de période (YYYY-MM-DD ou YYYY-MM) en libellé court d'axe. */
function formatPeriodLabel(period: string): string {
  const parts = period.split('-')

  if (parts.length === 3) return `${parts[2]}/${parts[1]}`
  if (parts.length === 2) {
    const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

    return MONTHS[Math.max(0, Math.min(11, Number(parts[1]) - 1))]
  }

  return period
}

/** Formate une variation en pourcentage (null = pas de base de comparaison). */
function formatTrend(value: number | null | undefined, unit: '%' | 'pts' = '%'): { text: string; up: boolean } {
  if (value === null || value === undefined) return { text: '—', up: true }

  const rounded = Math.round(value * 10) / 10
  const sign = rounded > 0 ? '+' : ''

  return { text: `${sign}${rounded.toString().replace('.', ',')}${unit === '%' ? '%' : ' pts'}`, up: rounded >= 0 }
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value || 0)
}

/** Montant : nombre en taille normale + « FCFA » en exposant, police très réduite. */
const MoneyValue = ({ value }: { value: number }) => (
  <Box component='span' sx={{ whiteSpace: 'nowrap' }}>
    {formatNumber(value)}
    <Box component='sup' sx={{ fontSize: '0.4em', fontWeight: 600, ml: 0.3, verticalAlign: 'super', letterSpacing: '.03em', color: 'text.secondary' }}>
      FCFA
    </Box>
  </Box>
)

function timeAgo(dateStr?: string) {
  if (!dateStr) return ''

  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)

  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)

  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)

  return `il y a ${days} j`
}

const STATUS_META: Record<string, { label: string; kind: 'warning' | 'info' }> = {
  'en-attente': { label: 'En attente', kind: 'warning' },
  'en-cours': { label: 'En cours', kind: 'info' }
}

/* ------------------------------------------------------------------ */
/* Carte KPI                                                          */
/* ------------------------------------------------------------------ */
type KpiCardProps = {
  title: string
  value: React.ReactNode
  subtitle: string
  icon: React.ComponentType<{ size?: number }>
  color?: string
  href: string
}

const KpiCard = ({ title, value, subtitle, icon: Icon, href }: KpiCardProps) => {
  const theme = useTheme()
  const accent = theme.palette.primary.main

  return (
    <Card
      component={Link}
      href={href}
      sx={{
        height: '100%',
        borderRadius: 0,
        textDecoration: 'none',
        border: 'none',
        boxShadow: 'none',
        backgroundColor: 'background.paper'
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, height: '100%', p: 2.5 }}>
        {/* Titre + icône */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>{title}</Typography>
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              backgroundColor: alpha(accent, 0.14)
            }}
          >
            <Icon size={19} />
          </Box>
        </Box>

        {/* Valeur */}
        <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: 'text.primary' }} noWrap>
          {value}
        </Typography>

        {/* Description + flèche */}
        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.5 }}>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.4 }}>{subtitle}</Typography>
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              backgroundColor: accent
            }}
          >
            <ArrowRight size={17} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Conteneur de section (charts)                                      */
/* ------------------------------------------------------------------ */
const SectionCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            backgroundColor: 'var(--mui-palette-primary-lightOpacity)'
          }}
        >
          <i className={`${icon} text-lg`} />
        </Box>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>{title}</Typography>
      </Box>
      {children}
    </CardContent>
  </Card>
)

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const theme = useTheme()
  const router = useRouter()
  const { ready, can } = usePermissions()

  // Garde déterministe : un commercial ne doit jamais voir le dashboard admin.
  const isCommercial = ready && can('create', 'pros') && !can('read', 'dashboard')

  useEffect(() => {
    if (isCommercial) router.replace('/commercial')
  }, [isCommercial, router])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [modRows, setModRows] = useState<CertificationItem[]>([])
  const [tab, setTab] = useState(0)
  const [statusFilter, setStatusFilter] = useState<'all' | 'successful' | 'pending' | 'failed'>('all')
  const [proFilter, setProFilter] = useState<'all' | 'certified' | 'uncertified'>('all')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()

    d.setDate(d.getDate() - 7)

    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const [data, certifs] = await Promise.all([
        dashboardService.getStats({ from: dateFrom, to: dateTo, paymentStatus: statusToPayment(statusFilter) }),
        moderationService
          .listCertifications({ page: 1, pageSize: 20, orderBy: 'desc', sortBy: 'createdAt' })
          .catch(() => ({ rows: [] as CertificationItem[] }))
      ])

      setStats(data)
      setModRows(
        certifs.rows
          .filter(r => {
            const s = (r.verificationStatus || '').toLowerCase()

            return s === 'en-attente' || s === 'en-cours'
          })
          .slice(0, 8)
      )
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const data = await dashboardService.getAnalytics({
        from: dateFrom,
        to: dateTo,
        paymentStatus: statusToPayment(statusFilter),
        certified: proToCertified(proFilter)
      })

      setAnalytics(data)
    } catch {
      // Best-effort : on n'interrompt pas le dashboard si les analyses échouent.
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Chargement initial + rechargement des KPI/donut quand la plage de dates ou le statut change.
  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, statusFilter])

  // Analyses : (re)chargées à l'ouverture de l'onglet et à chaque changement de filtre.
  useEffect(() => {
    if (tab === 1) loadAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, dateFrom, dateTo, statusFilter, proFilter])

  // Réhydrate l'état depuis l'URL au montage
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)

    if (sp.get('tab') === 'analyses') setTab(1)

    const st = sp.get('statut')

    if (st && ['successful', 'pending', 'failed'].includes(st)) setStatusFilter(st as any)

    const pr = sp.get('pro')

    if (pr && ['certified', 'uncertified'].includes(pr)) setProFilter(pr as any)
  }, [])

  // Persiste l'état dans l'URL (sans rechargement)
  useEffect(() => {
    const p = new URLSearchParams()

    p.set('tab', tab === 1 ? 'analyses' : 'vue')
    if (statusFilter !== 'all') p.set('statut', statusFilter)
    if (proFilter !== 'all') p.set('pro', proFilter)
    window.history.replaceState(null, '', `?${p.toString()}`)
  }, [tab, statusFilter, proFilter])

  // Couleurs pour les charts
  const success = theme.palette.success.main
  const warning = theme.palette.warning.main
  const errorColor = theme.palette.error.main
  const info = theme.palette.info.main

  // Loader plein écran uniquement au tout premier chargement (aucune donnée encore).
  // Les rechargements dus aux filtres gardent le contenu affiché (pas d'écran blanc).
  if (loading && !stats) {
    return (
      <PageContainer>
        <Box className='flex items-center justify-center' sx={{ minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer title='Tableau de bord YoYo' subtitle='Pilotage global clients, pros, transactions et modération'>
        <Alert severity='error' className='mb-4'>
          {error}
        </Alert>
        <Button variant='contained' onClick={loadStats}>
          Réessayer
        </Button>
      </PageContainer>
    )
  }

  if (!stats) {
    return (
      <PageContainer title='Tableau de bord YoYo' subtitle='Pilotage global clients, pros, transactions et modération'>
        <Alert severity='info'>Aucune donnée disponible.</Alert>
      </PageContainer>
    )
  }

  const cards: KpiCardProps[] = [
    {
      title: 'Clients',
      value: formatNumber(stats.clients.total),
      subtitle: 'Total des clients inscrits.',
      icon: Users,
      href: '/clients'
    },
    {
      title: 'Professionnels',
      value: formatNumber(stats.pros.total),
      subtitle: 'Marchands actifs sur la plateforme.',
      icon: Store,
      href: '/pros'
    },
    {
      title: 'Transactions',
      value: formatNumber(stats.transactions.total),
      subtitle: 'Opérations enregistrées.',
      icon: Receipt,
      href: '/transactions'
    },
    {
      title: 'Montant encaissé',
      value: <MoneyValue value={stats.transactions.totalAmount} />,
      subtitle: 'Volume total encaissé.',
      icon: Wallet,
      href: '/transactions'
    },
    {
      title: 'Dossiers KYC',
      value: formatNumber(stats.moderation.certificationsTotal),
      subtitle: 'Certifications à traiter.',
      icon: ShieldCheck,
      href: '/moderation'
    },
    {
      title: 'Questions secrètes',
      value: formatNumber(stats.moderation.questionsTotal),
      subtitle: 'Questions de sécurité définies.',
      icon: HelpCircle,
      href: '/moderation'
    }
  ]

  const t = stats.transactions
  const successRate = t.total > 0 ? (t.successful / t.total) * 100 : 0

  /* ---- Données analytiques réelles (onglet Analyses), pilotées par les filtres ---- */
  // Repli sur les stats globales tant que l'analyse n'est pas encore chargée.
  const aTx = analytics?.transactions ?? { ...t, trends: t.trends ?? null }
  const aSuccessRate = aTx.total > 0 ? (aTx.successful / aTx.total) * 100 : 0

  // Série temporelle (succès / échecs) issue du backend.
  const series = analytics?.timeseries.series ?? []
  const lineData = [
    {
      id: 'Succès',
      color: success,
      data: series.map(pt => ({ x: formatPeriodLabel(pt.period), y: pt.successful }))
    },
    {
      id: 'Échecs',
      color: errorColor,
      data: series.map(pt => ({ x: formatPeriodLabel(pt.period), y: pt.failed }))
    }
  ]

  // Top professionnels par volume de paiements réussis.
  const topPros = (analytics?.topPartners ?? []).map(p => ({ name: p.name, value: p.volume }))

  const volumeTrend = formatTrend(aTx.trends?.totalTransactions)
  const amountTrend = formatTrend(aTx.trends?.totalAmount)
  const successTrend = formatTrend(aTx.trends?.successRate ?? null, 'pts')
  const prosTrend = formatTrend(analytics?.pros.trend ?? null)

  const kpis = [
    { label: 'Volume transactions', value: formatNumber(aTx.total), trend: volumeTrend.text, up: volumeTrend.up },
    { label: 'Montant encaissé', value: <MoneyValue value={aTx.totalAmount} />, trend: amountTrend.text, up: amountTrend.up },
    { label: 'Taux de succès', value: `${Math.round(aSuccessRate)}%`, trend: successTrend.text, up: successTrend.up },
    {
      label: 'Nouveaux pros',
      value: formatNumber(analytics?.pros.newInPeriod ?? analytics?.pros.total ?? stats.pros.total),
      trend: prosTrend.text,
      up: prosTrend.up
    }
  ]

  // Valeurs par défaut (pour détecter un filtre actif + réinitialiser)
  const defTo = new Date().toISOString().slice(0, 10)
  const defFrom = (() => {
    const d = new Date()

    d.setDate(d.getDate() - 7)

    return d.toISOString().slice(0, 10)
  })()

  const isFiltered = statusFilter !== 'all' || proFilter !== 'all' || dateFrom !== defFrom || dateTo !== defTo

  const resetFilters = () => {
    setStatusFilter('all')
    setProFilter('all')
    setDateFrom(defFrom)
    setDateTo(defTo)
  }

  const dateFilter = (
    <DateRangeFilter from={dateFrom} to={dateTo} onFrom={setDateFrom} onTo={setDateTo} />
  )

  // Un commercial est redirigé (effet ci-dessus) : on n'affiche rien en attendant.
  if (isCommercial) return null

  return (
    <PageContainer
      centerContent={false}
      title='Tableau de bord YoYo'
      subtitle='Pilotage global clients, pros, transactions et modération'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', md: 'auto' } }}>
          {/* Onglets */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              height: 40,
              p: 0.5,
              borderRadius: 0,
              backgroundColor: 'action.hover'
            }}
          >
            {['Vue d’ensemble', 'Analyses'].map((label, i) => (
              <Box
                key={label}
                role='button'
                onClick={() => setTab(i)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  px: 2,
                  borderRadius: 0,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all .15s',
                  color: tab === i ? 'primary.main' : 'text.secondary',
                  backgroundColor: tab === i ? 'background.paper' : 'transparent',
                  boxShadow: tab === i ? 'var(--mui-customShadows-xs)' : 'none'
                }}
              >
                {label}
              </Box>
            ))}
          </Box>

          {/* Filtre de dates : dans le header uniquement sur l'onglet Vue.
              Mobile : passe sur sa propre ligne (order 3) ; desktop : entre les onglets et Actualiser (order 2). */}
          {tab === 0 && (
            <Box sx={{ order: { xs: 3, md: 2 }, width: { xs: '100%', md: 'auto' } }}>{dateFilter}</Box>
          )}

          {/* Bouton actualiser : reste sur la même ligne que les onglets en mobile (order 2). */}
          <Box sx={{ order: { xs: 2, md: 3 }, ml: { xs: 'auto', md: 0 } }}>
            <RefreshButton onClick={loadStats} spinning={loading} pushRight={false} />
          </Box>
        </Box>
      }
    >
      {/* ---------------------------------------------------------------- */}
      {/* Onglet 1 : Vue d'ensemble                                        */}
      {/* ---------------------------------------------------------------- */}
      {tab === 0 && (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: 3
            }}
          >
            {cards.map(card => (
              <KpiCard key={card.title} {...card} />
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.6fr' }, gap: 3, alignItems: 'stretch' }}>
            {/* État des paiements */}
            <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', height: 380 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>
                    État des paiements
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.secondary' }}>
                    {formatNumber(t.total)} au total
                  </Typography>
                </Box>

                {/* Donut (style nivo) */}
                <Box sx={{ flex: 1, width: '100%', minHeight: 0 }}>
                  <ResponsivePie
                    data={[
                      { id: 'Succès', label: 'Succès', value: t.successful, color: success },
                      { id: 'En attente', label: 'En attente', value: t.pending, color: warning },
                      { id: 'Échec', label: 'Échec', value: t.failed, color: errorColor }
                    ] as any}
                    colors={{ datum: 'data.color' }}
                    margin={{ top: 16, right: 20, bottom: 56, left: 20 }}
                    innerRadius={0.5}
                    padAngle={0.6}
                    cornerRadius={2}
                    activeOuterRadiusOffset={8}
                    borderWidth={0}
                    enableArcLinkLabels={false}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        translateY: 52,
                        itemWidth: 88,
                        itemHeight: 18,
                        itemsSpacing: 2,
                        symbolShape: 'circle',
                        symbolSize: 10,
                        itemTextColor: theme.palette.text.secondary
                      }
                    ]}
                    theme={{
                      text: { fill: theme.palette.text.secondary, fontWeight: 700 },
                      tooltip: { container: { fontSize: 12, fontWeight: 700 } }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* File de modération */}
            <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', height: 380 }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%', p: 3 }}>
                {/* Header : titre + bouton */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary' }}>
                    File de modération
                  </Typography>
                  <Button
                    component={Link}
                    href='/moderation'
                    disableElevation
                    size='small'
                    sx={{
                      height: 34,
                      borderRadius: 0,
                      fontWeight: 700,
                      fontSize: 12.5,
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      color: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) }
                    }}
                  >
                    Ouvrir
                  </Button>
                </Box>

                {/* Corps : liste réelle des dossiers à modérer */}
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  {modRows.length === 0 ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        color: 'text.secondary'
                      }}
                    >
                      <svg
                        width={40}
                        height={40}
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth={2}
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <path d='m17 17 5 5' />
                        <path d='M19.323 13.744A9 3 0 0 0 21 12' />
                        <path d='M21 13.127V5' />
                        <path d='m22 17-5 5' />
                        <path d='M3 12A9 3 0 0 0 13.563 14.954' />
                        <path d='M3 5V19A9 3 0 0 0 13 21.981' />
                        <ellipse cx='12' cy='5' rx='9' ry='3' />
                      </svg>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucun dossier à relire</Typography>
                    </Box>
                  ) : (
                    modRows.map((item, i, arr) => {
                      const meta = STATUS_META[(item.verificationStatus || '').toLowerCase()] || {
                        label: item.verificationStatus || '—',
                        kind: 'info' as const
                      }
                      const color = meta.kind === 'warning' ? warning : info
                      const name =
                        [item.user?.firstname, item.user?.lastname].filter(Boolean).join(' ') ||
                        item.user?.email ||
                        'Utilisateur'
                      const type = item.documentType || 'Certification'

                      return (
                        <Box
                          key={item._id || i}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            py: 1.5,
                            borderBottom: i < arr.length - 1 ? '1px dashed' : 'none',
                            borderColor: alpha(theme.palette.text.primary, 0.28)
                          }}
                        >
                          {/* Icône type */}
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              flexShrink: 0,
                              borderRadius: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color,
                              backgroundColor: alpha(color, 0.14)
                            }}
                          >
                            <i className='tabler-shield-check text-xl' />
                          </Box>

                          {/* Nom + type */}
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>
                              {name}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
                              {type}
                            </Typography>
                          </Box>

                          {/* Statut + délai */}
                          <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 0,
                                backgroundColor: alpha(color, 0.14)
                              }}
                            >
                              <Box sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color }} />
                              <Typography sx={{ fontSize: 11.5, fontWeight: 800, color }}>{meta.label}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                              {timeAgo(item.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Onglet 2 : Analyses                                              */}
      {/* ---------------------------------------------------------------- */}
      {tab === 1 && (
        <>
          {/* Barre de filtres avancés */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            {/* Statut */}
            <SelectFilter
              value={statusFilter}
              onChange={v => setStatusFilter(v as typeof statusFilter)}
              options={[
                { value: 'all', label: 'Statut : tous' },
                { value: 'successful', label: 'Succès' },
                { value: 'pending', label: 'En attente' },
                { value: 'failed', label: 'Échec' }
              ]}
            />

            {/* Pro */}
            <SelectFilter
              value={proFilter}
              onChange={v => setProFilter(v as typeof proFilter)}
              options={[
                { value: 'all', label: 'Pro : tous' },
                { value: 'certified', label: 'Certifiés' },
                { value: 'uncertified', label: 'Non certifiés' }
              ]}
            />

            {/* Filtre date (à gauche avec les autres) */}
            {dateFilter}

            {/* Réinitialiser (si un filtre est actif) */}
            {isFiltered && (
              <Button
                onClick={resetFilters}
                disableElevation
                sx={{
                  height: 40,
                  borderRadius: 0,
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 2,
                  color: 'text.secondary',
                  backgroundColor: 'action.hover',
                  '&:hover': { backgroundColor: 'action.selected' }
                }}
              >
                Réinitialiser
              </Button>
            )}
          </Box>

          {/* Rangée KPI + tendances */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3
            }}
          >
            {kpis.map(k => (
              <Card key={k.label} sx={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary' }} noWrap>
                    {k.label}
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: 'text.primary', mt: 0.5 }} noWrap>
                    {k.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                    <i
                      className={k.up ? 'tabler-trending-up' : 'tabler-trending-down'}
                      style={{ fontSize: 16, color: k.up ? success : errorColor }}
                    />
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: k.up ? success : errorColor }}>
                      {k.trend}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>vs préc.</Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Évolution des transactions (ligne) */}
          <SectionCard title='Évolution des transactions' icon='tabler-chart-line'>
            <Box sx={{ height: 320 }}>
              <ResponsiveLine
                data={lineData as any}
                colors={{ datum: 'color' }}
                margin={{ top: 20, right: 24, bottom: 40, left: 44 }}
                yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
                curve='monotoneX'
                axisBottom={{ tickSize: 0, tickPadding: 10 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enableGridX={false}
                gridYValues={4}
                pointSize={7}
                pointColor={{ from: 'seriesColor' }}
                pointBorderWidth={2}
                pointBorderColor={{ theme: 'background' }}
                enableArea
                areaOpacity={0.08}
                useMesh
                theme={{
                  text: { fill: theme.palette.text.secondary, fontWeight: 700 },
                  grid: { line: { stroke: theme.palette.divider, strokeDasharray: '4 4' } },
                  tooltip: { container: { fontSize: 12, fontWeight: 700 } }
                }}
                legends={[
                  {
                    anchor: 'top-right',
                    direction: 'row',
                    translateY: -20,
                    itemWidth: 80,
                    itemHeight: 18,
                    symbolShape: 'circle',
                    symbolSize: 10,
                    itemTextColor: theme.palette.text.secondary
                  }
                ]}
              />
            </Box>
          </SectionCard>

          {/* Donut + Top pros */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 3 }}>
            <SectionCard title='Répartition des paiements' icon='tabler-chart-donut-3'>
              <Box sx={{ height: 300 }}>
                <ResponsivePie
                  data={[
                    { id: 'Succès', label: 'Succès', value: aTx.successful, color: success },
                    { id: 'En attente', label: 'En attente', value: aTx.pending, color: warning },
                    { id: 'Échec', label: 'Échec', value: aTx.failed, color: errorColor }
                  ] as any}
                  colors={{ datum: 'data.color' }}
                  margin={{ top: 20, right: 20, bottom: 60, left: 20 }}
                  innerRadius={0.5}
                  padAngle={0.6}
                  cornerRadius={2}
                  activeOuterRadiusOffset={8}
                  borderWidth={0}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 50,
                      itemWidth: 82,
                      itemHeight: 18,
                      symbolShape: 'circle',
                      symbolSize: 10,
                      itemTextColor: theme.palette.text.secondary
                    }
                  ]}
                  theme={{ text: { fill: theme.palette.text.secondary, fontWeight: 700 } }}
                />
              </Box>
            </SectionCard>

            <SectionCard title='Top professionnels (volume)' icon='tabler-building-store'>
              <Box sx={{ height: 300 }}>
                <ResponsiveBar
                  data={[...topPros].reverse().map(p => ({ pro: p.name, volume: p.value }))}
                  keys={['volume']}
                  indexBy='pro'
                  layout='horizontal'
                  margin={{ top: 10, right: 24, bottom: 30, left: 110 }}
                  padding={0.35}
                  colors={theme.palette.primary.main}
                  borderRadius={4}
                  enableGridX
                  enableGridY={false}
                  gridXValues={4}
                  axisBottom={{ tickSize: 0, tickPadding: 8 }}
                  axisLeft={{ tickSize: 0, tickPadding: 10 }}
                  labelSkipWidth={16}
                  labelTextColor={theme.palette.background.paper}
                  theme={{
                    text: { fill: theme.palette.text.secondary, fontWeight: 700 },
                    grid: { line: { stroke: theme.palette.divider, strokeDasharray: '4 4' } },
                    tooltip: { container: { fontSize: 12, fontWeight: 700 } }
                  }}
                />
              </Box>
            </SectionCard>
          </Box>

          {/* Carte : répartition géographique (Côte d'Ivoire) */}
          <SectionCard title='Répartition par ville (Côte d’Ivoire)' icon='tabler-map-2'>
            <Box sx={{ height: 420, borderRadius: 0, overflow: 'hidden' }}>
              <CivRegionsMap points={analytics?.geo ?? []} />
            </Box>
          </SectionCard>
        </>
      )}
    </PageContainer>
  )
}
