'use client'

import { apiClient } from './api.client';
import type { OtpMessageType } from './otp.service';

export class AuthClientService {
  async resetPassword(data: { resetToken: string; newPassword: string; confirmPassword?: string }): Promise<void> {
    await apiClient.post(
      '/user/reset/password',
      {
        resetToken: data.resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      },
      { skipAuth: true }
    )
  }

  async forgotPassword(login: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/otp/generate', {
      login,
      messageType: 'PASSWORD_RESET'
    })

    return response
  }

  async generateOTP(login: string, messageType: OtpMessageType): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/otp/generate', {
      login,
      messageType
    })

    return response
  }

  async verifyOTP(data: { login: string; otp: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/otp/verify', {
      login: data.login,
      code: data.otp
    })

    return response
  }
}

export const authClientService = new AuthClientService()
