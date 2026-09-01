'use client'

import { useEffect, useMemo, useState } from 'react'

import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'

import { toast } from 'react-toastify'
import { ShieldX } from 'lucide-react'

import PageContainer from '@/components/PageContainer'
import { StatusPill, StatCard, RowActions, SearchInput, SelectFilter, DateRangeFilter, ResetButton, type UiPalette } from '@/components/ui'
import { moderationService, type CertificationItem, type SecretQuestion } from '@/services/moderation.service'

const questionStatusOptions: Array<SecretQuestion['status']> = ['active', 'inactive', 'draft', 'removed']

type Palette = 'success' | 'warning' | 'error' | 'info' | 'secondary'

const kycMeta: Record<string, { label: string; palette: Palette }> = {
  'en-attente': { label: 'En attente', palette: 'warning' },
  'en-cours': { label: 'En cours', palette: 'info' },
  verifie: { label: 'Validé', palette: 'success' },
  rejete: { label: 'Rejeté', palette: 'error' }
}

const questionMeta: Record<string, { label: string; palette: Palette }> = {
  active: { label: 'Active', palette: 'success' },
  inactive: { label: 'Inactive', palette: 'secondary' },
  draft: { label: 'Brouillon', palette: 'warning' },
  removed: { label: 'Retirée', palette: 'error' }
}

function formatDate(value?: string) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function userLabel(user?: CertificationItem['user']) {
  if (!user) return '-'

  const name = `${user.firstname || ''} ${user.lastname || ''}`.trim()

  return name || user.email || user.contact || '-'
}

