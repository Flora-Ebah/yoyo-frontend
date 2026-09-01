'use client'

import { useEffect, useMemo, useState } from 'react'
import { AddIcon } from '@/components/ui'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

import { toast } from 'react-toastify'

import { categoryService, type Category } from '@/services/category.service'
import { merchantOnboardingService } from '@/services/merchant-onboarding.service'

type Props = {
  next?: string
  listLabel?: string
}

// Clé de sauvegarde du brouillon d'onboarding (survit à un rafraîchissement de page).
const DRAFT_KEY = 'yoyo:merchant-onboarding:draft'

const STEPS = [
  { title: 'Informations de connexion', subtitle: "Saisissez l'e-mail et le téléphone du marchand." },
  { title: 'Informations personnelles', subtitle: 'Nom du propriétaire de la boutique.' },
  { title: 'La boutique', subtitle: 'Informations essentielles — le marchand complétera le reste.' },
  { title: 'Récapitulatif', subtitle: 'Choisissez les canaux, puis créez le compte.' }
]

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const fieldSx = {
  width: '100%', height: 40, px: 1.5, borderRadius: '6px', border: '1px solid', borderColor: 'divider',
  backgroundColor: 'background.paper', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
  color: 'var(--mui-palette-text-primary)', outline: 'none', '&:focus': { borderColor: 'primary.main' }
} as const

const labelSx = { fontSize: 12.5, fontWeight: 600, color: 'text.secondary', mb: 0.75 } as const

// Défini AU NIVEAU MODULE (pas dans le composant) pour ne pas remonter l'input à chaque frappe.
const Field = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={labelSx}>{label}</Typography>
    <Box component='input' type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder} sx={fieldSx} />
  </Box>
)

