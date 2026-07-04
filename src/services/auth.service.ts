import { api, ApiError } from './api'
import { tokenStorage } from './tokenStorage'

export interface User {
  id: string
  email: string
  name: string
  role: string
  organization_id: string
  avatar_url?: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  name: string
  organization_name?: string
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  user: User
  expires_in?: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials)

    if (response.access_token) {
      tokenStorage.setAccessToken(response.access_token)
    }

    if (response.refresh_token) {
      tokenStorage.setRefreshToken(response.refresh_token)
    }

    return response
  }

  async register(credentials: RegisterCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', credentials)

    if (response.access_token) {
      tokenStorage.setAccessToken(response.access_token)
    }

    if (response.refresh_token) {
      tokenStorage.setRefreshToken(response.refresh_token)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      tokenStorage.clear()
    }
  }

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  }

  async refreshToken(): Promise<LoginResponse | null> {
    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) return null

    try {
      const response = await api.post<LoginResponse>('/auth/refresh', {
        refresh_token: refreshToken,
      })

      if (response.access_token) {
        tokenStorage.setAccessToken(response.access_token)
      }

      if (response.refresh_token) {
        tokenStorage.setRefreshToken(response.refresh_token)
      }

      return response
    } catch {
      return null
    }
  }

  async checkSession(): Promise<User | null> {
    if (!tokenStorage.hasAccessToken()) return null

    try {
      return await this.getCurrentUser()
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        tokenStorage.clear()
      }
      return null
    }
  }
}

export const authService = new AuthService()
