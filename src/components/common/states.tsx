import { TriangleAlert as AlertTriangle, RefreshCw, FileQuestionMark as FileQuestion, LogIn, WifiOff, ServerCrash, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StateProps {
  className?: string
  onRetry?: () => void
}

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      <div className="h-4 w-3/4 rounded bg-primary/10" />
      <div className="h-4 w-1/2 rounded bg-primary/10" />
      <div className="h-4 w-5/6 rounded bg-primary/10" />
    </div>
  )
}

export function ErrorState({ className, onRetry }: StateProps & { message?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        We encountered an error while loading this content. Please try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  )
}

export function UnauthorizedState({ className }: StateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-warning/10 p-4 mb-4">
        <LogIn className="h-8 w-8 text-warning" />
      </div>
      <h3 className="text-lg font-medium mb-2">Session expired</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Your session has expired. Please sign in again to continue.
      </p>
      <Button onClick={() => window.location.href = '/login'}>
        Sign In
      </Button>
    </div>
  )
}

export function EmptyState({
  className,
  title = 'No data',
  description = 'There\'s nothing here yet.',
  icon: Icon = FileQuestion,
  action,
}: StateProps & {
  title?: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  )
}

export function OfflineState({ className, onRetry }: StateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-warning/10 p-4 mb-4">
        <WifiOff className="h-8 w-8 text-warning" />
      </div>
      <h3 className="text-lg font-medium mb-2">You're offline</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Check your internet connection and try again.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}

export function ServerErrorState({ className, onRetry }: StateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <ServerCrash className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Server error</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Our servers are having issues. Please try again later.
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  )
}

export function NotFoundState({ className }: StateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <SearchX className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Not found</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        The page or resource you're looking for doesn't exist.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go back
      </Button>
    </div>
  )
}

export function ForbiddenState({ className }: StateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Access denied</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        You don't have permission to access this resource.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        Go back
      </Button>
    </div>
  )
}

export function NoDataState({ className }: StateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No data available</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        There's no data to display at the moment.
      </p>
    </div>
  )
}
