'use client'

import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

import PageContainer from '@/components/PageContainer'
import MerchantOnboardingForm from '../components/MerchantOnboardingForm'

function NouveauMarchandInner() {
  const sp = useSearchParams()
  const next = sp?.get('next') || '/pros'
  const listLabel = next.includes('commercial') ? 'Voir mes enrôlements' : 'Voir la liste'

  return (
    <PageContainer title='Nouveau partenaire' subtitle='Créez le compte + la boutique à distance'>
      <MerchantOnboardingForm next={next} listLabel={listLabel} />
    </PageContainer>
  )
}

export default function NouveauMarchandPage() {
  return (
    <Suspense fallback={null}>
      <NouveauMarchandInner />
    </Suspense>
  )
}
