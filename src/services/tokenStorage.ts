const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

class TokenStorage {
  getAccessToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  }

  setAccessToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      console.warn('Unable to store access token')
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch {
      return null
    }
  }

  setRefreshToken(token: string): void {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token)
    } catch {
      console.warn('Unable to store refresh token')
    }
  }

  removeAccessToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // Ignore
    }
  }

  removeRefreshToken(): void {
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch {
      // Ignore
    }
  }

  clear(): void {
    this.removeAccessToken()
    this.removeRefreshToken()
  }

  hasAccessToken(): boolean {
    return this.getAccessToken() !== null
  }
}

export const tokenStorage = new TokenStorage()
