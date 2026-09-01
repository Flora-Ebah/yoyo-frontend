/**
 * Service d'onboarding marchand à distance (vue commercial).
 *
 * ⚠️ FRONT-ONLY / STUB : l'API n'existe pas encore. `onboard()` simule une réponse.
 * Le binôme backend implémentera l'endpoint selon le contrat ci-dessous
 * (voir CONTRAT-API-ONBOARDING-MARCHAND.md). Pour brancher le vrai endpoint,
 * décommenter l'appel `apiClient.post(...)` et supprimer le bloc de simulation.
 */

// import { apiClient } from './api.client'

export interface MerchantInfo {
  firstname: string
  lastname: string
  email: string // requis — sert au lien d'activation
  contact: string // téléphone — requis pour l'envoi SMS
  country?: string
  ville?: string
}

export interface ShopInfo {
  name: string
  categoryId: string
  ville: string
  address?: string
  phone?: string
  description?: string
}

export interface MerchantOnboardingPayload {
  merchant: MerchantInfo
  shop: ShopInfo
  /** canaux d'envoi du lien d'activation */
  channels: { email: boolean; sms: boolean }
}

export interface MerchantOnboardingResult {
  merchantId: string
  partnerId: string
  activationSent: boolean
  channels: string[]
}

class MerchantOnboardingService {
  /**
   * Crée un marchand + sa boutique à distance (sans OTP) et déclenche l'envoi
   * du lien d'activation par e-mail (+ SMS). Contrat cible :
   *
   *   POST /partners/onboard   (admin, permission pros:create)
   *   body  : MerchantOnboardingPayload
   *   200   : { data: MerchantOnboardingResult }
   */
  async onboard(payload: MerchantOnboardingPayload): Promise<MerchantOnboardingResult> {
    // --- Appel réel (à activer quand l'API existe) ---
    // const response = await apiClient.post<{ data: MerchantOnboardingResult } | MerchantOnboardingResult>(
    //   '/partners/onboard',
    //   payload
    // )
    // return (response as any).data ?? (response as any)

    // --- SIMULATION (front-only) ---
    await new Promise(resolve => setTimeout(resolve, 900))

    const channels: string[] = []

    if (payload.channels.email) channels.push('email')
    if (payload.channels.sms) channels.push('sms')

    return {
      merchantId: `sim_${Math.random().toString(36).slice(2, 10)}`,
      partnerId: `sim_${Math.random().toString(36).slice(2, 10)}`,
      activationSent: channels.length > 0,
      channels
    }
  }
}

export const merchantOnboardingService = new MerchantOnboardingService()
