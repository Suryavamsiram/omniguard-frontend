import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Search, Bell, Command, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/documents': 'Documents',
  '/repositories': 'Repositories',
  '/policies': 'Policies',
  '/findings': 'Findings',
  '/workflows': 'Workflows',
  '/notifications': 'Notifications',
  '/search': 'Search',
  '/audit': 'Audit Logs',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const currentPage = pageTitles[location.pathname] || pageTitles[`/${pathSegments[0]}`] || 'Page'

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setSearchOpen(true)
        searchInputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setCommandPaletteOpen(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <button
            onClick={() => navigate('/')}
            className="hover:text-foreground transition-colors"
          >
            OmniGuard
          </button>
          {pathSegments.length > 0 && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{currentPage}</span>
            </>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className={cn(
          'relative transition-all duration-200',
          searchOpen ? 'w-64' : 'w-auto'
        )}>
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search documents..."
                className="pl-9 pr-20"
                onBlur={() => setSearchOpen(false)}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-muted-foreground">
                esc
              </kbd>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2 text-muted-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 text-xs">
                <Command className="h-3 w-3" />
                K
              </kbd>
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="relative"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2">
            <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              AC
            </div>
            <span className="text-sm">Acme Corp</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-lg rounded-xl border border-border bg-card p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Type a command or search..."
                  className="pl-10 h-12 text-base"
                  autoFocus
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                Type to search or use arrow keys to navigate
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
