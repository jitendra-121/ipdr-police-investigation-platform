// Enhanced ChatPage with AI Agent Analysis System
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { sendMessageToOpenAI } from '@/utils/openai'
import fileUploadService from '@/services/fileUploadService'
import { analyzeWithAgents } from '@/services/investigationAgents'
import agenticService from '@/services/agenticService'
import driver from '@/lib/neo4j'
import * as XLSX from 'xlsx'
import {
  Send, Paperclip, Loader2, X, ChevronUp, ChevronDown, Search, TrendingUp, Users, Database, Phone, MapPin, Clock, Brain, Shield, Download
} from 'lucide-react'

// Function to extract Cypher queries from AI response
function extractCypher(raw) {
  const cypherLines = raw
    .split('\n')
    .filter(
      (line) =>
        line.trim().startsWith('MATCH') ||
        line.trim().startsWith('RETURN') ||
        line.trim().startsWith('WITH') ||
        line.trim().startsWith('CALL') ||
        line.trim().startsWith('MERGE') ||
        line.trim().startsWith('UNWIND') ||
        line.trim().startsWith('CREATE')
    );

  return cypherLines.join('\n');
}

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hi, I am your Personal Assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ])
  const [conversationHistory, setConversationHistory] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [messageAnimations, setMessageAnimations] = useState({})
  const [inputFocused, setInputFocused] = useState(false)
  const [showFileOptions, setShowFileOptions] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [processingStep, setProcessingStep] = useState('')
  const [progressDots, setProgressDots] = useState('')

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)

  // Animated dots for processing indicator
  useEffect(() => {
    let interval;
    if (isTyping) {
      interval = setInterval(() => {
        setProgressDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
    } else {
      setProgressDots('');
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type, content, metadata = {}) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      ...metadata
    }
    setMessages(prev => [...prev, newMessage])
    setMessageAnimations(prev => ({ ...prev, [newMessage.id]: 'entering' }))
    setTimeout(() => {
      setMessageAnimations(prev => {
        const newState = { ...prev }
        delete newState[newMessage.id]
        return newState
      })
    }, 800)
  }

  // AI Agent Analysis System - Replaces old formatter functions
  const displayResultsWithAgents = async (data, originalQuery) => {
    if (data.length === 0) {
      addMessage('ai', 'No results found for your search. The database might be empty or the search criteria are too restrictive.')
      return
    }

    // Show processing message
    const processingMessageId = Date.now()
    addMessage('ai', '🤖 Activating specialized investigation agents for analysis...', { 
      id: processingMessageId,
      isProcessing: true 
    })

    try {
      // Use the new agent system for intelligent analysis
      const agentAnalysis = await analyzeWithAgents(data, originalQuery)
      
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMessageId))
      
      if (agentAnalysis.type === 'agent_analysis') {
        // Display the comprehensive agent analysis
        addMessage('ai', agentAnalysis.content, { 
          isResult: true,
          isAgentAnalysis: true,
          data: data,
          agentResults: agentAnalysis.agentResults,
          queryType: 'agent_analysis'
        })
      } else if (agentAnalysis.type === 'no_data') {
        addMessage('ai', agentAnalysis.content)
      } else {
        // Fallback to basic display if agents fail
        addMessage('ai', agentAnalysis.content)
        displayBasicResults(data)
      }
    } catch (error) {
      console.error('❌ Agent analysis failed:', error)
      // Remove processing message
      setMessages(prev => prev.filter(msg => msg.id !== processingMessageId))
      
      // Fallback to basic display
      addMessage('ai', '🚨 Advanced analysis temporarily unavailable. Showing basic results:')
      displayBasicResults(data)
    }
  }

  // Fallback basic results display
  const displayBasicResults = (data) => {
    let result = '📊 Query Results:\n\n'
    
    data.forEach((record, index) => {
      const entries = Object.entries(record)
      result += `${index + 1}. `
      entries.forEach(([key, value], i) => {
        result += `${key}: ${value}`
        if (i < entries.length - 1) result += ' | '
      })
      result += '\n'
    })
    
    result += `\nTotal records: ${data.length}`
    
    addMessage('ai', result, { 
      isResult: true, 
      data: data,
      queryType: 'basic'
    })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    const userMessage = inputValue
    setInputValue('')
    addMessage('user', userMessage)
    setIsTyping(true)
    setProcessingStep('Processing your investigation request...')
    
    try {
      console.log('🚀 [ChatPage] Starting agentic investigation:', userMessage)
      
      // Check if this should be handled by agentic service
      if (agenticService.isAgenticQuery(userMessage)) {
        console.log('🔍 [ChatPage] Using agentic investigation service')
        setProcessingStep('🧠 Analyzing your query...')
        
        // Start investigation with agentic service
        const result = await agenticService.startInvestigation(userMessage)
        console.log('✅ [ChatPage] Investigation result:', result)
        
        // Format and display the response
        const formattedResponse = agenticService.formatAgenticResponse(result)
        
        if (formattedResponse.type === 'completed') {
          addMessage('ai', formattedResponse.message)
        } else if (formattedResponse.type === 'rejected') {
          addMessage('ai', formattedResponse.message)
        } else if (formattedResponse.type === 'followup') {
          addMessage('ai', formattedResponse.message)
          // Handle follow-up questions if needed
        } else {
          addMessage('ai', `Investigation completed with status: ${result.status}`)
        }
        
      } else {
        // Fallback to simple response
        addMessage('ai', 'I can help you with investigation-related queries. Please ask about phone records, call patterns, or suspect tracking.')
      }

    } catch (error) {
      console.error('❌ [ChatPage] Error:', error)
      addMessage('ai', `Sorry, I couldn't process your request: ${error.message}`)
    } finally {
      setIsTyping(false)
      setProcessingStep('')
    }
  }

  const handleFileUpload = async (files) => {
    const filesArray = Array.from(files)
    const validFiles = filesArray.filter(file => fileUploadService.validateFile(file).valid)
    if (validFiles.length === 0) return
    
    const newFiles = validFiles.map(file => ({ 
      id: Date.now() + Math.random(), 
      file, 
      status: 'uploading', 
      progress: 0 
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
    addMessage('user', `📁 Uploading files: ${validFiles.map(f => f.name).join(', ')}`)

    try {
      // Send files to document parser API
      const results = []
      
      for (const file of validFiles) {
        try {
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
      
      // Update file status to completed
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'completed', progress: 100 })))
      
      // Process results and show messages
      results.forEach(result => {
        if (result.status === 'success') {
          addMessage('ai', `✅ **${result.filename}** parsed successfully!\n\n📊 **Data extracted and ready for analysis.**`)
          
          // If there's structured data, show it
          if (result.data) {
            addMessage('ai', `📋 **Parsed Data Preview**:\n\`\`\`json\n${JSON.stringify(result.data, null, 2).substring(0, 500)}${JSON.stringify(result.data, null, 2).length > 500 ? '...' : ''}\n\`\`\``, { 
              isResult: true, 
              data: result.data 
            })
          }
        } else {
          addMessage('ai', `❌ **${result.filename}**: ${result.message}`)
        }
      })
      
      // Summary message
      const successCount = results.filter(r => r.status === 'success').length
      const errorCount = results.filter(r => r.status === 'error').length
      
      setTimeout(() => {
        addMessage('ai', `📋 **Upload Summary**: ${successCount} files parsed successfully, ${errorCount} errors.\n\nYou can now ask questions about the parsed data!`)
      }, 1000)
      
      // Remove files from display after completion
      setTimeout(() => {
        setUploadedFiles(prev => prev.filter(f => f.status !== 'completed'))
      }, 3000)
      
    } catch (error) {
      console.error('File upload error:', error)
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error', progress: 0 })))
      addMessage('ai', `❌ **Upload Failed**: ${error.message}\n\n💡 **Troubleshooting**:\n• Check your internet connection\n• Verify the document parser service is available\n• Make sure your file types are supported`)
      
      // Remove failed files after a delay
      setTimeout(() => {
        setUploadedFiles([])
      }, 5000)
    }
  }

  const handleQuickAction = (action) => {
    const actions = {
      'analyze': 'Find phone numbers called by multiple people',
      'track': 'Show all parties and their connections',
      'patterns': 'Analyze suspicious communication patterns and behaviors',
      'database': 'What investigation capabilities and data are available?'
    }
    setInputValue(actions[action])
    setInputFocused(true)
    setTimeout(() => setInputFocused(false), 300)
  }

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Function to download raw data as Excel
  const downloadRawData = (data, filename = 'raw_data.xlsx') => {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new()
      
      // Handle different data types
      let worksheetData = []
      
      if (Array.isArray(data)) {
        // If it's an array of objects, use as is
        if (data.length > 0 && typeof data[0] === 'object') {
          worksheetData = data
        } else {
          // If it's an array of primitives, convert to objects
          worksheetData = data.map((item, index) => ({
            'Row': index + 1,
            'Value': item
          }))
        }
      } else if (typeof data === 'object' && data !== null) {
        // If it's a single object, convert to array of key-value pairs
        worksheetData = Object.entries(data).map(([key, value]) => ({
          'Property': key,
          'Value': typeof value === 'object' ? JSON.stringify(value) : value
        }))
      } else {
        // For primitive values, create a simple structure
        worksheetData = [{
          'Data': data
        }]
      }
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)
      
      // Auto-size columns for better readability
      if (worksheet['!ref']) {
        const range = XLSX.utils.decode_range(worksheet['!ref'])
        const columnWidths = []
        
        // Calculate column widths based on content
        for (let col = range.s.c; col <= range.e.c; col++) {
          let maxWidth = 10 // minimum width
          
          for (let row = range.s.r; row <= range.e.r; row++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
            const cell = worksheet[cellAddress]
            
            if (cell && cell.v) {
              const cellLength = cell.v.toString().length
              maxWidth = Math.max(maxWidth, cellLength)
            }
          }
          
          columnWidths.push({ width: Math.min(maxWidth + 2, 50) }) // cap at 50 characters
        }
        
        worksheet['!cols'] = columnWidths
      }
      
      // Add header styling (make headers bold)
      if (worksheet['!ref']) {
        const range = XLSX.utils.decode_range(worksheet['!ref'])
        for (let col = range.s.c; col <= range.e.c; col++) {
          const headerCell = XLSX.utils.encode_cell({ r: 0, c: col })
          if (worksheet[headerCell]) {
            worksheet[headerCell].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "E6F3FF" } }
            }
          }
        }
      }
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Investigation Data')
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, filename)
      
      // Show success message
      console.log('✅ Raw data downloaded as Excel successfully')
    } catch (error) {
      console.error('❌ Failed to download raw data as Excel:', error)
      alert('Failed to download raw data as Excel. Please try again.')
    }
  }

  const renderMessage = (message) => {
    // Agent Analysis Display
    if (message.isAgentAnalysis && message.data) {
      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Agent Analysis Header */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700">AI Investigation Analysis</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          
          {/* Master Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-l-4 border-purple-500 shadow-sm">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line font-medium leading-relaxed">
              {message.content}
            </pre>
          </div>
          
          {/* Individual Agent Results */}
          {message.agentResults && (
            <details className="text-sm group">
              <summary className="cursor-pointer text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200 flex items-center gap-2 font-medium">
                <Brain className="h-4 w-4" />
                Individual Agent Analyses ({Object.keys(message.agentResults).length} agents)
                <ChevronDown className="h-4 w-4" />
              </summary>
              <div className="mt-3 space-y-3 animate-slideDown">
                {Object.entries(message.agentResults).map(([agentType, analysis]) => (
                  <div key={agentType} className="p-3 bg-white dark:bg-gray-800 rounded border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      {agentType === 'communication' && <Phone className="w-4 h-4 text-blue-600" />}
                      {agentType === 'geospatial' && <MapPin className="w-4 h-4 text-green-600" />}
                      {agentType === 'device' && <Database className="w-4 h-4 text-orange-600" />}
                      {agentType === 'ipdr' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                      <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {agentType} Pattern Agent
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {analysis}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
          
          {/* Expandable raw data */}
          <details className="text-xs group">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                View Raw Data ({message.data.length} records)
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  downloadRawData(message.data, `investigation_data_${new Date().toISOString().split('T')[0]}.xlsx`)
                }}
                className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                title="Download Raw Data as Excel"
              >
                <Download className="h-3 w-3" />
                <span className="text-xs">Download</span>
              </button>
            </summary>
            <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 animate-slideDown">
              <pre className="text-gray-600 dark:text-gray-400 text-xs whitespace-pre-wrap">
                {JSON.stringify(message.data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )
    }
    
    // Regular Result Display (fallback)
    if (message.isResult && message.data) {
      return (
        <div className="space-y-4 animate-fadeIn">
          {/* Formatted text display */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line font-medium leading-relaxed">
              {message.content}
            </pre>
          </div>
          
          {/* Expandable raw data (optional) */}
          <details className="text-xs group">
            <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-3 w-3" />
                View Raw Data
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  downloadRawData(message.data, `query_results_${new Date().toISOString().split('T')[0]}.xlsx`)
                }}
                className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors duration-200"
                title="Download Raw Data as Excel"
              >
                <Download className="h-3 w-3" />
                <span className="text-xs">Download</span>
              </button>
            </summary>
            <div className="mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 animate-slideDown">
              <pre className="text-gray-600 dark:text-gray-400 text-xs whitespace-pre-wrap">
                {JSON.stringify(message.data, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )
    }
    
    // Processing Message Display
    if (message.isProcessing) {
      return (
        <div className="flex items-center gap-2 animate-fadeIn">
          <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
          <span className="text-sm text-orange-700 font-medium">{message.content}</span>
        </div>
      )
    }
    
    // Default Message Display
    return <p className="text-sm whitespace-pre-line animate-fadeIn">{message.content}</p>
  }

  return (
    <div 
      className="h-full flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: `url('/png-clipart-indian-naval-academy-government-of-india-ministry-of-defence-national-defence-academy-golden-pillars-miscellaneous-white.png')`,
        backgroundSize: '300px 480px',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'local'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90"></div>
      
      {/* Quick Actions Bar */}
      {showQuickActions && (
        <div className="relative z-10 p-4 border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-md animate-slideDown">
          <div className="flex gap-2 overflow-x-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction('analyze')}
              className="hover:scale-105 transform transition-all duration-200 hover:shadow-md"
            >
              <Search className="h-4 w-4 mr-2" />
              Analyze Calls
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction('track')}
              className="hover:scale-105 transform transition-all duration-200 hover:shadow-md"
            >
              <Users className="h-4 w-4 mr-2" />
              Track Connections
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction('patterns')}
              className="hover:scale-105 transform transition-all duration-200 hover:shadow-md"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Find Patterns
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleQuickAction('database')}
              className="hover:scale-105 transform transition-all duration-200 hover:shadow-md"
            >
              <Database className="h-4 w-4 mr-2" />
              Database Info
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowQuickActions(false)}
              className="hover:scale-105 transform transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 overflow-hidden relative z-10">
        <ScrollArea className="h-full">
          <div className="space-y-6 pb-4">
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-messageSlide`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >                
                <div 
                  className={`
                    px-4 py-3 rounded-xl shadow-lg max-w-[75%] backdrop-blur-md border
                    ${message.type === 'user' 
                      ? 'bg-blue-500/90 text-white border-blue-400 animate-bounceInRight' 
                      : 'bg-white/90 dark:bg-gray-800/90 border-gray-200 dark:border-gray-700 animate-bounceInLeft'
                    }
                    ${messageAnimations[message.id] === 'entering' ? 'animate-pulse scale-105' : ''}
                    hover:shadow-xl transition-all duration-300 hover:scale-102
                  `}
                >
                  {renderMessage(message)}
                  <p className="text-xs mt-1 text-right opacity-70 animate-fadeIn">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-bounceInLeft">
                <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
                      {processingStep}{progressDots}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      
      <div className="px-6 py-4 border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.csv,.xlsx,.xls,.docx,.doc"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className={`
                w-full transition-all duration-300 border-2
                ${inputFocused ? 'border-blue-400 shadow-lg scale-102' : 'border-gray-300'}
                focus:border-blue-500 focus:shadow-xl focus:scale-102
                hover:border-blue-300 hover:shadow-md
              `}
              placeholder="Ask about CDR data... (e.g., 'Find phone numbers called by multiple people')"
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isTyping}
            className="hover:scale-110 transform transition-all duration-200 hover:shadow-lg disabled:hover:scale-100"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 hover:translate-x-1 transition-transform duration-200" />
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="hover:scale-110 transform transition-all duration-200 hover:shadow-lg"
          >
            <Paperclip className="h-4 w-4 hover:rotate-12 transition-transform duration-200" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceInRight {
          from {
            opacity: 0;
            transform: translateX(100px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateX(-10px) scale(1.05);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes bounceInLeft {
          from {
            opacity: 0;
            transform: translateX(-100px) scale(0.8);
          }
          60% {
            opacity: 1;
            transform: translateX(10px) scale(1.05);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-messageSlide {
          animation: messageSlide 0.6s ease-out;
        }

        .animate-bounceInRight {
          animation: bounceInRight 0.8s ease-out;
        }

        .animate-bounceInLeft {
          animation: bounceInLeft 0.8s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        .hover\\:scale-105:hover {
          transform: scale(1.05);
        }

        .hover\\:scale-110:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}

export default ChatPage
