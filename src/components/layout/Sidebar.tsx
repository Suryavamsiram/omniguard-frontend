import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, GitBranch, Shield, TriangleAlert as AlertTriangle, Bell, Search, Settings, Workflow, FileCheck, ClipboardList, Users, ChartBar as BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Repositories', href: '/repositories', icon: GitBranch },
  { name: 'Policies', href: '/policies', icon: Shield },
  { name: 'Findings', href: '/findings', icon: AlertTriangle },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Search', href: '/search', icon: Search },
]

const secondaryNav = [
  { name: 'Audit Logs', href: '/audit', icon: ClipboardList },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0"
    >
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">OmniGuard</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = item.href === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.href)

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                'hover:bg-secondary hover:text-foreground',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          )
        })}

        <div className="pt-4 pb-2">
          <div className="h-px bg-border" />
        </div>

        {secondaryNav.map((item) => {
          const isActive = location.pathname.startsWith(item.href)
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                'hover:bg-secondary hover:text-foreground',
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Admin</p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
