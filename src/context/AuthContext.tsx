import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService, User } from '@/services/auth.service'
import { ApiError } from '@/services/api'
import { tokenStorage } from '@/services/tokenStorage'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const checkSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const currentUser = await authService.checkSession()
      setUser(currentUser)
      setIsAuthenticated(currentUser !== null)
    } catch {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setUser(response.user)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
  }, [navigate])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login', { state: { from: location.pathname, sessionExpired: true } })
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [navigate, location.pathname])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
