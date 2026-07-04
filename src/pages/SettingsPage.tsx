import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Shield,
  Bell,
  Key,
  Users,
  Link2,
  LogOut,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth, useOrganization } from '@/context'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'api', label: 'API Keys', icon: Key },
]

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { user, logout } = useAuth()
  const { currentOrganization } = useOrganization()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
              <div className="h-px bg-border my-2" />
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </nav>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-medium">
                    {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'JD'}
                  </div>
                  <div>
                    <p className="font-medium">{user?.name || 'John Doe'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'john@example.com'}</p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input placeholder="john@example.com" type="email" />
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'organization' && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>Manage organization details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Name</label>
                  <Input placeholder={currentOrganization?.name || 'Acme Corp'} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization Slug</label>
                  <Input placeholder={currentOrganization?.slug || 'acme-corp'} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage password and authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connected services and tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['GitHub', 'GitLab', 'Slack', 'Jira', 'Confluence'].map((name) => (
                    <div key={name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="font-medium">{name}</div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Notification settings coming soon.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'team' && (
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage team access and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Team management coming soon.
                </p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage API access tokens</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button>Generate New API Key</Button>
                <p className="text-sm text-muted-foreground">
                  No API keys generated yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default SettingsPage
