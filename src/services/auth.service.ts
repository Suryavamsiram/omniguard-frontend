import { api, ApiError } from './api'

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
      localStorage.setItem('auth_token', response.access_token)
    }

    return response
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('auth_token')
    }
  }

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/refresh')

    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token)
    }

    return response
  }

  async checkSession(): Promise<User | null> {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    try {
      return await this.getCurrentUser()
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        localStorage.removeItem('auth_token')
      }
      return null
    }
  }
}

export const authService = new AuthService()