const MerchantOnboardingForm = ({ next = '/pros', listLabel = 'Voir la liste' }: Props) => {
  const theme = useTheme()
  const router = useRouter()
  const primary = theme.palette.primary.main

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState<{ channels: string[] } | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  const [email, setEmail] = useState('')
  const [contact, setContact] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [ville, setVille] = useState('')

  const [shopName, setShopName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [shopVille, setShopVille] = useState('')
  const [address, setAddress] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [description, setDescription] = useState('')

  const [sendEmail, setSendEmail] = useState(true)
  const [sendSms, setSendSms] = useState(true)

  useEffect(() => {
    categoryService.getAll({ limit: 200 }).then(res => setCategories(res.data || [])).catch(() => setCategories([]))
  }, [])

  // Restauration du brouillon APRÈS le montage (côté client uniquement) : l'état initial
  // reste vide comme sur le serveur ⇒ pas de mismatch d'hydratation. On empêche l'effet
  // de sauvegarde d'écrire tant que la restauration n'a pas eu lieu (sinon on écraserait
  // le brouillon par des valeurs vides).
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)

      if (raw) {
        const d = JSON.parse(raw)

        if (d && typeof d === 'object') {
          if (typeof d.step === 'number') setStep(Math.min(Math.max(0, d.step), STEPS.length - 1))
          if (typeof d.email === 'string') setEmail(d.email)
          if (typeof d.contact === 'string') setContact(d.contact)
          if (typeof d.firstname === 'string') setFirstname(d.firstname)
          if (typeof d.lastname === 'string') setLastname(d.lastname)
          if (typeof d.ville === 'string') setVille(d.ville)
          if (typeof d.shopName === 'string') setShopName(d.shopName)
          if (typeof d.categoryId === 'string') setCategoryId(d.categoryId)
          if (typeof d.shopVille === 'string') setShopVille(d.shopVille)
          if (typeof d.address === 'string') setAddress(d.address)
          if (typeof d.shopPhone === 'string') setShopPhone(d.shopPhone)
          if (typeof d.description === 'string') setDescription(d.description)
          if (typeof d.sendEmail === 'boolean') setSendEmail(d.sendEmail)
          if (typeof d.sendSms === 'boolean') setSendSms(d.sendSms)
        }
      }
    } catch {
      // brouillon illisible : on ignore
    }

    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Tant que la restauration initiale n'a pas eu lieu, on n'écrit pas (évite d'écraser
    // le brouillon avec les valeurs vides du premier rendu).
    if (!hydrated) return

    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step, email, contact, firstname, lastname, ville, shopName, categoryId, shopVille, address, shopPhone, description, sendEmail, sendSms })
      )
    } catch {
      // quota / mode privé : on ignore
    }
  }, [hydrated, step, email, contact, firstname, lastname, ville, shopName, categoryId, shopVille, address, shopPhone, description, sendEmail, sendSms])

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
  }

  const reset = () => {
    clearDraft()
    setStep(0)
    setDone(null)
    setSubmitting(false)
    setEmail('')
    setContact('')
    setFirstname('')
    setLastname('')
    setVille('')
    setShopName('')
    setCategoryId('')
    setShopVille('')
    setAddress('')
    setShopPhone('')
    setDescription('')
    setSendEmail(true)
    setSendSms(true)
  }

  const stepValid = useMemo(() => {
    if (step === 0) return emailOk(email) && contact.trim().length >= 8
    if (step === 1) return !!firstname.trim() && !!lastname.trim()
    if (step === 2) return !!shopName.trim() && !!categoryId && !!shopVille.trim()
    if (step === 3) return sendEmail || sendSms

    return true
  }, [step, email, contact, firstname, lastname, shopName, categoryId, shopVille, sendEmail, sendSms])

  const goNext = () => {
    if (!stepValid) return toast.error('Veuillez remplir les champs requis')
    if (step < STEPS.length - 1) setStep(s => s + 1)
  }

  const goBack = () => {
    if (step === 0) router.push(next)
    else setStep(s => Math.max(0, s - 1))
  }

  const submit = async () => {
    if (!stepValid) return

    setSubmitting(true)

    try {
      const res = await merchantOnboardingService.onboard({
        merchant: { firstname: firstname.trim(), lastname: lastname.trim(), email: email.trim(), contact: contact.trim(), ville: ville.trim() || undefined },
        shop: { name: shopName.trim(), categoryId, ville: shopVille.trim(), address: address.trim() || undefined, phone: shopPhone.trim() || undefined, description: description.trim() || undefined },
        channels: { email: sendEmail, sms: sendSms }
      })

      clearDraft()
      setDone({ channels: res.channels })
      toast.success("Marchand créé — lien d'activation envoyé")
    } catch (err: any) {
      toast.error(err?.message || 'Échec de la création du marchand')
    } finally {
      setSubmitting(false)
    }
  }

  const catName = categories.find(c => c._id === categoryId)?.name || ''

  // ---- Écran de succès ----
  if (done) {
    return (
      <Box sx={{ maxWidth: 520, mx: 'auto', backgroundColor: 'background.paper', borderRadius: '6px', p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 82, height: 82, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main', backgroundColor: alpha(theme.palette.success.main, 0.14) }}>
            <i className='tabler-circle-check' style={{ fontSize: '2.7rem' }} />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'text.primary', textAlign: 'center' }}>Partenaire et boutique créés</Typography>
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary', textAlign: 'center', px: 1 }}>
            Un lien d'activation a été envoyé à <b>{email}</b>
            {done.channels.includes('sms') ? <> et par SMS au <b>{contact}</b></> : null}. Le marchand définira son mot de passe.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, width: '100%', mt: 1.5, flexWrap: 'wrap' }}>
            <Button onClick={() => router.push(next)} disableElevation sx={{ flex: 1, minWidth: 160, height: 36, borderRadius: '6px', textTransform: 'none', color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
              {listLabel}
            </Button>
            <Button onClick={reset} disableElevation variant='contained' sx={{ flex: 1, minWidth: 160, height: 36, borderRadius: '6px', textTransform: 'none' }}>
              Créer un nouveau
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  // ---- Récapitulatif dynamique (colonne desktop) ----
  const RecapRow = ({ k, v }: { k: string; v?: string }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 0.25, sm: 2 },
        py: 0.85
      }}
    >
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'text.secondary', flexShrink: 0 }}>{k}</Typography>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 600,
          color: v ? 'text.primary' : 'text.disabled',
          textAlign: { xs: 'left', sm: 'right' },
          minWidth: 0,
          maxWidth: '100%',
          overflowWrap: 'anywhere'
        }}
      >
        {v || '—'}
      </Typography>
    </Box>
  )

  const RecapSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '.04em', mb: 0.5 }}>{title}</Typography>
      <Box sx={{ '& > div': { borderTop: '1px dashed', borderColor: alpha(theme.palette.text.primary, 0.14) }, '& > div:first-of-type': { borderTop: 'none' } }}>{children}</Box>
    </Box>
  )

  const recap = (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: '6px', border: '1px solid', borderColor: 'divider', p: 2.5, height: { md: 600 }, overflowY: 'auto' }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'text.primary', mb: 1.5 }}>Récapitulatif</Typography>
      <RecapSection title='Marchand'>
        <RecapRow k='Nom' v={`${firstname} ${lastname}`.trim()} />
        <RecapRow k='E-mail' v={email} />
        <RecapRow k='Téléphone' v={contact} />
        <RecapRow k='Ville' v={ville} />
      </RecapSection>
      <RecapSection title='Boutique'>
        <RecapRow k='Nom' v={shopName} />
        <RecapRow k='Catégorie' v={catName} />
        <RecapRow k='Ville' v={shopVille} />
        <RecapRow k='Adresse' v={address} />
        <RecapRow k='Téléphone' v={shopPhone} />
      </RecapSection>
      <RecapSection title='Envoi du lien'>
        <RecapRow k='E-mail' v={sendEmail ? 'Oui' : 'Non'} />
        <RecapRow k='SMS' v={sendSms ? 'Oui' : 'Non'} />
      </RecapSection>
    </Box>
  )

  // ---- Formulaire ----
  const form = (
    <Box sx={{ backgroundColor: 'background.paper', borderRadius: '6px', border: '1px solid', borderColor: 'divider', p: { xs: 2.5, sm: 3 }, height: { md: 600 }, display: 'flex', flexDirection: 'column' }}>
      {/* Barre : Annuler + Réinitialiser */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Button onClick={() => router.push(next)} disableElevation sx={{ height: 36, borderRadius: '6px', fontSize: 13, textTransform: 'none', px: 2, color: 'error.main', backgroundColor: alpha(theme.palette.error.main, 0.12), '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.2) } }}>
          Annuler
        </Button>
        <Button onClick={reset} disableElevation sx={{ height: 36, borderRadius: '6px', fontSize: 13, textTransform: 'none', px: 2, color: 'primary.main', backgroundColor: alpha(theme.palette.primary.main, 0.12), '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) } }}>
          Réinitialiser
        </Button>
      </Box>

      {/* Carte d'étape (dégradé + gros numéro) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.75, mb: 2.5, borderRadius: '6px', background: `linear-gradient(90deg, ${alpha(primary, 0.15)}, ${alpha(primary, 0)})` }}>
        <Box sx={{ width: 58, height: 58, flexShrink: 0, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'primary.main', color: '#fff', fontSize: 30, fontWeight: 800 }}>
          {step + 1}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{STEPS[step].title}</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.4 }}>{STEPS[step].subtitle}</Typography>
        </Box>
      </Box>

      {/* Contenu */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {step === 0 && (
          <>
            <Field label='E-mail' type='email' value={email} onChange={setEmail} placeholder='nom@email.com' />
            <Field label='Numéro de téléphone' value={contact} onChange={setContact} placeholder='07 00 00 00 00' />
          </>
        )}
        {step === 1 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { sm: 2 } }}>
            <Field label='Prénom' value={firstname} onChange={setFirstname} />
            <Field label='Nom' value={lastname} onChange={setLastname} />
            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <Field label='Ville (optionnel)' value={ville} onChange={setVille} />
            </Box>
          </Box>
        )}
        {step === 2 && (
          <>
            <Field label='Nom de la boutique' value={shopName} onChange={setShopName} placeholder='ex. Chez Fatou' />
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={labelSx}>Catégorie</Typography>
              <Box component='select' value={categoryId} onChange={(e: any) => setCategoryId(e.target.value)} sx={{ ...fieldSx, cursor: 'pointer' }}>
                <option value=''>Choisir une catégorie</option>
                {categories.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { sm: 2 } }}>
              <Field label='Ville' value={shopVille} onChange={setShopVille} />
              <Field label='Téléphone boutique (optionnel)' value={shopPhone} onChange={setShopPhone} />
            </Box>
            <Field label='Adresse (optionnel)' value={address} onChange={setAddress} />
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={labelSx}>Description (optionnel)</Typography>
              <Box component='textarea' value={description} onChange={(e: any) => setDescription(e.target.value)} rows={3} placeholder='Quelques mots sur la boutique…' sx={{ ...fieldSx, height: 'auto', py: 1.25, resize: 'vertical', cursor: 'text' }} />
            </Box>
          </>
        )}
        {step === 3 && (
          <>
            {/* Récap compact (mobile : la colonne récap est cachée) */}
            <Box sx={{ display: { md: 'none' }, mb: 2 }}>{recap}</Box>
            <Typography sx={labelSx}>Canaux d'envoi du lien d'activation</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, borderRadius: '6px', backgroundColor: 'action.hover', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-mail' style={{ fontSize: '1.1rem', color: theme.palette.text.secondary }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>E-mail</Typography>
              </Box>
              <Switch checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.25, borderRadius: '6px', backgroundColor: 'action.hover' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='tabler-message-2' style={{ fontSize: '1.1rem', color: theme.palette.text.secondary }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>SMS</Typography>
              </Box>
              <Switch checked={sendSms} onChange={e => setSendSms(e.target.checked)} />
            </Box>
          </>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', pt: 2.5 }}>
        {step > 0 && (
          <Button onClick={goBack} disableElevation sx={{ flex: '0 0 132px', height: 36, borderRadius: '6px', fontSize: 13, textTransform: 'none', color: 'text.secondary', backgroundColor: 'action.hover', '&:hover': { backgroundColor: 'action.selected' } }}>
            Précédent
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext} disabled={!stepValid} disableElevation variant='contained' sx={{ flex: 1, height: 36, borderRadius: '6px', fontSize: 13, textTransform: 'none' }}>
            Suivant
          </Button>
        ) : (
          <Button onClick={submit} disabled={!stepValid || submitting} disableElevation variant='contained' startIcon={submitting ? <CircularProgress size={18} color='inherit' /> : undefined} sx={{ flex: 1, height: 36, borderRadius: '6px', fontSize: 13, textTransform: 'none' }}>
            Créer le marchand
          </Button>
        )}
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '430px minmax(0, 1fr)' }, gap: 3, alignItems: 'start', width: '100%' }}>
      {/* Récap dynamique — desktop uniquement */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{recap}</Box>
      {form}
    </Box>
  )
}

export default MerchantOnboardingForm
