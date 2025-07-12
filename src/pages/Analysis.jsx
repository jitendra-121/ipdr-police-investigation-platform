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
      <div className="space-y-6">
        {/* Tool Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${tool.color}`}>
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tool.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analysis Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Analysis Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={analysisParams.timeRange} onValueChange={(value) => 
                  setAnalysisParams(prev => ({ ...prev, timeRange: value }))
                }>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="location">Location Filter</Label>
                <Input
                  id="location"
                  placeholder="Enter location or tower ID"
                  value={analysisParams.location}
                  onChange={(e) => 
                    setAnalysisParams(prev => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  value={analysisParams.phoneNumber}
                  onChange={(e) => 
                    setAnalysisParams(prev => ({ ...prev, phoneNumber: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button 
                onClick={() => runAnalysis(tool.id)}
                disabled={isAnalyzing}
                className="flex-1 md:flex-none"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Config
              </Button>
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tool-Specific Interface */}
        {renderToolInterface(tool)}

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockResults
                .filter(result => result.type === tool.id)
                .map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.type === 'movement' && <MapPin className="h-5 w-5 text-blue-500" />}
                        {result.type === 'anomaly' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {result.type === 'patterns' && <Phone className="h-5 w-5 text-green-500" />}
                        <h4 className="font-medium">{result.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'completed' ? 'default' : 'secondary'}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">{result.description}</p>
                    <p className="text-sm text-gray-500 mb-3">{result.details}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Confidence:</span>
                        <Progress value={result.confidence} className="w-20" />
                        <span className="text-sm text-gray-600">{result.confidence}%</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
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
          <Card className="mt-8">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <MapPin className="h-6 w-6" />
                Suspect Movement Tracking Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Method A: Single Search Field */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <h4 className="font-semibold mb-4 flex items-center gap-3 text-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                  Method A: Quick Search
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Search by Name, Phone Number, or ID</Label>
                    <Input 
                      placeholder="Enter name, phone number, or ID" 
                      className="h-12 text-base"
                    />
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Method B: Route Analysis */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
                <h4 className="font-semibold mb-4 flex items-center gap-3 text-lg">
                  <Route className="h-5 w-5 text-green-600" />
                  Method B: Route Analysis
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">From Town/City</Label>
                      <Select>
                        <SelectTrigger className="h-12 text-base">
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
                      <Label className="text-sm font-medium mb-2 block">To Town/City</Label>
                      <Select>
                        <SelectTrigger className="h-12 text-base">
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
                    className="w-full h-12 text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                  >
                    <Route className="h-5 w-5 mr-2" />
                    Find Numbers Between Cities
                  </Button>
                </div>
              </div>

              {/* Method C: Location/Number Filter */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-purple-50/50 to-violet-50/50 dark:from-purple-900/20 dark:to-violet-900/20">
                <h4 className="font-semibold mb-4 flex items-center gap-3 text-lg">
                  <Filter className="h-5 w-5 text-purple-600" />
                  Method C: Location/Number Filter
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Location (Optional)</Label>
                      <Input 
                        placeholder="Enter location or area" 
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">If filled: Shows all numbers in this location</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Phone Number (Optional)</Label>
                      <Input 
                        placeholder="Enter phone number" 
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">If filled: Shows all places this number was present</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                      <strong>Note:</strong> Fill either Location OR Phone Number, not both. The system will search based on whichever field you provide.
                    </p>
                  </div>
                  <Button 
                    className="w-full h-12 text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Apply Filter
                  </Button>
                </div>
              </div>

              {/* Search Results Section */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-900/20 dark:to-slate-900/20">
                <h4 className="font-semibold mb-4 flex items-center gap-3 text-lg">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  Search Results
                </h4>
                <div className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-base">Run a search using any of the methods above to see results</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'anomaly':
        return (
          <Card className="mt-8">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Zap className="h-6 w-6" />
                Session Anomaly Detection Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Configuration Section */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20">
                <h4 className="font-semibold mb-4 flex items-center gap-3 text-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                  Configuration
                </h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Search by Location</Label>
                      <Input 
                        placeholder="Enter location name or coordinates" 
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Shows all anomalies detected in this location
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Search by Phone Number</Label>
                      <Input 
                        placeholder="Enter phone number" 
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Shows all anomalies for this specific number
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Anomaly Types</Label>
                    <Select>
                      <SelectTrigger className="h-12 text-base">
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
                    className="w-full h-12 text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Detect Anomalies
                  </Button>
                </div>
              </div>

              {/* Detection Interface Section */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-900/20 dark:to-pink-900/20">
                <h4 className="font-semibold mb-4 flex items-center gap-3 text-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Detection Interface
                </h4>
                <div className="space-y-4">
                  {/* Mock Anomaly Results */}
                  <div className="space-y-4">
                    <div className="border rounded-xl p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-base mb-2">Unusual Data Usage Pattern</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Phone: +91-9876543210 | Location: Mumbai Central
                          </p>
                          <p className="text-sm text-gray-500">
                            Detected: 300% increase in data usage on Jan 15, 2024
                          </p>
                        </div>
                        <Badge variant="destructive" className="text-sm px-3 py-1">High</Badge>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-base mb-2">Abnormal Call Frequency</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Phone: +91-9876543211 | Location: Delhi NCR
                          </p>
                          <p className="text-sm text-gray-500">
                            Detected: 50+ calls in 2-hour window on Jan 14, 2024
                          </p>
                        </div>
                        <Badge variant="default" className="text-sm px-3 py-1">Medium</Badge>
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-base mb-2">Location Pattern Anomaly</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Phone: +91-9876543212 | Location: Bangalore
                          </p>
                          <p className="text-sm text-gray-500">
                            Detected: Unusual movement pattern on Jan 13, 2024
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-sm px-3 py-1">Low</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Call Pattern Analysis Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Pattern Analysis</h4>
                  <div className="space-y-3">
                    <div>
                      <Label>Analysis Focus</Label>
                      <Select>
                        <SelectTrigger>
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
                      <Label>Minimum Connections</Label>
                      <Input type="number" defaultValue="3" />
                    </div>
                    <div>
                      <Label>Pattern Strength</Label>
                      <Slider defaultValue={[60]} max={100} min={20} step={5} />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Visualization</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="network-graph" defaultChecked />
                      <Label htmlFor="network-graph">Network Graph</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="timeline-chart" />
                      <Label htmlFor="timeline-chart">Timeline Chart</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="frequency-chart" defaultChecked />
                      <Label htmlFor="frequency-chart">Frequency Chart</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'fusion':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Data Fusion Interface
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium">Data Sources</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['CDR Records', 'IPDR Sessions', 'FIR Reports', 'Location Data'].map((source) => (
                    <div key={source} className="flex items-center gap-2">
                      <input type="checkbox" id={source} defaultChecked />
                      <Label htmlFor={source} className="text-sm">{source}</Label>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <Label>Correlation Method</Label>
                    <Select>
                      <SelectTrigger>
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
                    <Label>Fusion Algorithm</Label>
                    <Select>
                      <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>
        )

      case 'custom':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Custom Query Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Analysis Type</Label>
                    <Select>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select>
                      <SelectTrigger>
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

                <div className="space-y-4">
                  <Label>Custom Filters</Label>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-2">
                      <Select>
                        <SelectTrigger className="w-32">
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
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Value" className="flex-1" />
                      <Button variant="outline" size="sm">
                        Add Filter
                      </Button>
                    </div>
                  </div>
                </div>
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
      <div className="p-6 h-full overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analysis Tools</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Select an analysis tool from the sidebar to get started with your investigation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisTools.map((tool) => {
              const Icon = tool.icon
              return (
                <Card key={tool.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tool.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {tool.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      {tool.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Target className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={() => window.location.href = `/analysis?tool=${tool.id}`}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
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
    <div className="p-6 h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      {renderToolSpecificView()}
    </div>
  )
}

export default Analysis

