import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Lock, 
  Shield, 
  Settings as SettingsIcon,
  Camera,
  Save,
  Key,
  Bell,
  Database,
  Monitor,
  Users,
  AlertTriangle
} from 'lucide-react'

const Settings = () => {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'profile'
  const [userProfile, setUserProfile] = useState({
    name: 'Detective John Smith',
    email: 'j.smith@police.gov',
    badge: 'DET-001',
    department: 'Digital Crimes Unit',
    phone: '+1 (555) 123-4567',
    role: 'Senior Detective'
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginNotifications: true,
    accessLogging: true
  })

  const [privacySettings, setPrivacySettings] = useState({
    dataRetention: '365',
    auditLogging: true,
    shareAnalytics: false,
    encryptionLevel: 'high'
  })

  const [systemSettings, setSystemSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC-5',
    autoSave: true,
    notifications: true
  })

  const accessLevels = [
    { id: 1, user: 'Detective Brown', role: 'Detective', level: 'Read/Write', lastAccess: '2024-01-16 14:30' },
    { id: 2, user: 'Analyst Johnson', role: 'Analyst', level: 'Read Only', lastAccess: '2024-01-16 12:15' },
    { id: 3, user: 'Supervisor Wilson', role: 'Supervisor', level: 'Admin', lastAccess: '2024-01-16 16:45' },
    { id: 4, user: 'Officer Davis', role: 'Officer', level: 'Limited', lastAccess: '2024-01-15 09:20' }
  ]

  const getLevelColor = (level) => {
    switch (level) {
      case 'Admin': return 'bg-red-100 text-red-800'
      case 'Read/Write': return 'bg-green-100 text-green-800'
      case 'Read Only': return 'bg-blue-100 text-blue-800'
      case 'Limited': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8 h-full overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <Tabs value={activeTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="profile" className="transition-all duration-300 hover:scale-105 active:scale-95">User Profile</TabsTrigger>
          <TabsTrigger value="access" className="transition-all duration-300 hover:scale-105 active:scale-95">Access Controls</TabsTrigger>
          <TabsTrigger value="privacy" className="transition-all duration-300 hover:scale-105 active:scale-95">Privacy Settings</TabsTrigger>
          <TabsTrigger value="system" className="transition-all duration-300 hover:scale-105 active:scale-95">System Config</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-lg">JS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="badge">Badge Number</Label>
                    <Input
                      id="badge"
                      value={userProfile.badge}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, badge: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={userProfile.department}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={userProfile.role} onValueChange={(value) => 
                      setUserProfile(prev => ({ ...prev, role: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Senior Detective">Senior Detective</SelectItem>
                        <SelectItem value="Detective">Detective</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                        <SelectItem value="Officer">Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Select value={securitySettings.sessionTimeout} onValueChange={(value) => 
                      setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Password Expiry (days)</Label>
                    <Select value={securitySettings.passwordExpiry} onValueChange={(value) => 
                      setSecuritySettings(prev => ({ ...prev, passwordExpiry: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Access Control Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessLevels.map((access) => (
                  <div key={access.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{access.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{access.user}</h4>
                        <p className="text-sm text-gray-500">{access.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={getLevelColor(access.level)}>
                          {access.level}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">Last: {access.lastAccess}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Remove</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-gray-500">Log all user actions for compliance</p>
                  </div>
                  <Switch
                    checked={privacySettings.auditLogging}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, auditLogging: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Share Analytics</Label>
                    <p className="text-sm text-gray-500">Share anonymized usage data for improvements</p>
                  </div>
                  <Switch
                    checked={privacySettings.shareAnalytics}
                    onCheckedChange={(checked) => 
                      setPrivacySettings(prev => ({ ...prev, shareAnalytics: checked }))
                    }
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data Retention (days)</Label>
                    <Select value={privacySettings.dataRetention} onValueChange={(value) => 
                      setPrivacySettings(prev => ({ ...prev, dataRetention: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="1095">3 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Encryption Level</Label>
                    <Select value={privacySettings.encryptionLevel} onValueChange={(value) => 
                      setPrivacySettings(prev => ({ ...prev, encryptionLevel: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (AES-128)</SelectItem>
                        <SelectItem value="high">High (AES-256)</SelectItem>
                        <SelectItem value="maximum">Maximum (AES-256 + RSA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={systemSettings.theme} onValueChange={(value) => 
                      setSystemSettings(prev => ({ ...prev, theme: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={systemSettings.language} onValueChange={(value) => 
                      setSystemSettings(prev => ({ ...prev, language: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={systemSettings.timezone} onValueChange={(value) => 
                      setSystemSettings(prev => ({ ...prev, timezone: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save</Label>
                      <p className="text-sm text-gray-500">Automatically save work in progress</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoSave}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, autoSave: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications</Label>
                      <p className="text-sm text-gray-500">Show system notifications</p>
                    </div>
                    <Switch
                      checked={systemSettings.notifications}
                      onCheckedChange={(checked) => 
                        setSystemSettings(prev => ({ ...prev, notifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Backup Settings
                </Button>
                <Button variant="outline">
                  <Monitor className="h-4 w-4 mr-2" />
                  System Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings

