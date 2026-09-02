/**
 * Service d'onboarding marchand à distance (vue commercial).
 *
 * Branché sur l'API backend : POST /partners/onboard (permission pros:create).
 * Crée le compte marchand (sans OTP) + sa boutique et envoie le lien d'activation
 * (e-mail / SMS selon les canaux choisis).
 */

import { apiClient } from './api.client'

export interface MerchantInfo {
  firstname: string
  lastname: string
  email: string // requis — sert au lien d'activation
  contact: string // téléphone — requis pour l'envoi SMS
  country?: string
  ville?: string
}

export interface OpeningHour {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  isOpen: boolean
  openTime?: string
  closeTime?: string
  breaks?: Array<{ startTime: string; endTime: string }>
}

export interface ShopInfo {
  name: string
  categoryId: string
  ville: string
  address?: string
  phone?: string
  description?: string
  /** Réduction négociée par le commercial (%). Min 5, défaut 15. */
  maxDiscount?: number
  /** Horaires d'ouverture (jours en anglais côté API). */
  openingHours?: OpeningHour[]
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
    const response = await apiClient.post<{ data: MerchantOnboardingResult } | MerchantOnboardingResult>(
      '/partners/onboard',
      payload
    )

    const data: any = (response as any)?.data ?? response

    return {
      merchantId: data?.merchantId ?? '',
      partnerId: data?.partnerId ?? '',
      activationSent: !!data?.activationSent,
      channels: Array.isArray(data?.channels) ? data.channels : []
    }
  }
}

export const merchantOnboardingService = new MerchantOnboardingService()
