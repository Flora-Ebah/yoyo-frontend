import { apiClient } from './api.client'
import type { Ability } from '@/configs/permissions'

export type ProfileStatus = 'active' | 'inactive' | 'suspended' | 'removed'

/** Un profil = un rôle, avec ses permissions (ability). */
export interface Profile {
  _id: string
  slug?: string
  name: string
  description?: string
  ability?: Ability[]
  status?: ProfileStatus
  createdAt?: string
  updatedAt?: string
}

export interface CreateProfileRequest {
  name: string
  description?: string
  ability?: Ability[]
  status?: ProfileStatus
}

export interface UpdateProfileRequest {
  name?: string
  description?: string
  ability?: Ability[]
  status?: ProfileStatus
}

export class ProfileService {
  /** Liste des rôles. GET /profiles */
  async getAll(params?: { status?: ProfileStatus; q?: string }): Promise<Profile[]> {
    const queryParams = new URLSearchParams()

    queryParams.append('pageSize', '200')
    if (params?.status) queryParams.append('status', params.status)
    if (params?.q) queryParams.append('q', params.q)

    const response = await apiClient.get<{ data?: Profile[] }>(`/profiles?${queryParams.toString()}`, {
      rawResponse: true
    })

    return Array.isArray((response as any)?.data) ? (response as any).data : []
  }

  /** Détail d'un rôle. GET /profiles/details/:id */
  async getById(id: string): Promise<Profile> {
    const response = await apiClient.get<Profile | { data: Profile }>(`/profiles/details/${id}`)

    return (response as any).data ?? (response as any)
  }

  /** Crée un rôle. POST /profiles */
  async create(profile: CreateProfileRequest): Promise<Profile> {
    const response = await apiClient.post<{ data: Profile } | Profile>('/profiles', profile)

    return (response as any).data ?? (response as any)
  }

  /** Met à jour un rôle. PUT /profiles */
  async update(id: string, profile: UpdateProfileRequest): Promise<Profile> {
    const response = await apiClient.put<{ data: Profile } | Profile>('/profiles', { _id: id, ...profile })

    return (response as any).data ?? (response as any)
  }

  /** Supprime un rôle. DELETE /profiles/remove/:id */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/profiles/remove/${id}`)
  }
}

export const profileService = new ProfileService()
