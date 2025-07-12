import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  X
} from 'lucide-react'

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI assistant for digital evidence analysis. You can upload files using the attachment button, ask questions about your investigations, or use the quick actions below to get started.',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [messageAnimations, setMessageAnimations] = useState({})
  const [inputFocused, setInputFocused] = useState(false)
  const [showFileOptions, setShowFileOptions] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'uploading',
      progress: 0
    }))
    
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // Simulate file upload with enhanced animations
    newFiles.forEach(fileObj => {
      simulateUpload(fileObj)
    })

    // Add message about file upload with animation
    const fileNames = Array.from(files).map(f => f.name).join(', ')
    addMessage('user', `📁 Uploaded files: ${fileNames}`)
    
    setTimeout(() => {
      addMessage('ai', `✨ I've received ${files.length} file(s). I can help you analyze CDR records, IPDR sessions, and other digital evidence. What would you like to know about these files?`)
    }, 1000)
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
    // Simulate Google Drive integration
    addMessage('user', '☁️ Connecting to Google Drive...')
    setTimeout(() => {
      addMessage('ai', '🔗 Google Drive integration is coming soon! For now, please use local file upload to analyze your CDR and IPDR files.')
    }, 1000)
    setShowFileOptions(false)
  }

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
    
    // Add animation state for new message
    setMessageAnimations(prev => ({
      ...prev,
      [newMessage.id]: 'entering'
    }))
    
    // Remove animation state after animation completes
    setTimeout(() => {
      setMessageAnimations(prev => {
        const newState = { ...prev }
        delete newState[newMessage.id]
        return newState
      })
    }, 600)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    addMessage('user', inputValue)
    setInputValue('')
    setIsTyping(true)

    // Enhanced AI response simulation with varied responses
    const responses = [
      '🔍 Analyzing your query... Let me examine the available data patterns.',
      '📊 Processing investigation data... I\'ll provide insights based on your evidence.',
      '🎯 Understanding your request... Searching through digital evidence for relevant information.',
      '⚡ Examining data correlations... I\'ll help you uncover important patterns.',
      '🔬 Investigating your query... Let me analyze the evidence and provide actionable insights.'
    ]
    
    setTimeout(() => {
      setIsTyping(false)
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      addMessage('ai', randomResponse)
    }, 1200 + Math.random() * 800) // Variable response time
  }

  const handleQuickAction = (action) => {
    const actions = {
      'analyze': '🔍 Please analyze the uploaded files for patterns and anomalies',
      'track': '📍 Show me movement patterns for suspects in the data',
      'patterns': '🕸️ Find communication patterns and frequent contacts'
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/5 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/5 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/3 rounded-full animate-ping delay-2000"></div>
      </div>

      {/* Chat Messages Area - Removed drag and drop functionality */}
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
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-200 dark:shadow-blue-900/50'
                      : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white shadow-gray-200 dark:shadow-gray-700/50 border border-gray-200/50 dark:border-gray-700/50'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-3 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI is analyzing...</span>
                  <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>



      {/* Quick Actions */}
      <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="flex gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('analyze')}
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
          >
            <Search className="h-4 w-4" />
            Analyze Files
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('track')}
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 hover:bg-green-50 hover:border-green-300 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
          >
            <Users className="h-4 w-4" />
            Track Movement
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('patterns')}
            className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200/50 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-md active:scale-95"
          >
            <TrendingUp className="h-4 w-4" />
            Find Patterns
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm relative z-10">
        <div className={`flex items-center gap-4 transition-all duration-300 ${
          inputFocused ? 'transform scale-[1.02]' : ''
        }`}>
          {/* Enhanced File Upload Button with Simple Popup */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFileOptions(!showFileOptions)}
              className="p-3 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 hover:scale-110 active:scale-95 rounded-xl"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            {showFileOptions && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
                <div className="p-2 space-y-1">
                  <button
                    onClick={handleLocalFileUpload}
                    className="w-full flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200 cursor-pointer rounded-lg text-left"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm">Upload from Device</span>
                  </button>
                  <button
                    onClick={handleGDriveUpload}
                    className="w-full flex items-center gap-3 p-3 hover:bg-green-50 dark:hover:bg-green-900/50 transition-all duration-200 cursor-pointer rounded-lg text-left"
                  >
                    <Cloud className="h-4 w-4" />
                    <span className="text-sm">Google Drive</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your investigation data..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              className={`border-0 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm shadow-lg rounded-xl py-3 px-4 transition-all duration-300 ${
                inputFocused ? 'shadow-xl ring-2 ring-blue-500/50' : ''
              }`}
            />
            {inputValue && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-3 hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-110 active:scale-95 rounded-xl"
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 rounded-xl ${
              inputValue.trim() ? 'hover:scale-105 hover:shadow-lg active:scale-95' : ''
            }`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls,.pdf,.docx,.doc"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ChatPage

