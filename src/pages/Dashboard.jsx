import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Activity,
  Upload,
  Search,
  BarChart3
} from 'lucide-react'

const Dashboard = () => {
  // Updated data focusing on IPDR/CDR files instead of cases
  const fileProcessingData = [
    { month: 'Jan', cdr: 45, ipdr: 32 },
    { month: 'Feb', cdr: 52, ipdr: 38 },
    { month: 'Mar', cdr: 48, ipdr: 41 },
    { month: 'Apr', cdr: 61, ipdr: 45 },
    { month: 'May', cdr: 58, ipdr: 52 },
    { month: 'Jun', cdr: 67, ipdr: 48 }
  ]

  // Updated analysis distribution without FIR content
  const analysisData = [
    { name: 'CDR Analysis', value: 45, color: '#3b82f6' },
    { name: 'IPDR Analysis', value: 35, color: '#10b981' },
    { name: 'Pattern Detection', value: 12, color: '#f59e0b' },
    { name: 'Anomaly Detection', value: 8, color: '#ef4444' }
  ]

  // Expanded recent activity data
  const recentActivity = [
    { id: 1, action: 'New CDR file uploaded - 2.3MB', time: '2 minutes ago', type: 'upload', details: 'CDR_Data_Jan2024.xlsx' },
    { id: 2, action: 'Pattern analysis completed for IPDR session data', time: '15 minutes ago', type: 'analysis', details: '127 patterns identified' },
    { id: 3, action: 'Suspect movement tracking initiated', time: '32 minutes ago', type: 'search', details: 'Phone: +91-9876543210' },
    { id: 4, action: 'Anomaly detected in IPDR data', time: '1 hour ago', type: 'alert', details: 'Unusual data usage pattern' },
    { id: 5, action: 'CDR analysis export completed', time: '1 hour ago', type: 'export', details: 'Report_CDR_Analysis_2024.pdf' },
    { id: 6, action: 'New search query executed', time: '2 hours ago', type: 'search', details: 'Location: Mumbai Central' },
    { id: 7, action: 'IPDR file processing completed', time: '2 hours ago', type: 'upload', details: 'IPDR_Sessions_Q1.xlsx' },
    { id: 8, action: 'User access granted to Detective Smith', time: '3 hours ago', type: 'access', details: 'Read-only permissions' },
    { id: 9, action: 'Data fusion analysis started', time: '4 hours ago', type: 'analysis', details: 'Correlating CDR and IPDR data' },
    { id: 10, action: 'Metadata registry updated', time: '5 hours ago', type: 'system', details: '45 new entries added' },
    { id: 11, action: 'Session anomaly detection completed', time: '6 hours ago', type: 'analysis', details: '3 anomalies found' },
    { id: 12, action: 'Bulk CDR upload initiated', time: '7 hours ago', type: 'upload', details: '12 files queued for processing' }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'upload': return <Upload className="h-4 w-4 text-blue-500" />
      case 'analysis': return <BarChart3 className="h-4 w-4 text-green-500" />
      case 'search': return <Search className="h-4 w-4 text-purple-500" />
      case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'access': return <Users className="h-4 w-4 text-orange-500" />
      case 'export': return <FileText className="h-4 w-4 text-indigo-500" />
      case 'system': return <Database className="h-4 w-4 text-gray-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityBadgeColor = (type) => {
    switch (type) {
      case 'upload': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      case 'analysis': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      case 'search': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
      case 'alert': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      case 'access': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
      case 'export': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 h-full overflow-auto">
      {/* Updated KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Uploads</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,456</div>
            <p className="text-xs text-muted-foreground">892 this week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Data processing accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>File Processing Trends</CardTitle>
            <p className="text-sm text-muted-foreground">CDR and IPDR file processing over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fileProcessingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cdr" fill="#3b82f6" name="CDR Files" />
                <Bar dataKey="ipdr" fill="#10b981" name="IPDR Files" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Analysis Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Types of analysis performed on digital evidence</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analysisData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analysisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expanded Recent Activity - Full Width */}
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <p className="text-sm text-muted-foreground">Latest system activities and data processing events</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium leading-tight">{activity.action}</p>
                    <Badge className={`text-xs ${getActivityBadgeColor(activity.type)} shrink-0`}>
                      {activity.type}
                    </Badge>
                  </div>
                  {activity.details && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">{activity.details}</p>
                  )}
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

