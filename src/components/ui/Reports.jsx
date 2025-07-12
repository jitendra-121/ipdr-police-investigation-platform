import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Download, 
  Eye, 
  Share, 
  Filter,
  Search,
  Calendar,
  User,
  Shield,
  Archive,
  Printer,
  Mail
} from 'lucide-react'

const Reports = () => {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'library'
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const reports = [
    {
      id: 'RPT-2024-001',
      title: 'CDR Analysis Report - Fraud Case',
      type: 'analysis',
      status: 'completed',
      createdDate: '2024-01-15',
      createdBy: 'Detective Smith',
      caseId: 'CASE-2024-001',
      size: '2.4 MB',
      format: 'PDF',
      classification: 'Confidential'
    },
    {
      id: 'RPT-2024-002',
      title: 'IPDR Session Summary Q1 2024',
      type: 'summary',
      status: 'completed',
      createdDate: '2024-01-14',
      createdBy: 'Analyst Johnson',
      caseId: 'CASE-2024-002',
      size: '1.8 MB',
      format: 'Excel',
      classification: 'Internal'
    },
    {
      id: 'RPT-2024-003',
      title: 'Movement Pattern Analysis',
      type: 'analysis',
      status: 'draft',
      createdDate: '2024-01-16',
      createdBy: 'Detective Brown',
      caseId: 'CASE-2024-003',
      size: '3.1 MB',
      format: 'PDF',
      classification: 'Secret'
    },
    {
      id: 'RPT-2024-004',
      title: 'Evidence Chain Documentation',
      type: 'evidence',
      status: 'completed',
      createdDate: '2024-01-13',
      createdBy: 'Officer Davis',
      caseId: 'CASE-2024-001',
      size: '856 KB',
      format: 'Word',
      classification: 'Confidential'
    }
  ]

  const auditTrail = [
    {
      id: 1,
      action: 'Report Generated',
      reportId: 'RPT-2024-001',
      user: 'Detective Smith',
      timestamp: '2024-01-15 14:30:00',
      details: 'CDR Analysis Report created for Case-2024-001'
    },
    {
      id: 2,
      action: 'Report Downloaded',
      reportId: 'RPT-2024-001',
      user: 'Supervisor Wilson',
      timestamp: '2024-01-15 16:45:00',
      details: 'Report downloaded for review'
    },
    {
      id: 3,
      action: 'Report Shared',
      reportId: 'RPT-2024-002',
      user: 'Analyst Johnson',
      timestamp: '2024-01-14 11:20:00',
      details: 'Report shared with investigation team'
    },
    {
      id: 4,
      action: 'Evidence Added',
      reportId: 'RPT-2024-004',
      user: 'Officer Davis',
      timestamp: '2024-01-13 09:15:00',
      details: 'Digital evidence added to chain of custody'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Secret': return 'bg-red-100 text-red-800'
      case 'Confidential': return 'bg-orange-100 text-orange-800'
      case 'Internal': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'analysis': return <FileText className="h-4 w-4 text-blue-500" />
      case 'summary': return <Archive className="h-4 w-4 text-green-500" />
      case 'evidence': return <Shield className="h-4 w-4 text-red-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.caseId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="p-8 h-full overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      <Tabs value={activeTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="library" className="transition-all duration-300 hover:scale-105 active:scale-95">Reports Library</TabsTrigger>
          <TabsTrigger value="export" className="transition-all duration-300 hover:scale-105 active:scale-95">Export Options</TabsTrigger>
          <TabsTrigger value="audit" className="transition-all duration-300 hover:scale-105 active:scale-95">Audit Trail</TabsTrigger>
          <TabsTrigger value="evidence" className="transition-all duration-300 hover:scale-105 active:scale-95">Evidence Chain</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports by title or case ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="evidence">Evidence</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(report.type)}
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>ID: {report.id}</span>
                            <span>•</span>
                            <span>Case: {report.caseId}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                        <Badge className={getClassificationColor(report.classification)}>
                          {report.classification}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {report.createdBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.createdDate}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 text-center">
                  <FileText className="h-12 w-12 text-red-500 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">PDF Export</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Generate professional PDF reports with charts and analysis
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <Archive className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">Excel Export</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Export data tables and analysis results to Excel format
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as Excel
                  </Button>
                </div>

                <div className="border rounded-lg p-4 text-center">
                  <FileText className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-medium mb-2">JSON Export</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Export raw data and metadata in JSON format for integration
                  </p>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <h4 className="font-medium mb-3">Bulk Export Options</h4>
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Selected
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Reports
                  </Button>
                  <Button variant="outline">
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Reports
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditTrail.map((entry) => (
                  <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{entry.action}</h4>
                      <span className="text-sm text-gray-500">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{entry.details}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Report: {entry.reportId}</span>
                      <span>•</span>
                      <span>User: {entry.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Chain Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Digital Evidence Chain</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Track the complete chain of custody for digital evidence
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Evidence ID</Label>
                      <Input placeholder="Enter evidence ID" />
                    </div>
                    <div>
                      <Label>Case Number</Label>
                      <Input placeholder="Enter case number" />
                    </div>
                  </div>
                  <Button className="mt-4">
                    <Search className="h-4 w-4 mr-2" />
                    Search Evidence
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Digital Signatures</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    Verify digital signatures and document integrity
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Signature
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Certificate
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reports

