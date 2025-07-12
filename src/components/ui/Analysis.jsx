import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  Search,
  Play,
  Save,
  Share,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Filter,
  Settings,
  Target,
  Activity,
  Zap,
  Network,
  Route
} from 'lucide-react'

const Analysis = () => {
  const [searchParams] = useSearchParams()
  const activeTool = searchParams.get('tool') || 'overview'
  
  const [analysisParams, setAnalysisParams] = useState({
    timeRange: '7',
    threshold: [50],
    location: '',
    phoneNumber: ''
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analysisTools = [
    {
      id: 'movement',
      title: 'Suspect Movement Tracking',
      icon: Users,
      description: 'Track and visualize suspect movement patterns using tower data',
      color: 'bg-blue-100 text-blue-800',
      features: ['GPS Tracking', 'Tower Analysis', 'Route Mapping', 'Pattern Detection']
    },
    {
      id: 'anomaly',
      title: 'Session Anomaly Detection',
      icon: TrendingUp,
      description: 'Detect unusual patterns in communication and data usage',
      color: 'bg-green-100 text-green-800',
      features: ['Behavioral Analysis', 'Usage Patterns', 'Outlier Detection', 'Trend Analysis']
    },
    {
      id: 'patterns',
      title: 'Call Pattern Analysis',
      icon: BarChart3,
      description: 'Analyze communication patterns and frequent contacts',
      color: 'bg-purple-100 text-purple-800',
      features: ['Contact Networks', 'Frequency Analysis', 'Time Patterns', 'Communication Clusters']
    },
    {
      id: 'fusion',
      title: 'Data Fusion & Correlation',
      icon: Layers,
      description: 'Correlate data across multiple sources and time periods',
      color: 'bg-orange-100 text-orange-800',
      features: ['Multi-source Analysis', 'Cross-referencing', 'Data Correlation', 'Timeline Sync']
    },
    {
      id: 'custom',
      title: 'Custom Analysis Builder',
      icon: Search,
      description: 'Build custom analysis queries with visual interface',
      color: 'bg-red-100 text-red-800',
      features: ['Query Builder', 'Custom Filters', 'Advanced Search', 'Template Library']
    }
  ]

  const mockResults = [
    {
      id: 1,
      type: 'movement',
      title: 'Suspect Movement Pattern',
      description: 'Detected frequent movement between Tower A and Tower B',
      confidence: 85,
      timestamp: '2024-01-16 14:30',
      details: 'Pattern shows regular movement every Tuesday and Thursday',
      status: 'completed'
    },
    {
      id: 2,
      type: 'anomaly',
      title: 'Unusual Data Usage',
      description: 'Spike in data usage detected on January 15th',
      confidence: 92,
      timestamp: '2024-01-16 12:15',
      details: '300% increase in normal data consumption',
      status: 'completed'
    },
    {
      id: 3,
      type: 'patterns',
      title: 'Communication Cluster',
      description: 'Identified group of 5 frequently communicating numbers',
      confidence: 78,
      timestamp: '2024-01-16 10:45',
      details: 'High frequency calls between 9 PM - 11 PM daily',
      status: 'processing'
    }
  ]

  const runAnalysis = (toolId) => {
    setIsAnalyzing(true)
    console.log(`Running ${toolId} analysis with params:`, analysisParams)
    // Simulate analysis execution
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 3000)
  }

  const getCurrentTool = () => {
    return analysisTools.find(tool => tool.id === activeTool) || analysisTools[0]
  }

  const renderToolSpecificView = () => {
    const tool = getCurrentTool()
    const Icon = tool.icon

    return (
      <div className="space-y-8">
        {/* Tool Header */}
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-xl ${tool.color} shadow-md`}>
                <Icon className="h-10 w-10" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{tool.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{tool.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {tool.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <Target className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Configuration */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Settings className="h-6 w-6" />
              Analysis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="timeRange" className="text-sm font-semibold">Time Range</Label>
                <Select value={analysisParams.timeRange} onValueChange={(value) => 
                  setAnalysisParams(prev => ({ ...prev, timeRange: value }))
                }>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-sm font-semibold">Location Filter</Label>
                <Input
                  id="location"
                  placeholder="Enter location or tower ID"
                  value={analysisParams.location}
                  onChange={(e) => 
                    setAnalysisParams(prev => ({ ...prev, location: e.target.value }))
                  }
                  className="h-12"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phoneNumber" className="text-sm font-semibold">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={analysisParams.phoneNumber}
                  onChange={(e) => 
                    setAnalysisParams(prev => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                onClick={() => runAnalysis(tool.id)}
                disabled={isAnalyzing}
                className="flex-1 md:flex-none h-12 px-8 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-5 w-5 mr-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-3" />
                    Run Analysis
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                className="h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
              >
                <Save className="h-5 w-5 mr-2" />
                Save Config
              </Button>
              <Button 
                variant="outline"
                className="h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
              >
                <Share className="h-5 w-5 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tool-Specific Interface */}
        {renderToolInterface(tool)}

        {/* Recent Results */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BarChart3 className="h-6 w-6" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mockResults
                .filter(result => result.type === tool.id)
                .map((result) => (
                  <div key={result.id} className="border rounded-xl p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {result.type === 'movement' && <MapPin className="h-6 w-6 text-blue-500" />}
                        {result.type === 'anomaly' && <AlertTriangle className="h-6 w-6 text-red-500" />}
                        {result.type === 'patterns' && <Phone className="h-6 w-6 text-green-500" />}
                        <h4 className="font-semibold text-lg">{result.title}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={result.status === 'completed' ? 'default' : 'secondary'} className="px-3 py-1">
                          {result.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-base">{result.description}</p>
                    <p className="text-sm text-gray-500 mb-4">{result.details}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold">Confidence:</span>
                        <Progress value={result.confidence} className="w-24" />
                        <span className="text-sm text-gray-600 font-medium">{result.confidence}%</span>
                      </div>
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-md"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderToolInterface = (tool) => {
    switch (tool.id) {
      case 'movement':
        return (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <MapPin className="h-7 w-7" />
                Suspect Movement Tracking Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Method A: Single Search Field */}
              <div className="border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-8 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30">
                <h4 className="font-bold mb-6 flex items-center gap-4 text-xl">
                  <Search className="h-6 w-6 text-blue-600" />
                  Method A: Quick Search
                </h4>
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Search by Name, Phone Number, or ID</Label>
                    <Input 
                      placeholder="Enter name, phone number, or ID" 
                      className="h-14 text-base border-2 focus:border-blue-500"
                    />
                  </div>
                  <Button 
                    className="w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                  >
                    <Search className="h-5 w-5 mr-3" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Method B: Route Analysis */}
              <div className="border-2 border-green-200 dark:border-green-800 rounded-2xl p-8 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30">
                <h4 className="font-bold mb-6 flex items-center gap-4 text-xl">
                  <Route className="h-6 w-6 text-green-600" />
                  Method B: Route Analysis
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">From Town/City</Label>
                      <Select>
                        <SelectTrigger className="h-14 text-base border-2 focus:border-green-500">
                          <SelectValue placeholder="Select starting location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="bangalore">Bangalore</SelectItem>
                          <SelectItem value="chennai">Chennai</SelectItem>
                          <SelectItem value="kolkata">Kolkata</SelectItem>
                          <SelectItem value="hyderabad">Hyderabad</SelectItem>
                          <SelectItem value="pune">Pune</SelectItem>
                          <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">To Town/City</Label>
                      <Select>
                        <SelectTrigger className="h-14 text-base border-2 focus:border-green-500">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mumbai">Mumbai</SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="bangalore">Bangalore</SelectItem>
                          <SelectItem value="chennai">Chennai</SelectItem>
                          <SelectItem value="kolkata">Kolkata</SelectItem>
                          <SelectItem value="hyderabad">Hyderabad</SelectItem>
                          <SelectItem value="pune">Pune</SelectItem>
                          <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                  >
                    <Route className="h-5 w-5 mr-3" />
                    Find Numbers Between Cities
                  </Button>
                </div>
              </div>

              {/* Method C: Location/Number Filter */}
              <div className="border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-8 bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-900/30 dark:to-violet-900/30">
                <h4 className="font-bold mb-6 flex items-center gap-4 text-xl">
                  <Filter className="h-6 w-6 text-purple-600" />
                  Method C: Location/Number Filter
                </h4>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Location (Optional)</Label>
                      <Input 
                        placeholder="Enter location or area" 
                        className="h-14 text-base border-2 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">If filled: Shows all numbers in this location</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Phone Number (Optional)</Label>
                      <Input 
                        placeholder="Enter phone number" 
                        className="h-14 text-base border-2 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">If filled: Shows all places this number was present</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold">
                      <strong>Note:</strong> Fill either Location OR Phone Number, not both. The system will search based on whichever field you provide.
                    </p>
                  </div>
                  <Button 
                    className="w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                  >
                    <Filter className="h-5 w-5 mr-3" />
                    Apply Filter
                  </Button>
                </div>
              </div>

              {/* Search Results Section */}
              <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 bg-gradient-to-r from-gray-50/80 to-slate-50/80 dark:from-gray-900/30 dark:to-slate-900/30">
                <h4 className="font-bold mb-6 flex items-center gap-4 text-xl">
                  <BarChart3 className="h-6 w-6 text-gray-600" />
                  Search Results
                </h4>
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Run a search using any of the methods above to see results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'anomaly':
        return (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Zap className="h-7 w-7" />
                Session Anomaly Detection Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10">
              {/* Configuration Section */}
              <div className="border-2 border-orange-200 dark:border-orange-800 rounded-2xl p-8 bg-gradient-to-r from-orange-50/80 to-red-50/80 dark:from-orange-900/30 dark:to-red-900/30">
                <h4 className="font-bold mb-6 flex items-center gap-4 text-xl">
                  <Settings className="h-6 w-6 text-orange-600" />
                  Configuration
                </h4>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Search by Location</Label>
                      <Input 
                        placeholder="Enter location name or coordinates" 
                        className="h-14 text-base border-2 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Shows all anomalies detected in this location
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Search by Phone Number</Label>
                      <Input 
                        placeholder="Enter phone number" 
                        className="h-14 text-base border-2 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Shows all anomalies for this specific number
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Anomaly Types</Label>
                    <Select>
                      <SelectTrigger className="h-14 text-base border-2 focus:border-orange-500">
                        <SelectValue placeholder="Select anomaly type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usage">Data Usage Anomalies</SelectItem>
                        <SelectItem value="frequency">Call Frequency Anomalies</SelectItem>
                        <SelectItem value="location">Location Anomalies</SelectItem>
                        <SelectItem value="timing">Timing Anomalies</SelectItem>
                        <SelectItem value="all">All Types</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full h-14 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                  >
                    <Search className="h-5 w-5 mr-3" />
                    Detect Anomalies
                  </Button>
                </div>
              </div>

              {/* Detection Interface Section */}
              <div className="border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 bg-gradient-to-r from-red-50/80 to-pink-50/80 dark:from-red-900/30 dark:to-pink-900/30">
                <h4 className="font-bold mb-6 flex items-center gap-4 text-xl">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  Detection Interface
                </h4>
                <div className="space-y-6">
                  {/* Mock Anomaly Results */}
                  <div className="space-y-6">
                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-bold text-lg mb-3">Unusual Data Usage Pattern</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Phone: +91-9876543210 | Location: Mumbai Central
                          </p>
                          <p className="text-sm text-gray-500">
                            Detected: 300% increase in data usage on Jan 15, 2024
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-sm px-4 py-2">High</Badge>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-bold text-lg mb-3">Abnormal Call Frequency</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Phone: +91-9876543211 | Location: Delhi NCR
                          </p>
                          <p className="text-sm text-gray-500">
                            Detected: 50+ calls in 2-hour window on Jan 14, 2024
                          </p>
                        </div>
                        <Badge variant="default" className="text-sm px-4 py-2">Medium</Badge>
                      </div>
                    </div>

                    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 cursor-pointer hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-bold text-lg mb-3">Location Pattern Anomaly</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Phone: +91-9876543212 | Location: Bangalore
                          </p>
                          <p className="text-sm text-gray-500">
                            Detected: Unusual movement pattern on Jan 13, 2024
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-sm px-4 py-2">Low</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-8">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                      <strong>Note:</strong> Click on any anomaly above to automatically investigate and view detailed analysis.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'patterns':
        return (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Network className="h-7 w-7" />
                Call Pattern Analysis Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-bold text-lg">Pattern Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Analysis Focus</Label>
                      <Select>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select focus area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frequency">Call Frequency</SelectItem>
                          <SelectItem value="duration">Call Duration</SelectItem>
                          <SelectItem value="timing">Call Timing</SelectItem>
                          <SelectItem value="network">Network Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Minimum Connections</Label>
                      <Input type="number" defaultValue="3" className="h-12" />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">Pattern Strength</Label>
                      <Slider defaultValue={[60]} max={100} min={20} step={5} className="mt-4" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="font-bold text-lg">Visualization</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <input type="checkbox" id="network-graph" defaultChecked className="w-4 h-4" />
                      <Label htmlFor="network-graph" className="font-medium">Network Graph</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <input type="checkbox" id="timeline-chart" className="w-4 h-4" />
                      <Label htmlFor="timeline-chart" className="font-medium">Timeline Chart</Label>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <input type="checkbox" id="frequency-chart" defaultChecked className="w-4 h-4" />
                      <Label htmlFor="frequency-chart" className="font-medium">Frequency Chart</Label>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Generate Pattern Analysis
              </Button>
            </CardContent>
          </Card>
        )

      case 'fusion':
        return (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Layers className="h-7 w-7" />
                Data Fusion Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <h4 className="font-bold text-lg">Data Sources</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {['CDR Records', 'IPDR Sessions', 'FIR Reports', 'Location Data'].map((source) => (
                    <div key={source} className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <input type="checkbox" id={source} defaultChecked className="w-4 h-4" />
                      <Label htmlFor={source} className="text-sm font-medium">{source}</Label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Correlation Method</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temporal">Temporal Correlation</SelectItem>
                        <SelectItem value="spatial">Spatial Correlation</SelectItem>
                        <SelectItem value="behavioral">Behavioral Correlation</SelectItem>
                        <SelectItem value="multi">Multi-dimensional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Fusion Algorithm</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weighted">Weighted Average</SelectItem>
                        <SelectItem value="bayesian">Bayesian Fusion</SelectItem>
                        <SelectItem value="neural">Neural Network</SelectItem>
                        <SelectItem value="rule">Rule-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                >
                  <Layers className="h-5 w-5 mr-3" />
                  Start Data Fusion
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      case 'custom':
        return (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-4 text-2xl">
                <Search className="h-7 w-7" />
                Custom Query Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Data Source</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdr">CDR Records</SelectItem>
                        <SelectItem value="ipdr">IPDR Sessions</SelectItem>
                        <SelectItem value="fir">FIR Reports</SelectItem>
                        <SelectItem value="all">All Sources</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Analysis Type</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select analysis type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frequency">Frequency Analysis</SelectItem>
                        <SelectItem value="pattern">Pattern Detection</SelectItem>
                        <SelectItem value="correlation">Correlation Analysis</SelectItem>
                        <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Output Format</Label>
                    <Select>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select output format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Data Table</SelectItem>
                        <SelectItem value="chart">Chart/Graph</SelectItem>
                        <SelectItem value="map">Geographic Map</SelectItem>
                        <SelectItem value="timeline">Timeline View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-6">
                  <Label className="text-sm font-semibold">Custom Filters</Label>
                  <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
                    <div className="flex gap-4">
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone Number</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Value" className="flex-1 h-12" />
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-12 px-6 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        Add Filter
                      </Button>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                >
                  <Search className="h-5 w-5 mr-3" />
                  Build Custom Query
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (activeTool === 'overview' || !activeTool) {
    return (
      <div className="p-8 h-full overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Analysis Tools</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Select an analysis tool from the sidebar to get started with your investigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {analysisTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Card key={tool.id} className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 border-0 shadow-lg">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl ${tool.color} shadow-md`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="space-y-3">
                      {tool.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <Target className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => window.location.href = `/analysis?tool=${tool.id}`}
                      className="w-full h-12 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
                    >
                      <Play className="h-5 w-5 mr-3" />
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full overflow-auto bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {renderToolSpecificView()}
    </div>
  )
}

export default Analysis

