import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  MessageSquare, 
  LayoutDashboard, 
  FolderOpen, 
  Search, 
  BarChart3, 
  FileText, 
  Database, 
  Shield,
  Upload,
  Library,
  Activity,
  Users,
  TrendingUp,
  Layers,
  Download,
  Eye,
  Archive,
  Tag,
  GitBranch,
  BarChart,
  UserCheck,
  Lock,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const Sidebar = () => {
  const location = useLocation()
  const [expandedSection, setExpandedSection] = useState(null)

  const navigationSections = [
    {
      id: 'main',
      title: 'Main',
      icon: LayoutDashboard,
      items: [
        { icon: MessageSquare, label: 'Investigation Chat', path: '/chat' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' }
      ]
    },
    {
      id: 'files',
      title: 'File Management',
      icon: FolderOpen,
      items: [
        { icon: Upload, label: 'Upload Files', path: '/files?tab=upload' },
        { icon: Library, label: 'File Library', path: '/files?tab=library' },
        { icon: Activity, label: 'File Status', path: '/files?tab=status' },
        { icon: Database, label: 'Metadata Registry', path: '/files?tab=metadata' },
        { icon: GitBranch, label: 'Source Provenance', path: '/files?tab=provenance' },
        { icon: BarChart, label: 'Data Quality', path: '/files?tab=quality' }
      ]
    },
    {
      id: 'analysis',
      title: 'Analysis Tools',
      icon: Search,
      items: [
        { icon: Users, label: 'Suspect Movement', path: '/analysis?tool=movement' },
        { icon: TrendingUp, label: 'Session Anomaly', path: '/analysis?tool=anomaly' },
        { icon: BarChart3, label: 'Call Pattern Analysis', path: '/analysis?tool=patterns' },
        { icon: Layers, label: 'Data Fusion', path: '/analysis?tool=fusion' },
        { icon: Search, label: 'Custom Analysis', path: '/analysis?tool=custom' }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: FileText,
      items: [
        { icon: FileText, label: 'Reports Library', path: '/reports?tab=library' },
        { icon: Download, label: 'Export Options', path: '/reports?tab=export' },
        { icon: Eye, label: 'Audit Trail', path: '/reports?tab=audit' },
        { icon: Archive, label: 'Evidence Chain', path: '/reports?tab=evidence' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Settings',
      icon: Shield,
      items: [
        { icon: UserCheck, label: 'User Profile', path: '/settings?tab=profile' },
        { icon: Lock, label: 'Access Controls', path: '/settings?tab=access' },
        { icon: Shield, label: 'Privacy Settings', path: '/settings?tab=privacy' },
        { icon: Settings, label: 'System Config', path: '/settings?tab=system' }
      ]
    }
  ]

  const isActivePath = (path) => {
    const currentPath = location.pathname
    const currentSearch = location.search
    const currentFullPath = currentPath + currentSearch
    
    if (path.includes('?')) {
      return currentFullPath === path
    }
    
    return currentPath === path
  }

  const isSectionActive = (section) => {
    return section.items.some(item => isActivePath(item.path))
  }

  const toggleSection = (sectionId) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null)
    } else {
      setExpandedSection(sectionId)
    }
  }

  return (
    <div className="h-full bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <img 
            src="/Police icon in Ice Cream Style.png" 
            alt="Police Logo" 
            className="h-10 w-10 object-contain"
          />
          <div>
            <h2 className="font-bold text-lg">Digital Evidence Platform</h2>
            <p className="text-xs text-slate-400">CDR/IPDR Analysis System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {navigationSections.map((section) => {
            const SectionIcon = section.icon
            const isExpanded = expandedSection === section.id
            const isSectionHighlighted = isSectionActive(section)
            
            return (
              <div key={section.id} className="animate-in fade-in-50 duration-300">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full justify-between text-left h-10 px-3 mb-1 transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                    isSectionHighlighted || isExpanded
                      ? 'bg-[#7F7F80]/60 text-white hover:bg-[#7F7F80]/70' 
                      : 'text-slate-300 hover:text-white hover:bg-[#7F7F80]/40'
                  }`}
                >
                  <div className="flex items-center">
                    <SectionIcon className={`h-4 w-4 mr-3 transition-all duration-300 ${
                      isSectionHighlighted ? 'text-white scale-110' : ''
                    }`} />
                    <span className="text-sm font-medium">{section.title}</span>
                  </div>
                  <div className="transition-transform duration-300 ease-in-out">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>

                {/* Section Items */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded 
                      ? 'max-h-96 opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pl-4 space-y-1 py-1">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon
                      const isActive = isActivePath(item.path)
                      
                      return (
                        <Link 
                          key={itemIndex} 
                          to={item.path}
                          className="block transition-all duration-200 ease-in-out"
                        >
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-left h-8 px-3 transition-all duration-200 ease-in-out ${
                              isActive 
                                ? 'text-[#F0F8FF] hover:text-[#F0F8FF] drop-shadow-[0_0_8px_#92A1AB] hover:drop-shadow-[0_0_12px_#92A1AB]' 
                                : 'text-slate-400 hover:text-white hover:bg-[#92A1AB]/30'
                            }`}
                          >
                            <Icon className={`h-3 w-3 mr-3 transition-transform duration-200 ${
                              isActive ? 'scale-110 text-[#F0F8FF] drop-shadow-[0_0_8px_#92A1AB] filter brightness-125' : ''
                            }`} />
                                                                                                                                                                                                                                           <span className={`text-xs font-medium transition-all duration-200 ${isActive ? 'text-[#F0F8FF] drop-shadow-[0_0_8px_#92A1AB] filter brightness-125 font-semibold' : ''}`}>{item.label}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Sidebar