function userEmail(user?: CertificationItem['user']) {
  if (!user) return ''

  return user.email || user.contact || ''
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

const FILE_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/${process.env.NEXT_PUBLIC_API_VERSION || 'v1'}${process.env.NEXT_PUBLIC_API_PATH || ''}/file`

function fileUrl(name?: string) {
  if (!name) return ''

  if (/^https?:\/\//i.test(name)) return name

  return `${FILE_BASE}/${name.replace(/^\/+/, '')}`
}

function isImageFile(name?: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name || '')
}

export default function ModerationPage() {
  const theme = useTheme()
  // Sur mobile/tablette (< lg), le détail KYC s'ouvre dans un drawer au lieu de s'afficher sous le tableau.
  const isDownLg = useMediaQuery(theme.breakpoints.down('lg'))
  const [tab, setTab] = useState<'documents' | 'questions'>('documents')

  const [documents, setDocuments] = useState<CertificationItem[]>([])
  const [documentsTotal, setDocumentsTotal] = useState(0)
  const [documentsPage, setDocumentsPage] = useState(0)
  const [documentsRowsPerPage, setDocumentsRowsPerPage] = useState(10)
  const [documentsQuery, setDocumentsQuery] = useState('')
  const [documentsLoading, setDocumentsLoading] = useState(true)

  const [questions, setQuestions] = useState<SecretQuestion[]>([])
  const [questionsTotal, setQuestionsTotal] = useState(0)
  const [questionsPage, setQuestionsPage] = useState(0)
  const [questionsRowsPerPage, setQuestionsRowsPerPage] = useState(10)
  const [questionsQuery, setQuestionsQuery] = useState('')
  const [questionsStatus, setQuestionsStatus] = useState('')
  const [questionsLoading, setQuestionsLoading] = useState(true)

  const [docFrom, setDocFrom] = useState('')
  const [docTo, setDocTo] = useState('')
  const [qFrom, setQFrom] = useState('')
  const [qTo, setQTo] = useState('')

  const [globalError, setGlobalError] = useState<string | null>(null)
  const [selectedDoc, setSelectedDoc] = useState<CertificationItem | null>(null)

  const [rejectionReasons, setRejectionReasons] = useState<Array<{ slug: string; title: string; description?: string }>>([])
  const [rejectTarget, setRejectTarget] = useState<CertificationItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')

  const documentParams = useMemo(
    () => ({
      page: documentsPage + 1,
      pageSize: documentsRowsPerPage,
      q: documentsQuery || undefined,
      from: docFrom || undefined,
      to: docTo || undefined,
      sortBy: 'createdAt',
      orderBy: 'desc'
    }),
    [documentsPage, documentsRowsPerPage, documentsQuery, docFrom, docTo]
  )

  const questionParams = useMemo(
    () => ({
      page: questionsPage + 1,
      pageSize: questionsRowsPerPage,
      q: questionsQuery || undefined,
      status: questionsStatus || undefined,
      from: qFrom || undefined,
      to: qTo || undefined,
      sortBy: 'createdAt',
      orderBy: 'desc'
    }),
    [questionsPage, questionsRowsPerPage, questionsQuery, questionsStatus, qFrom, qTo]
  )

  const loadDocuments = async () => {
    try {
      setDocumentsLoading(true)
      setGlobalError(null)

      const response = await moderationService.listCertifications(documentParams)

      setDocuments(response.rows)
      setDocumentsTotal(response.meta.totalRows)
    } catch (err: any) {
      setGlobalError(err.message || 'Impossible de charger les dossiers KYC')
    } finally {
      setDocumentsLoading(false)
    }
  }

  const loadQuestions = async () => {
    try {
      setQuestionsLoading(true)
      setGlobalError(null)

      const response = await moderationService.listQuestions(questionParams)

      setQuestions(response.rows)
      setQuestionsTotal(response.meta.totalRows)
    } catch (err: any) {
      setGlobalError(err.message || 'Impossible de charger les questions secrètes')
    } finally {
      setQuestionsLoading(false)
    }
  }

  useEffect(() => {
    moderationService
      .getRejectionReasons()
      .then(data => setRejectionReasons(data))
      .catch(() => setRejectionReasons([]))
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [documentParams])

  useEffect(() => {
    loadQuestions()
  }, [questionParams])

  const updateDocumentStatus = async (
    item: CertificationItem,
    verificationStatus: string,
    payload?: { rejectionReason?: string; reviewNotes?: string }
  ) => {
    try {
      await moderationService.updateCertification({
        _id: item._id,
        verificationStatus,
        rejectionReason: payload?.rejectionReason,
        reviewNotes: payload?.reviewNotes
      })

      toast.success('Statut du dossier mis à jour')
      setSelectedDoc(prev => (prev && prev._id === item._id ? { ...prev, verificationStatus } : prev))
      await loadDocuments()
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour du dossier')
    }
  }

  const submitRejection = async () => {
    if (!rejectTarget || !rejectReason) return

    await updateDocumentStatus(rejectTarget, 'rejete', {
      rejectionReason: rejectReason,
      reviewNotes: rejectNotes || undefined
    })

    setRejectTarget(null)
    setRejectReason('')
    setRejectNotes('')
  }

  const updateQuestionStatus = async (item: SecretQuestion, nextStatus: SecretQuestion['status']) => {
    if (!nextStatus) return

    try {
      await moderationService.updateQuestion({ ...item, status: nextStatus })
      toast.success('Question mise à jour')
      await loadQuestions()
    } catch (err: any) {
      toast.error(err.message || 'Impossible de mettre à jour la question')
    }
  }

  const softBtn = {
    height: 40,
    borderRadius: '6px',
    fontWeight: 700,
    textTransform: 'none' as const,
    px: 2,
    color: 'primary.main',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.18) }
  }


  const Pill = StatusPill

  const kycOf = (s?: string) => kycMeta[(s || 'en-attente').toLowerCase()] || { label: s || 'En attente', palette: 'secondary' as Palette }

  const docStats = [
    { label: 'Total', value: documentsTotal, caption: 'Dossiers KYC', icon: 'tabler-file-description', palette: 'primary' as const },
    { label: 'En attente', value: documents.filter(d => ['en-attente', ''].includes((d.verificationStatus || '').toLowerCase())).length, caption: 'À traiter', icon: 'tabler-clock', palette: 'warning' as const },
    { label: 'En cours', value: documents.filter(d => (d.verificationStatus || '').toLowerCase() === 'en-cours').length, caption: 'En revue', icon: 'tabler-loader', palette: 'info' as const },
    { label: 'Validés', value: documents.filter(d => (d.verificationStatus || '').toLowerCase() === 'verifie').length, caption: 'Certifiés', icon: 'tabler-shield-check', palette: 'success' as const }
  ]

  const questionStats = [
    { label: 'Total', value: questionsTotal, caption: 'Questions', icon: 'tabler-help-hexagon', palette: 'primary' as const },
    { label: 'Actives', value: questions.filter(q => q.status === 'active').length, caption: 'En service', icon: 'tabler-circle-check', palette: 'success' as const },
    { label: 'Inactives', value: questions.filter(q => q.status === 'inactive').length, caption: 'Désactivées', icon: 'tabler-circle-off', palette: 'secondary' as const },
    { label: 'Brouillons', value: questions.filter(q => q.status === 'draft').length, caption: 'En préparation', icon: 'tabler-pencil', palette: 'warning' as const }
  ]

  const statCard = (s: { label: string; value: number; caption: string; icon: string; palette: UiPalette }) => (
    <StatCard key={s.label} label={s.label} value={s.value} caption={s.caption} icon={s.icon} palette={s.palette} />
  )

  const searchBox = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <SearchInput value={value} onChange={onChange} placeholder={placeholder} />
  )

  const dateBox = (from: string, to: string, onFrom: (v: string) => void, onTo: (v: string) => void) => (
    <DateRangeFilter from={from} to={to} onFrom={onFrom} onTo={onTo} />
  )

  return (
    <PageContainer
      title='Modération YoYo'
      subtitle='Validation KYC des clients et contrôle des questions secrètes'
      actions={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: 40, p: 0.5, borderRadius: '6px', backgroundColor: 'action.hover' }}>
            {([
              { k: 'documents', label: 'Dossiers KYC' },
              { k: 'questions', label: 'Questions secrètes' }
            ] as const).map(t => (
              <Box
                key={t.k}
                role='button'
                onClick={() => setTab(t.k)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  px: 2,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all .15s',
                  color: tab === t.k ? 'primary.main' : 'text.secondary',
                  backgroundColor: tab === t.k ? 'background.paper' : 'transparent',
                  boxShadow: tab === t.k ? 'var(--mui-customShadows-xs)' : 'none'
                }}
              >
                {t.label}
              </Box>
            ))}
          </Box>
          <Button onClick={() => (tab === 'documents' ? loadDocuments() : loadQuestions())} disableElevation sx={{ ...softBtn, ml: { xs: 'auto', md: 0 }, minWidth: { xs: 40, md: 'auto' }, px: { xs: 0, md: 2 }, '& .MuiButton-startIcon': { marginInlineEnd: { xs: 0, md: 1 } } }}>
            <Box component='span' sx={{ display: { xs: 'none', md: 'inline' } }}>Actualiser</Box>
          </Button>
        </Box>
      }
    >
      {globalError ? <Alert severity='error'>{globalError}</Alert> : null}

      {/* ------------------------------- Dossiers KYC ------------------------------- */}
      {tab === 'documents' && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {docStats.map(statCard)}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: selectedDoc ? 'minmax(0, 1fr) 400px' : '1fr' }, gap: 3, alignItems: 'start' }}>
          <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                {searchBox(documentsQuery, v => { setDocumentsPage(0); setDocumentsQuery(v) }, 'Rechercher (client, type)')}
                {dateBox(docFrom, docTo, v => { setDocumentsPage(0); setDocFrom(v) }, v => { setDocumentsPage(0); setDocTo(v) })}
                {(documentsQuery || docFrom || docTo) && (
                  <ResetButton onClick={() => { setDocumentsPage(0); setDocumentsQuery(''); setDocFrom(''); setDocTo('') }} />
                )}
              </Box>

              {documentsLoading ? (
                <Box className='flex items-center justify-center py-16'>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table stickyHeader size='small' sx={{ minWidth: 0, '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider', paddingInline: '12px' }, '& td:last-of-type, & th:last-of-type': { borderRight: 'none' }, '& thead th': { backgroundColor: 'background.paper' } }}>
                      <TableHead>
                        <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
                          <TableCell>Client</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Fichiers</TableCell>
                          <TableCell>Statut KYC</TableCell>
                          <TableCell>Date</TableCell>
                          {(!selectedDoc || isDownLg) && <TableCell align='right'>Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {documents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={selectedDoc ? 5 : 6} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <i className='tabler-file-description text-4xl' />
                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucun dossier KYC</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          documents.map(item => {
                            const name = userLabel(item.user)
                            const email = userEmail(item.user)
                            const meta = kycOf(item.verificationStatus)

                            return (
                              <TableRow
                                key={item._id}
                                hover
                                onClick={() => setSelectedDoc(item)}
                                selected={selectedDoc?._id === item._id}
                                sx={{
                                  cursor: 'pointer',
                                  '& td': { borderColor: 'divider' },
                                  ...(selectedDoc?._id === item._id && { backgroundColor: alpha(theme.palette.primary.main, 0.08) })
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar sx={{ width: 36, height: 36, fontSize: 12.5, fontWeight: 800, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12) }}>
                                      {initials(name)}
                                    </Avatar>
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary' }} noWrap>{name}</Typography>
                                      {email && <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>{email}</Typography>}
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ fontSize: 13, color: 'text.primary' }}>{item.documentType || '-'}</TableCell>
                                <TableCell>
                                  <Pill label={`${item.documentFile?.length || 0} fichier(s)`} palette='secondary' />
                                </TableCell>
                                <TableCell>
                                  <Pill label={meta.label} palette={meta.palette} />
                                </TableCell>
                                <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</TableCell>
                                {(!selectedDoc || isDownLg) && (
                                  <TableCell align='right' sx={{ whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                                    <RowActions
                                      actions={[
                                        { label: 'Voir', color: 'info', onClick: () => setSelectedDoc(item) },
                                        { label: 'Valider', color: 'success', onClick: () => updateDocumentStatus(item, 'verifie') },
                                        { label: 'En cours', color: 'info', onClick: () => updateDocumentStatus(item, 'en-cours') },
                                        { label: 'Rejeter', color: 'error', onClick: () => { setRejectTarget(item); setRejectReason(rejectionReasons[0]?.slug || ''); setRejectNotes('') } }
                                      ]}
                                    />
                                  </TableCell>
                                )}
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component='div'
                    count={documentsTotal}
                    page={documentsPage}
                    onPageChange={(_event, nextPage) => setDocumentsPage(nextPage)}
                    rowsPerPage={documentsRowsPerPage}
                    onRowsPerPageChange={event => { setDocumentsPage(0); setDocumentsRowsPerPage(Number(event.target.value)) }}
                    rowsPerPageOptions={[10, 25, 50]}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {selectedDoc && (() => {
            const panel = (
            <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden', position: { lg: 'sticky' }, top: { lg: 16 } }}>
              {/* Bandeau coloré + avatar débordant */}
              <Box sx={{ position: 'relative' }}>
                <Box sx={{ height: 48, backgroundColor: 'primary.main' }} />
                <IconButton size='small' onClick={() => setSelectedDoc(null)} sx={{ position: 'absolute', top: 6, right: 6, color: 'common.white', '&:hover': { backgroundColor: alpha('#fff', 0.18) } }}>
                  <i className='tabler-x' />
                </IconButton>
                <Box sx={{ px: 2.5, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Avatar sx={{ width: 56, height: 56, mt: '-28px', fontSize: 18, fontWeight: 800, color: 'primary.main', backgroundColor: 'background.paper', border: '3px solid', borderColor: 'background.paper', boxShadow: `0 0 0 1px ${theme.palette.divider}` }}>
                    {initials(userLabel(selectedDoc.user))}
                  </Avatar>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: 'text.primary', mt: 1, lineHeight: 1.2 }}>
                    {userLabel(selectedDoc.user)}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }} noWrap>
                    {userEmail(selectedDoc.user) || '-'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mt: 1.25, flexWrap: 'wrap' }}>
                    <Pill label={kycOf(selectedDoc.verificationStatus).label} palette={kycOf(selectedDoc.verificationStatus).palette} />
                    <RowActions
                      actions={[
                        { label: 'Valider', color: 'success', onClick: () => updateDocumentStatus(selectedDoc, 'verifie') },
                        { label: 'En cours', color: 'info', onClick: () => updateDocumentStatus(selectedDoc, 'en-cours') },
                        { label: 'Rejeter', color: 'error', onClick: () => { setRejectTarget(selectedDoc); setRejectReason(rejectionReasons[0]?.slug || ''); setRejectNotes('') } }
                      ]}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Rangée de stats */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ px: 2.5, py: 1.5, borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{selectedDoc.documentFile?.length || 0}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Fichiers</Typography>
                </Box>
                <Box sx={{ px: 2.5, py: 1.5 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }} noWrap>{selectedDoc.documentType || '-'}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Type de document</Typography>
                </Box>
              </Box>

              {/* Corps */}
              <Box sx={{ px: 2.5, py: 2, maxHeight: { lg: 400 }, overflowY: 'auto' }}>
                {/* Fichiers */}
                <Typography sx={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'text.secondary', mb: 1.25 }}>
                  Aperçu des fichiers
                </Typography>
                {selectedDoc.documentFile && selectedDoc.documentFile.length > 0 ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2.5 }}>
                    {selectedDoc.documentFile.map((f, i) => {
                      const url = fileUrl(f)

                      return (
                        <Box
                          key={i}
                          onClick={() => window.open(url, '_blank', 'noopener')}
                          sx={{ cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover', transition: 'border-color .15s', '&:hover': { borderColor: 'primary.main' } }}
                        >
                          {isImageFile(f) ? (
                            <Box component='img' src={url} alt={f} sx={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <Box sx={{ height: 72, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.25, color: 'text.secondary' }}>
                              <i className='tabler-file-text text-xl' />
                              <Typography sx={{ fontSize: 10, fontWeight: 700 }}>Ouvrir</Typography>
                            </Box>
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2.5 }}>Aucun fichier joint.</Typography>
                )}

                {/* Infos */}
                <Typography sx={{ fontSize: 11, letterSpacing: '.04em', textTransform: 'uppercase', color: 'text.secondary', mt: 2.5, mb: 1.25 }}>Informations</Typography>
                {[
                  { k: 'Statut', v: kycOf(selectedDoc.verificationStatus).label },
                  { k: 'Date', v: formatDate(selectedDoc.createdAt) },
                  { k: 'Motif rejet', v: selectedDoc.rejectionReason || '—' },
                  { k: 'Revu par', v: selectedDoc.reviewedBy ? userLabel(selectedDoc.reviewedBy) : '—' }
                ].map(row => (
                  <Box key={row.k} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 0.85 }}>
                    <Typography sx={{ fontSize: 12.5, color: 'text.secondary', flexShrink: 0 }}>{row.k}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', textAlign: 'right' }}>{row.v}</Typography>
                  </Box>
                ))}

                {selectedDoc.reviewNotes && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'action.hover' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>Notes de révision</Typography>
                    <Typography sx={{ fontSize: 13, color: 'text.primary', lineHeight: 1.6 }}>{selectedDoc.reviewNotes}</Typography>
                  </Box>
                )}
              </Box>
            </Card>
            )

            return isDownLg ? (
              <Drawer anchor='bottom' open onClose={() => setSelectedDoc(null)} slotProps={{ paper: { sx: { maxHeight: '92vh', borderRadius: 0 } } }}>
                {panel}
              </Drawer>
            ) : panel
          })()}
          </Box>
        </>
      )}

      {/* ------------------------------- Questions ------------------------------- */}
      {tab === 'questions' && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {questionStats.map(statCard)}
          </Box>

          <Card sx={{ borderRadius: 0, border: 'none', boxShadow: 'none', overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                {searchBox(questionsQuery, v => { setQuestionsPage(0); setQuestionsQuery(v) }, 'Rechercher (texte, catégorie)')}
                <SelectFilter
                  value={questionsStatus}
                  onChange={v => { setQuestionsPage(0); setQuestionsStatus(v) }}
                  options={[
                    { value: '', label: 'Statut : tous' },
                    ...questionStatusOptions.map(option => ({ value: option as string, label: questionMeta[option as string]?.label || (option as string) }))
                  ]}
                />
                {dateBox(qFrom, qTo, v => { setQuestionsPage(0); setQFrom(v) }, v => { setQuestionsPage(0); setQTo(v) })}
                {(questionsQuery || questionsStatus || qFrom || qTo) && (
                  <ResetButton onClick={() => { setQuestionsPage(0); setQuestionsQuery(''); setQuestionsStatus(''); setQFrom(''); setQTo('') }} />
                )}
              </Box>

              {questionsLoading ? (
                <Box className='flex items-center justify-center py-16'>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table stickyHeader size='small' sx={{ minWidth: 0, '& td, & th': { borderRight: '1px solid', borderRightColor: 'divider', paddingInline: '12px' }, '& td:last-of-type, & th:last-of-type': { borderRight: 'none' }, '& thead th': { backgroundColor: 'background.paper' } }}>
                      <TableHead>
                        <TableRow sx={{ '& th': { fontSize: 12, fontWeight: 800, color: 'text.secondary', borderColor: 'divider' } }}>
                          <TableCell>Question</TableCell>
                          <TableCell>Catégorie</TableCell>
                          <TableCell>Langue</TableCell>
                          <TableCell>Perso.</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {questions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align='center' sx={{ py: 8, borderColor: 'divider' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <i className='tabler-help-hexagon text-4xl' />
                                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aucune question</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ) : (
                          questions.map(item => (
                            <TableRow key={item._id} hover sx={{ '& td': { borderColor: 'divider' } }}>
                              <TableCell sx={{ maxWidth: 280 }}>
                                <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {item.questionText}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'text.primary' }}>{item.category || '-'}</TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'text.secondary', textTransform: 'uppercase' }}>{item.languageCode || '-'}</TableCell>
                              <TableCell>
                                <Pill label={item.isCustomizable ? 'Oui' : 'Non'} palette={item.isCustomizable ? 'success' : 'secondary'} />
                              </TableCell>
                              <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</TableCell>
                              <TableCell>
                                <Box
                                  component='select'
                                  value={item.status || 'active'}
                                  onChange={(e: any) => updateQuestionStatus(item, e.target.value as SecretQuestion['status'])}
                                  sx={{ height: 34, width: 130, px: 1, borderRadius: '6px', border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', color: 'var(--mui-palette-text-primary)', cursor: 'pointer', outline: 'none' }}
                                >
                                  {questionStatusOptions.map(option => (
                                    <option key={option} value={option}>{questionMeta[option as string]?.label || option}</option>
                                  ))}
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component='div'
                    count={questionsTotal}
                    page={questionsPage}
                    onPageChange={(_event, nextPage) => setQuestionsPage(nextPage)}
                    rowsPerPage={questionsRowsPerPage}
                    onRowsPerPageChange={event => { setQuestionsPage(0); setQuestionsRowsPerPage(Number(event.target.value)) }}
                    rowsPerPageOptions={[10, 25, 50]}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ------------------------------- Modal rejet ------------------------------- */}
      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} fullWidth maxWidth='sm' PaperProps={{ sx: { borderRadius: 0, boxShadow: 'none' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 3, pb: 2 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.14) }}>
            <ShieldX size={22} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Rejeter le dossier KYC</Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }} noWrap>
              {rejectTarget?.documentType || 'Dossier'} · {userLabel(rejectTarget?.user)}
            </Typography>
          </Box>
          <IconButton size='small' onClick={() => setRejectTarget(null)}>
            <i className='tabler-x' />
          </IconButton>
        </Box>

        <Box sx={{ px: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Motif du rejet</Typography>
            <Box
              component='select'
              value={rejectReason}
              onChange={(e: any) => setRejectReason(e.target.value)}
              sx={{ width: '100%', height: 44, px: 1.5, borderRadius: '6px', border: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', color: 'var(--mui-palette-text-primary)', cursor: 'pointer', outline: 'none' }}
            >
              {rejectionReasons.length === 0 && <option value='document-invalide'>Document invalide</option>}
              {rejectionReasons.map(reason => (
                <option key={reason.slug} value={reason.slug}>{reason.title}</option>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', mb: 1 }}>Notes de révision (optionnel)</Typography>
            <Box
              component='textarea'
              value={rejectNotes}
              onChange={(e: any) => setRejectNotes(e.target.value)}
              placeholder='Précisez la raison…'
              rows={4}
              sx={{ width: '100%', resize: 'vertical', borderRadius: '6px', border: '1px solid', borderColor: 'divider', backgroundColor: 'action.hover', p: 1.5, fontSize: 14, fontFamily: 'inherit', color: 'var(--mui-palette-text-primary)', outline: 'none', '&:focus': { borderColor: 'error.main' } }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 0.5 }}>
            <Button onClick={() => setRejectTarget(null)} disableElevation sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5, color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              Annuler
            </Button>
            <Button onClick={submitRejection} disabled={!rejectReason} disableElevation variant='contained' color='error' sx={{ height: 36, borderRadius: '6px', textTransform: 'none', px: 2.5 }}>
              Confirmer le rejet
            </Button>
          </Box>
        </Box>
      </Dialog>
    </PageContainer>
  )
}
