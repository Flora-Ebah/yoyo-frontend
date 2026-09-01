import { apiServer } from './api.server'

/**
 * Types pour les OTP
 */
export type OtpMessageType =
  | 'ACCOUNT_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'LOGIN_VERIFICATION'
  | 'TWO_FACTOR_AUTH'
  | 'TRANSACTION_CONFIRMATION'
  | 'PAYMENT_CONFIRMATION'
  | 'TRANSFER_NOTIFICATION'
  | 'ACCOUNT_UPDATED'
  | 'SECURITY_ALERT'
  | 'PROFILE_CHANGES'
  | 'WELCOME_MESSAGE'
  | 'ACCOUNT_REMINDER'
  | 'INACTIVITY_ALERT'
  | 'PROMOTIONAL_OFFER'
  | 'NEW_FEATURE_ANNOUNCEMENT'
  | 'SURVEY_INVITATION'

export interface GenerateOtpRequest {
  login: string
  messageType: OtpMessageType
}

export interface GenerateOtpResponse {
  message?: string
  data?: unknown
}

export interface VerifyOtpRequest {
  login: string
  code: string
}

export interface VerifyOtpResponse {
  message?: string
  data?: unknown
}

/**
 * Service pour gérer les OTP
 */
class OtpService {
  /**
   * Génère un code OTP
   */
  async generate(request: GenerateOtpRequest): Promise<GenerateOtpResponse> {
    const response = await apiServer.post<GenerateOtpResponse>('/otp/generate', {
      login: request.login,
      messageType: request.messageType
    })
    return response
  }

  /**
   * Vérifie un code OTP
   */
  async verify(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const response = await apiServer.post<VerifyOtpResponse>('/otp/verify', request)
    return response
  }
}

export const otpService = new OtpService()

