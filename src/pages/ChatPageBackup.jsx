import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { sendMessageToOpenAI, analyzeFileWithOpenAI } from '@/utils/openai'
import { queryNeo4jDatabase } from '@/utils/neo4j'
import fileUploadService from '@/services/fileUploadService'
import agenticService from '@/services/agenticService'
import { 
  Send, 
  Paperclip, 
  Mic, 
  Search, 
  Users, 
  TrendingUp,
  Upload,
  Loader2,
  Sparkles,
  Zap,
  HardDrive,
  Cloud,
  X,
  Database,
  ChevronUp,
  ChevronDown,
  Brain,
  Bot,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello, I am your Personal AI Assistant with advanced investigation capabilities! How can I help you today?',
      timestamp: new Date()
    }
  ])
  const [conversationHistory, setConversationHistory] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [messageAnimations, setMessageAnimations] = useState({})
  const [inputFocused, setInputFocused] = useState(false)
  const [showFileOptions, setShowFileOptions] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  
  // Agentic system state
  const [agenticMode, setAgenticMode] = useState(false)
  const [awaitingFollowup, setAwaitingFollowup] = useState(false)
  const [followupQuestions, setFollowupQuestions] = useState([])
  const [followupAnswers, setFollowupAnswers] = useState({})
  const [agenticHealthy, setAgenticHealthy] = useState(false)
  
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const inputRef = useRef(null)
  const textareaRefs = useRef({})

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check agentic service health on component mount
  // useEffect(() => {
  //   const checkAgenticHealth = async () => {
  //     const healthy = await agenticService.checkHealth()
  //     setAgenticHealthy(healthy)
  //     if (healthy) {
  //       console.log('✅ Agentic investigation system is available')
  //     } else {
  //       console.log('⚠️ Agentic investigation system is not available')
  //     }
  //   }
    
  //   checkAgenticHealth()
  // }, [])

  const handleFileUpload = async (files) => {
    const filesArray = Array.from(files)
    
    // Validate files before upload
    const validFiles = []
    const invalidFiles = []
    
    for (const file of filesArray) {
      const validation = fileUploadService.validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        invalidFiles.push({ file, error: validation.error })
      }
    }
    
    // Show validation errors
    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, error }) => {
        addMessage('ai', `❌ **${file.name}**: ${error}`)
      })
    }
    
    if (validFiles.length === 0) {
      return
    }
    
    // Create UI file objects for progress tracking
    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'uploading',
      progress: 0
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Add message about file upload
    const fileNames = validFiles.map(f => f.name).join(', ')
    addMessage('user', `📁 Uploading files: ${fileNames}`)
    
    try {
      // Check API health first
      const isHealthy = await fileUploadService.checkHealth()
      if (!isHealthy) {
        throw new Error('API server is not available. Please make sure the FastAPI server is running on port 8000.')
      }
      
      // Upload files to FastAPI backend
      setIsTyping(true)
      const uploadResult = await fileUploadService.uploadFiles(validFiles)
      setIsTyping(false)

      // Update file progress to completed
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'completed', progress: 100 }))
      )
      
      // Process results and show messages
      let successCount = 0
      let errorCount = 0
      
      for (const result of uploadResult.results) {
        if (result.status === 'success') {
          successCount++
          
          // Show success message based on file type
          let message = `✅ **${result.filename}** processed successfully!\n\n`
          
          if (result.type === 'pdf') {
            message += '📄 **PDF Analysis Complete**: You can now ask questions about this document.'
          } else if (result.type === 'csv') {
            message += '📊 **CSV Data Processed**: Data has been analyzed and inserted into the database.'
          } else if (result.type === 'excel') {
            message += '📈 **Excel Data Processed**: Spreadsheet data has been analyzed and inserted into the database.'
          } else if (result.type === 'word') {
            message += '📝 **Word Document Processed**: Tables and data have been extracted and processed.'
          }
          
          if (result.result && result.result.records_inserted) {
            message += `\n\n📊 **Records Inserted**: ${result.result.records_inserted}`
          }
          
          addMessage('ai', message)
        } else {
          errorCount++
          addMessage('ai', `❌ **${result.filename}**: ${result.message}`)
        }
      }
      
      // Summary message
    setTimeout(() => {
        addMessage('ai', `📋 **Upload Summary**: ${successCount} files processed successfully, ${errorCount} errors.\n\nYou can now ask questions about the uploaded files or query the database for insights!`)
    }, 1000)
      
      // Remove files from display after completion
      setTimeout(() => {
        setUploadedFiles(prev => prev.filter(f => f.status !== 'completed'))
      }, 3000)
      
    } catch (error) {
      setIsTyping(false)
      console.error('File upload error:', error)
      
      // Update file status to error
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'error', progress: 0 }))
      )
      
      addMessage('ai', `❌ **Upload Failed**: ${error.message}\n\n💡 **Troubleshooting**:\n• Make sure the FastAPI server is running: \`python api_server.py\`\n• Check that the server is accessible at http://localhost:8000\n• Verify your file types are supported (PDF, CSV, Excel, Word)`)
      
      // Remove failed files after a delay
      setTimeout(() => {
        setUploadedFiles([])
      }, 5000)
    }
  }

  const simulateUpload = (fileObj) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5 // Variable progress for more realistic feel
      if (progress > 100) progress = 100
      
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === fileObj.id 
            ? { ...f, progress: Math.round(progress), status: progress === 100 ? 'completed' : 'uploading' }
            : f
        )
      )
      
      if (progress >= 100) {
        clearInterval(interval)
        // Remove file from display after completion
        setTimeout(() => {
          setUploadedFiles(prev => prev.filter(f => f.id !== fileObj.id))
        }, 2000)
      }
    }, 150)
  }

  const handleLocalFileUpload = () => {
    fileInputRef.current?.click()
    setShowFileOptions(false)
  }

  const handleGDriveUpload = () => {
    addMessage('ai', '🔗 Google Drive integration coming soon! For now, please download files from Google Drive and upload them directly.')
    setShowFileOptions(false)
  }

  const addMessage = (type, content, metadata = {}) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      ...metadata
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Add entrance animation
    setMessageAnimations(prev => ({
      ...prev,
      [newMessage.id]: 'entering'
    }))
    
    // Remove animation class after animation completes
    setTimeout(() => {
      setMessageAnimations(prev => {
        const newState = { ...prev }
        delete newState[newMessage.id]
        return newState
      })
    }, 600)
  }

  // Handle follow-up answers
  const handleFollowupAnswer = useCallback((questionIndex, answer) => {
    // Store the currently focused element
    const activeElement = document.activeElement
    const isTextarea = activeElement && activeElement.tagName === 'TEXTAREA'
    const activeTextareaId = isTextarea ? activeElement.id : null
    
    setFollowupAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
    
    // Restore focus after state update
    if (isTextarea && activeTextareaId) {
      setTimeout(() => {
        const textarea = document.getElementById(activeTextareaId)
        if (textarea) {
          textarea.focus()
          // Restore cursor position to the end
          textarea.setSelectionRange(textarea.value.length, textarea.value.length)
        }
      }, 0)
    }
  }, [])

  // Submit follow-up answers
  const submitFollowupAnswers = async () => {
    const answers = followupQuestions.map((question, index) => 
      `Q: ${question}\nA: ${followupAnswers[index] || 'Not answered'}`
    ).join('\n\n')
    
    setAwaitingFollowup(false)
    setFollowupQuestions([])
    setFollowupAnswers({})
    
    // Continue the investigation with follow-up answers
    await handleAgenticInvestigation(answers, true)
  }

  // Handle agentic investigation
  const handleAgenticInvestigation = async (query, isContinuation = false) => {
    console.log('🚀 [ChatPage] Starting agentic investigation:', query)
    
    if (!isContinuation) {
      addMessage('user', query)
    }
    
    setIsTyping(true)

    try {
      let result
      if (isContinuation) {
        result = await agenticService.continueInvestigation(query)
      } else {
        result = await agenticService.startInvestigation(query)
      }

      setIsTyping(false)
      
      const formattedResponse = agenticService.formatAgenticResponse(result)
      
      if (formattedResponse.type === 'followup') {
        // Need follow-up questions - re-enable input for follow-up answers
        setAwaitingFollowup(true)
        setFollowupQuestions(formattedResponse.followups)
        addMessage('ai', formattedResponse.message, { type: 'agentic_followup' })
        
      } else if (formattedResponse.type === 'completed') {
        // Investigation completed
        setAwaitingFollowup(false)
        setFollowupQuestions([])
        setFollowupAnswers({})
        addMessage('ai', formattedResponse.message, { type: 'agentic_result' })
        
      } else if (formattedResponse.type === 'rejected') {
        // Query rejected by LLM
        setAwaitingFollowup(false)
        setFollowupQuestions([])
        setFollowupAnswers({})
        addMessage('ai', formattedResponse.message, {
          type: 'agentic_rejected'
        })
        
      } else {
        // Error or other status
        setAwaitingFollowup(false)
        setFollowupQuestions([])
        setFollowupAnswers({})
        addMessage('ai', formattedResponse.message, { type: 'agentic_error' })
      }

    } catch (error) {
      setIsTyping(false)
      setAwaitingFollowup(false)
      setFollowupQuestions([])
      setFollowupAnswers({})
      console.error('❌ [ChatPage] Agentic investigation failed:', error)
      
      addMessage('ai', `❌ **Investigation Failed**\n\n${error.message}\n\n💡 **Troubleshooting:**\n• Make sure the agentic API server is running on port 8002\n• Run: \`python agentic_api.py\`\n• Check the agentic API health at http://localhost:8002/api/health`, {
        type: 'agentic_error'
      })
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue
    setInputValue('')

    console.log('🔍 [ChatPage] Processing message:', userMessage)
    console.log('🔍 [ChatPage] Agentic system healthy:', agenticHealthy)

    // Maintain focus on input after clearing
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    // If agentic system is available, always try it first - let the LLM decide
    if (agenticHealthy) {
      console.log('🧠 [ChatPage] Sending to agentic system for LLM decision')
      await handleAgenticInvestigation(userMessage)
      return
    }

    // Fallback to OpenAI if agentic system is not available
    console.log('🤖 [ChatPage] Agentic system unavailable, using OpenAI fallback')
    addMessage('user', userMessage)
    setIsTyping(true)

    try {
      const aiResponse = await sendMessageToOpenAI(userMessage, conversationHistory)
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: aiResponse }
      ])
      
      setIsTyping(false)
      addMessage('ai', aiResponse)
    } catch (error) {
      setIsTyping(false)
      console.error('Message handling error:', error)
      addMessage('ai', '🔧 I\'m having trouble processing your request right now. This could be due to AI service issues. Please try again in a moment.')
    }
  }

  const handleQuickAction = (action) => {
    const actions = {
      'analyze': 'Analyze phone number 9876543210 for suspicious call patterns in the last month',
      'track': 'Track movement patterns for suspect between Mumbai and Delhi in January 2024',
      'patterns': 'Find communication network for phone number 9876543210 focusing on frequent contacts',
      'database': 'Show me what data is available in the database'
    }
    
    setInputValue(actions[action])
    
    // Add subtle animation to the input
    setInputFocused(true)
    setTimeout(() => setInputFocused(false), 300)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  // Follow-up Questions Component
  const FollowupQuestionsCard = useMemo(() => {
    if (!awaitingFollowup || followupQuestions.length === 0) return null

    return (
      <Card className="mx-6 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
              Additional Information Needed
            </h3>
          </div>
          
          <div className="space-y-4">
            {followupQuestions.map((question, index) => {
              const textareaId = `followup-textarea-${index}`
              return (
                <div key={`question-${index}`} className="space-y-2">
                  <label htmlFor={textareaId} className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    {index + 1}. {question}
                  </label>
                  <Textarea
                    id={textareaId}
                    key={`followup-${index}`}
                    placeholder="Your answer..."
                    value={followupAnswers?.[index] || ''}
                    onChange={(e) => handleFollowupAnswer(index, e.target.value)}
                    className="min-h-[60px] bg-white dark:bg-gray-800 border-yellow-300 dark:border-yellow-700"
                    autoComplete="off"
                  />
                </div>
              )
            })}
            
            <Button 
              onClick={submitFollowupAnswers}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={Object.keys(followupAnswers).length === 0}
            >
              <Brain className="w-4 h-4 mr-2" />
              Continue Investigation
            </Button>
          </div>
        </div>
      </Card>
    )
  }, [awaitingFollowup, followupQuestions, followupAnswers, handleFollowupAnswer])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted dark:from-background dark:to-card relative overflow-hidden">
      {/* Indian Naval Academy Background Image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <img 
          src="/png-clipart-indian-naval-academy-government-of-india-ministry-of-defence-national-defence-academy-golden-pillars-miscellaneous-white.png"
          alt="Indian Naval Academy"
          className="w-96 h-96 object-contain opacity-5 dark:opacity-5"
        />
      </div>

      {/* Agentic System Status Bar */}
      <div className="px-6 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium">Agentic Investigation System</span>
            <Badge variant={agenticHealthy ? "default" : "destructive"} className="text-xs">
              {agenticHealthy ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <X className="w-3 h-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>
          
          {agenticHealthy && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Advanced investigation capabilities enabled
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 p-6 overflow-hidden relative z-10">
        <ScrollArea className="h-full">
          <div className="space-y-6 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${
                  messageAnimations[message.id] === 'entering' 
                    ? 'animate-in slide-in-from-bottom-4 fade-in-0 duration-500' 
                    : ''
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    message.type === 'user'
                      ? 'bg-[#92A1AB] text-white shadow-[#92A1AB]/30 dark:shadow-[#92A1AB]/20'
                      : message.type === 'agentic_result'
                      ? 'bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white shadow-green-200 dark:shadow-green-700/50 border border-green-200/50 dark:border-green-700/50'
                      : message.type === 'agentic_status'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white shadow-blue-200 dark:shadow-blue-700/50 border border-blue-200/50 dark:border-blue-700/50'
                      : message.type === 'agentic_rejected'
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-gray-900 dark:text-white shadow-orange-200 dark:shadow-orange-700/50 border border-orange-200/50 dark:border-orange-700/50'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-gray-200 dark:shadow-gray-700/50 border border-gray-200/50 dark:border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'agentic_result' && <Brain className="w-5 h-5 mt-1 text-green-600 dark:text-green-400 flex-shrink-0" />}
                    {message.type === 'agentic_status' && <Zap className="w-5 h-5 mt-1 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                    {message.type === 'agentic_rejected' && <X className="w-5 h-5 mt-1 text-orange-600 dark:text-orange-400 flex-shrink-0" />}
                    
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      <p className={`text-xs mt-3 ${
                        message.type === 'user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[#92A1AB] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#92A1AB] rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-[#92A1AB] rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {agenticMode ? 'Running investigation...' : 'Querying database & AI...'}
                  </span>
                  <div className="flex items-center gap-1">
                    {agenticMode ? (
                      <Brain className="h-4 w-4 text-blue-500 animate-pulse" />
                    ) : (
                      <>
                        <Database className="h-4 w-4 text-[#1A1455] animate-pulse" />
                        <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Follow-up Questions Card */}
      {FollowupQuestionsCard}

      {/* File Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm relative z-10">
          <div className="space-y-3 animate-in slide-in-from-bottom-4 fade-in-0 duration-500">
            {uploadedFiles.map((fileObj) => (
              <Card key={fileObj.id} className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="truncate font-medium flex-1 mr-3">{fileObj.file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      fileObj.status === 'completed' 
                        ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50' 
                        : 'text-[#92A1AB] bg-[#92A1AB]/10 dark:text-[#92A1AB] dark:bg-[#92A1AB]/20'
                    }`}>
                      {fileObj.status === 'completed' ? '✅ Completed' : `⏳ ${fileObj.progress}%`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadedFile(fileObj.id)}
                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {fileObj.status === 'uploading' && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#92A1AB] to-[#7F7F80] h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                      style={{ width: `${fileObj.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm relative z-10 overflow-hidden transition-all duration-500 ease-in-out">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Actions</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="p-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 transition-all duration-300 hover:scale-110 active:scale-95 rounded-lg"
          >
            {showQuickActions ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-300" />
            )}
          </Button>
        </div>
        
        {showQuickActions && (
          <div className="pb-4 animate-in slide-in-from-top-2 fade-in-0 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('analyze')}
                className="flex items-center gap-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 border-[#92A1AB]/30 hover:border-[#92A1AB] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Search className="h-4 w-4" />
                <span className="text-xs">Analyze Files</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('track')}
                className="flex items-center gap-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 border-[#92A1AB]/30 hover:border-[#92A1AB] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Track Movement</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('patterns')}
                className="flex items-center gap-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 border-[#92A1AB]/30 hover:border-[#92A1AB] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Users className="h-4 w-4" />
                <span className="text-xs">Find Patterns</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction('database')}
                className="flex items-center gap-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 border-[#92A1AB]/30 hover:border-[#92A1AB] transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Database className="h-4 w-4" />
                <span className="text-xs">Query Database</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.csv,.xlsx,.xls,.docx,.doc"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={agenticHealthy ? "Ask me to investigate patterns, analyze data, or track suspicious activity..." : "Type your message..."}
                className={`pr-24 transition-all duration-300 ${
                  inputFocused 
                    ? 'ring-2 ring-[#92A1AB]/50 border-[#92A1AB] shadow-lg' 
                    : 'hover:border-[#92A1AB]/50'
                } bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm`}
                disabled={awaitingFollowup}
              />
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileOptions(!showFileOptions)}
                  className="h-8 w-8 p-0 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 transition-all duration-300 hover:scale-110 active:scale-95"
                  disabled={isTyping}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!inputValue.trim() || awaitingFollowup}
                  className="h-8 w-8 p-0 bg-[#92A1AB] hover:bg-[#7F7F80] text-white transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Options */}
        {showFileOptions && (
          <div className="mt-4 p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLocalFileUpload}
                className="flex items-center gap-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 border-[#92A1AB]/30 hover:border-[#92A1AB] transition-all duration-300"
              >
                <HardDrive className="h-4 w-4" />
                Local Files
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGDriveUpload}
                className="flex items-center gap-2 hover:bg-[#92A1AB]/10 dark:hover:bg-[#92A1AB]/20 border-[#92A1AB]/30 hover:border-[#92A1AB] transition-all duration-300"
              >
                <Cloud className="h-4 w-4" />
                Google Drive
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>Supports PDF, CSV, Excel, Word documents</span>
          {agenticHealthy && (
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              <span>Advanced investigation mode active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage

