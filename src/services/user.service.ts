import { apiClient } from './api.client'

export interface User {
  _id: string
  email?: string
  firstname?: string
  lastname?: string
  username?: string
  contact?: string
  slug?: string
  isEmailConfirmed?: boolean
  isPhoneConfirmed?: boolean
  isDocumentVerified?: boolean
  documents?: any[]
  avatar?: string
  isCertified?: boolean
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
  role?: 'admin' | 'user' | 'provider'
  authProvider?: 'local' | 'google' | 'facebook' | 'twitter' | 'github'
  profileCompleted?: boolean
  syncOAuthData?: boolean
  securityPreferences?: {
    deviceLogin: boolean
    twoFactorEnabled: boolean
    twoFactorMethod: string
    loginNotifications: boolean
    sessionTimeout: number
    ipWhitelist: string[]
    ipBlacklist: string[]
  }
  notificationPreferences?: {
    email: boolean
    push: boolean
    sms: boolean
    frequency: string
    types: {
      news: boolean
      updates: boolean
      security: boolean
      marketing: boolean
    }
  }
  hasPassword?: boolean
  profile?: string | { _id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email?: string
  password?: string
  firstname?: string
  lastname?: string
  contact: string
  profile?: string
  role?: 'admin' | 'user' | 'provider'
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
}

export interface UpdateUserRequest {
  email?: string
  firstname?: string
  lastname?: string
  contact?: string
  profile?: string
  role?: 'admin' | 'user' | 'provider'
  status?: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'
}

export interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface LoginHistoryEntry {
  _id: string
  identifier: string
  role: string
  status: 'success' | 'failed' | 'revoked'
  ip: string
  userAgent: string
  device: string
  token?: string
  attemptsCount: number
  errorReason?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}


export interface LoginHistoryResponse {
  message: string
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  data: LoginHistoryEntry[]
}


export interface RegisterResponse {
  message?: string
  user?: User
}


export interface AvailabilityResponse {
  available: boolean
  message?: string
}


export interface ConnectionsResponse {
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  data: LoginHistoryEntry[]
}

export class UserService {
  async register(data: Record<string, unknown>): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/login/register', data)
    return (response as any).data ?? (response as any)
  }

  async checkEmailAvailability(email: string): Promise<AvailabilityResponse> {
    const response = await apiClient.post<AvailabilityResponse>('/login/check-email', { email })
    return (response as any).data ?? (response as any)
  }

  async checkUsernameAvailability(username: string): Promise<AvailabilityResponse> {
    const response = await apiClient.post<AvailabilityResponse>('/login/check-username', { username })
    return (response as any).data ?? (response as any)
  }

  
  async getConnectedUser(): Promise<User> {
    return this.getCurrentUser()
  }

  async getMyConnections(
    page: number = 1,
    limit: number = 10,
    status?: 'success' | 'failed' | 'revoked'
  ): Promise<ConnectionsResponse> {
    const queryParams = new URLSearchParams()

    queryParams.append('page', String(page))
    queryParams.append('limit', String(limit))
    if (status) queryParams.append('status', status)

    const endpoint = `/login/me?${queryParams.toString()}`
    const response = await apiClient.get<LoginHistoryResponse>(endpoint)

    return {
      message: response.message,
      pagination: response.pagination,
      data: response.data || []
    }
  }

  async updateSecurityPreferences(data: Record<string, unknown>): Promise<User> {
    const response = await apiClient.put<User | { data: User }>('/user/me/security-preferences', data)
    return (response as any).data ?? (response as any)
  }

  async updateNotificationPreferences(data: Record<string, unknown>): Promise<User> {
    const response = await apiClient.put<User | { data: User }>('/user/me/notification-preferences', data)
    return (response as any).data ?? (response as any)
  }

  async convertToLocalAccount(password: string): Promise<User> {
    const response = await apiClient.post<User | { data: User }>('/user/me/convert-to-local', { password })
    return (response as any).data ?? (response as any)
  }

  async updateEmail(email: string, otp: string): Promise<User> {
    const response = await apiClient.put<User | { data: User }>('/user/me/email', { email, otp })
    return (response as any).data ?? (response as any)
  }

  async getAll(params?: {
    page?: number
    limit?: number
    onlyActive?: boolean
    search?: string
  }): Promise<UsersResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.onlyActive) queryParams.append('onlyActive', 'true')
    if (params?.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const endpoint = `/user${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<{
      data: User[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(endpoint)

    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    }
  }

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User | { data: User }>(`/user/details/${id}`)
    return (response as any).data ?? (response as any)
  }

  async create(user: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<User | { data: User }>('/user', user)
    return (response as any).data ?? (response as any)
  }

  async update(id: string, user: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User | { data: User }>(`/user/${id}`, user)
    return (response as any).data ?? (response as any)
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/user/${id}`)
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending'): Promise<User> {
    const response = await apiClient.put<User | { data: User }>(`/user/${id}/status`, { status })
    return (response as any).data ?? (response as any)
  }

  
  async updateRole(id: string, role: 'admin' | 'user' | 'provider'): Promise<User> {
    const response = await apiClient.put<User | { data: User }>(`/user/${id}/role`, { role })
    return (response as any).data ?? (response as any)
  }

  async updateMyRole(role: 'admin' | 'user' | 'provider'): Promise<User> {
    const response = await apiClient.put<User | { data: User }>('/user/me/role', { role })
    return (response as any).data ?? (response as any)
  }

  async getCurrentUser(): Promise<User> {
    try {
      const adminResponse = await apiClient.get<User | { data: User }>('/admin/me')
      return (adminResponse as any).data ?? (adminResponse as any)
    } catch (adminError: any) {
      // Compatibilite: certains backends exposent encore /user/me
      if (adminError?.statusCode && adminError.statusCode !== 404) {
        throw adminError
      }

      const response = await apiClient.get<User | { data: User }>('/user/me')
      return (response as any).data ?? (response as any)
    }
  }

  async updateProfile(profileData: {
    firstname?: string
    lastname?: string
    address?: string
    birthdate?: string
    country?: string
    gender?: string
    longueurCheveux?: {
      droit: number
      gauche: number
      avant: number
      arriere: number
    }
    ageCheveux?: number
    syncOAuthData?: boolean
  }): Promise<User> {
    const response = await apiClient.put<User | { data: User }>('/user/me', profileData)
    return (response as any).data ?? (response as any)
  }

  async updatePassword(data: { password?: string; newPassword: string; confirmPassword: string }): Promise<void> {
    await apiClient.put('/user/me/password', data)
  }

  async removePassword(currentPassword: string): Promise<void> {
    await apiClient.delete('/user/me/password', {
      body: JSON.stringify({ currentPassword }),
      headers: {
        'Content-Type': 'application/json'
      }
    } as any)
  }

  async getProfileStatus(): Promise<{
    isComplete: boolean
    missingFields: string[]
    requiredFields: string[]
  }> {
    const response = await apiClient.get<{
      isComplete: boolean
      missingFields: string[]
      requiredFields: string[]
    }>('/user/me/profile-status')

    return response
  }

  async getLoginHistory(params?: { page?: number; limit?: number }): Promise<LoginHistoryResponse> {
    const queryParams = new URLSearchParams()

    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/login/me${queryString ? `?${queryString}` : ''}`

    const response = await apiClient.get<LoginHistoryResponse>(endpoint)
    return response
  }
}

export const userService = new UserService()






