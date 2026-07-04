import { Suspense, lazy } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/toast'
import { Layout } from '@/components/layout/Layout'
import { AuthProvider, ProtectedRoute, useAuth } from '@/context'
import { OrganizationProvider } from '@/context'

const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'))
const WorkflowsPage = lazy(() => import('./pages/WorkflowsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const RepositoriesPage = lazy(() => import('./pages/RepositoriesPage'))
const PoliciesPage = lazy(() => import('./pages/PoliciesPage'))
const FindingsPage = lazy(() => import('./pages/FindingsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const AuditPage = lazy(() => import('./pages/AuditPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <OrganizationProvider>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/findings" element={<FindingsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </OrganizationProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
