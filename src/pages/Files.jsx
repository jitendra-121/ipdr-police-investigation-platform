import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Database,
  Tag,
  GitBranch,
  BarChart,
  Shield,
  Search,
  Filter,
  Plus,
  Edit,
  Save
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import fileUploadService from '@/services/fileUploadService'

const Files = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const activeTab = searchParams.get('tab') || 'upload'
  
  const handleTabChange = (value) => {
    navigate(`/files?tab=${value}`)
  }
  
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'CDR_Data_Jan2024.xlsx',
      type: 'excel',
      size: '2.4 MB',
      status: 'completed',
      uploadDate: '2024-01-15',
      records: 15420,
      category: 'CDR',
      source: 'Telecom Provider A',
      quality: 95
    },
    {
      id: 2,
      name: 'IPDR_Sessions_Q1.xlsx',
      type: 'excel',
      size: '5.1 MB',
      status: 'processing',
      uploadDate: '2024-01-16',
      records: 8750,
      category: 'IPDR',
      source: 'ISP Provider B',
      quality: 88
    },
    {
      id: 3,
      name: 'FIR_Report_2024_001.pdf',
      type: 'pdf',
      size: '1.2 MB',
      status: 'completed',
      uploadDate: '2024-01-14',
      records: null,
      category: 'FIR',
      source: 'Police Station',
      quality: 92
    },
    {
      id: 4,
      name: 'Case_Summary_Fraud.docx',
      type: 'word',
      size: '856 KB',
      status: 'error',
      uploadDate: '2024-01-13',
      records: null,
      category: 'Case Summary',
      source: 'Investigation Team',
      quality: 78
    }
  ])

  const [metadataEntries, setMetadataEntries] = useState([
    {
      id: 1,
      field: 'Suspect Phone Number',
      type: 'String',
      description: 'Primary phone number of the suspect',
      required: true,
      format: '+XX-XXXXXXXXXX'
    },
    {
      id: 2,
      field: 'Call Duration',
      type: 'Integer',
      description: 'Duration of call in seconds',
      required: true,
      format: 'Seconds'
    },
    {
      id: 3,
      field: 'Tower Location',
      type: 'Coordinates',
      description: 'GPS coordinates of cell tower',
      required: false,
      format: 'Lat, Long'
    }
  ])

  const onDrop = async (acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: getFileType(file.name),
      size: formatFileSize(file.size),
      status: 'uploading',
      uploadDate: new Date().toISOString().split('T')[0],
      records: null,
      category: 'Unknown',
      source: 'Upload',
      quality: 0
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    try {
      // Send files to document parser API
      const results = []
      
      for (const file of acceptedFiles) {
        try {
          // Validate file first
          const validation = fileUploadService.validateFile(file)
          if (!validation.valid) {
            results.push({
              filename: file.name,
              status: 'error',
              message: validation.error
            })
            continue
          }
          
          // Create form data for this file
          const formData = new FormData()
          formData.append('file', file)
          
          // Send to document parser API
          const response = await fetch('https://documentparserspy-1.onrender.com/parse-data', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const result = await response.json()
          results.push({
            filename: file.name,
            status: 'success',
            data: result,
            message: 'File parsed successfully'
          })
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error)
          results.push({
            filename: file.name,
            status: 'error',
            message: error.message || 'Failed to parse file'
          })
        }
      }
      
      // Update file status based on results
      setUploadedFiles(prev => 
        prev.map(f => {
          const newFile = newFiles.find(nf => nf.id === f.id)
          if (newFile) {
            const result = results.find(r => r.filename === newFile.name)
            if (result) {
              return {
                ...f,
                status: result.status === 'success' ? 'completed' : 'error',
                records: result.data ? Object.keys(result.data).length : null,
                category: newFile.type === 'pdf' ? 'FIR' : 
                         newFile.type === 'excel' ? 'IPDR' : 
                         newFile.type === 'word' ? 'Case Summary' : 'Data',
                quality: result.status === 'success' ? 95 : 0
              }
            }
          }
          return f
        })
      )
      
    } catch (error) {
      console.error('File upload error:', error)
      // Update files to error status
      setUploadedFiles(prev => 
        prev.map(f => 
          newFiles.some(nf => nf.id === f.id) 
            ? { ...f, status: 'error' }
            : f
        )
      )
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: true
  })

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['xlsx', 'xls'].includes(ext)) return 'excel'
    if (ext === 'pdf') return 'pdf'
    if (['docx', 'doc'].includes(ext)) return 'word'
    return 'unknown'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'excel': return <FileSpreadsheet className="h-5 w-5 text-green-600" />
      case 'pdf': return <FileText className="h-5 w-5 text-red-600" />
      case 'word': return <File className="h-5 w-5 text-blue-600" />
      default: return <File className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getQualityColor = (quality) => {
    if (quality >= 90) return 'text-green-600'
    if (quality >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="p-6 h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="library">File Library</TabsTrigger>
          <TabsTrigger value="status">File Status</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="provenance">Provenance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Evidence Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload your files'}
                </h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-400">
                  Supports: Excel (.xlsx, .xls), PDF, Word (.docx, .doc)
                </p>
                <Button className="mt-4">
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported File Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium">Excel Files</h4>
                    <p className="text-sm text-gray-500">CDR, IPDR, Subscriber data</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-8 w-8 text-red-600" />
                  <div>
                    <h4 className="font-medium">PDF Documents</h4>
                    <p className="text-sm text-gray-500">Reports, logs, case files</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <File className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Word Documents</h4>
                    <p className="text-sm text-gray-500">FIR reports, summaries</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>File Library</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input placeholder="Search files..." className="pl-9 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getFileIcon(file.type)}
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.uploadDate}</span>
                          {file.records && (
                            <>
                              <span>•</span>
                              <span>{file.records.toLocaleString()} records</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Processing Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(file.status)}
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-500">Category: {file.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                      {file.status === 'processing' && (
                        <Progress value={65} className="w-32 mt-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Metadata Registry - Search History
                </CardTitle>
                <div className="flex gap-2">
                  <Input placeholder="Search history..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    searchType: 'Suspect Movement',
                    query: 'Phone: +91-9876543210',
                    timestamp: '2024-01-16 14:30:00',
                    results: 127,
                    status: 'completed',
                    location: 'Mumbai - Delhi corridor'
                  },
                  {
                    id: 2,
                    searchType: 'Session Anomaly',
                    query: 'Location: Sector 18, Noida',
                    timestamp: '2024-01-16 13:45:00',
                    results: 23,
                    status: 'completed',
                    location: 'Noida, UP'
                  },
                  {
                    id: 3,
                    searchType: 'Call Pattern Analysis',
                    query: 'Number: +91-8765432109',
                    timestamp: '2024-01-16 12:15:00',
                    results: 89,
                    status: 'completed',
                    location: 'Bangalore region'
                  },
                  {
                    id: 4,
                    searchType: 'Data Fusion',
                    query: 'Cross-reference: Case-2024-001',
                    timestamp: '2024-01-16 11:20:00',
                    results: 156,
                    status: 'completed',
                    location: 'Multi-state'
                  },
                  {
                    id: 5,
                    searchType: 'Suspect Movement',
                    query: 'Route: Gurgaon to Faridabad',
                    timestamp: '2024-01-16 10:30:00',
                    results: 45,
                    status: 'completed',
                    location: 'NCR region'
                  }
                ].map((search) => (
                  <div key={search.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {search.searchType}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          {search.results} results
                        </Badge>
                      </div>
                      <h4 className="font-medium mb-1">{search.query}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {search.timestamp}
                        </span>
                        <span>{search.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quick Access Tips</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Click "View Results" to quickly re-access previous search results</li>
                  <li>• Use the search bar to find specific queries from your history</li>
                  <li>• Export results for offline analysis or reporting</li>
                  <li>• Recent searches are automatically saved for 30 days</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Source Provenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{file.name}</h4>
                      <Badge className={getStatusColor(file.status)}>
                        {file.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Source</Label>
                        <p className="font-medium">{file.source}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Upload Date</Label>
                        <p className="font-medium">{file.uploadDate}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Chain of Custody</Label>
                        <p className="font-medium">Verified</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Data Quality Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{file.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getQualityColor(file.quality)}`}>
                          {file.quality}%
                        </span>
                        <Badge className={getStatusColor(file.status)}>
                          {file.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Data Completeness</span>
                          <span>{file.quality}%</span>
                        </div>
                        <Progress value={file.quality} className="h-2" />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-500">Missing Fields</Label>
                          <p className="font-medium">{Math.floor((100 - file.quality) / 10)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Duplicates</Label>
                          <p className="font-medium">{Math.floor(Math.random() * 5)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-500">Errors</Label>
                          <p className="font-medium">{file.status === 'error' ? '1' : '0'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Files

