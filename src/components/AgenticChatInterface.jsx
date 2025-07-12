import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { 
  MessageCircle, 
  Brain, 
  Database, 
  Network, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Send,
  Bot,
  User,
  Clock,
  Zap
} from 'lucide-react';

const AgenticChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('');
  const [progress, setProgress] = useState(0);
  const [conversationId, setConversationId] = useState(null);
  const [awaitingFollowup, setAwaitingFollowup] = useState(false);
  const [followupQuestions, setFollowupQuestions] = useState([]);
  const [investigationResults, setInvestigationResults] = useState(null);
  
  const messagesEndRef = useRef(null);
  const API_BASE_URL = 'http://localhost:8002';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add message to chat
  const addMessage = (role, content, metadata = {}) => {
    const message = {
      id: Date.now(),
      role, // 'user' | 'assistant' | 'system'
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  // Add system status message
  const addSystemMessage = (content, phase = '', type = 'info') => {
    addMessage('system', content, { phase, type });
  };

  // Phase indicators
  const PhaseIndicator = ({ phase, isActive, isComplete }) => {
    const getPhaseInfo = (phase) => {
      switch(phase) {
        case 'converser':
          return { icon: MessageCircle, label: 'Query Refinement', color: 'bg-blue-500' };
        case 'translation':
          return { icon: Brain, label: 'Query Translation', color: 'bg-purple-500' };
        case 'execution':
          return { icon: Database, label: 'Data Retrieval', color: 'bg-green-500' };
        case 'consolidation':
          return { icon: Layers, label: 'Context Fusion', color: 'bg-orange-500' };
        default:
          return { icon: Zap, label: 'Processing', color: 'bg-gray-500' };
      }
    };

    const { icon: Icon, label, color } = getPhaseInfo(phase);
    
    return (
      <div className={`flex items-center space-x-2 p-2 rounded-lg ${
        isActive ? 'bg-blue-50 border-2 border-blue-200' : 
        isComplete ? 'bg-green-50 border-2 border-green-200' : 
        'bg-gray-50 border-2 border-gray-200'
      }`}>
        <div className={`p-2 rounded-full ${color} ${isActive ? 'animate-pulse' : ''}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={`text-sm font-medium ${
          isActive ? 'text-blue-700' : 
          isComplete ? 'text-green-700' : 
          'text-gray-500'
        }`}>
          {label}
        </span>
        {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
        {isActive && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
      </div>
    );
  };

  // Message component
  const MessageBubble = ({ message }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    
    if (isSystem) {
      return (
        <div className="flex justify-center my-2">
          <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-md">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{message.content}</span>
            </div>
          </div>
        </div>
      );
    }

    // Helper function to render content with code blocks
    const renderContent = (content) => {
      if (typeof content !== 'string') {
        return JSON.stringify(content, null, 2);
      }
      
      // Simple markdown-like rendering for code blocks and bold text
      const parts = content.split(/(\*\*.*?\*\*|```[\s\S]*?```)/);
      
      return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('```') && part.endsWith('```')) {
          // Code block
          const lines = part.slice(3, -3).split('\n');
          const language = lines[0].trim();
          const code = lines.slice(1).join('\n');
          
          return (
            <div key={index} className="my-2">
              {language && (
                <div className="bg-gray-200 px-2 py-1 text-xs font-mono rounded-t border">
                  {language}
                </div>
              )}
              <pre className={`bg-gray-800 text-green-400 p-3 rounded-b text-xs overflow-x-auto font-mono ${
                !language ? 'rounded' : ''
              }`}>
                <code>{code}</code>
              </pre>
            </div>
          );
        } else {
          // Regular text
          return <span key={index}>{part}</span>;
        }
      });
    };

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-[85%] rounded-lg p-4 ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="flex items-start space-x-2">
            {!isUser && <Bot className="w-5 h-5 mt-1 text-gray-500" />}
            {isUser && <User className="w-5 h-5 mt-1 text-blue-100" />}
            <div className="flex-1">
              <div className="text-sm whitespace-pre-wrap">
                {renderContent(message.content)}
              </div>
              <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Follow-up questions component
  const FollowupQuestions = ({ questions, onAnswer }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});

    const handleAnswerChange = (questionIndex, answer) => {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionIndex]: answer
      }));
    };

    const handleSubmitAnswers = () => {
      const answers = questions.map((question, index) => 
        `Q: ${question}\nA: ${selectedAnswers[index] || 'Not answered'}`
      ).join('\n\n');
      
      onAnswer(answers);
    };

    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span>Additional Information Needed</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {index + 1}. {question}
                </label>
                <Textarea
                  placeholder="Your answer..."
                  value={selectedAnswers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            ))}
            <Button 
              onClick={handleSubmitAnswers}
              className="w-full"
              disabled={Object.keys(selectedAnswers).length === 0}
            >
              Submit Answers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Investigation results component
  const InvestigationResults = ({ results }) => {
    if (!results || !results.consolidated_context) return null;

    const context = results.consolidated_context;
    
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Investigation Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Query Context</h4>
              <p className="text-sm text-gray-600">{context.query_context}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Key Insights</h4>
              <div className="space-y-2">
                {context.consolidated_data.key_insights?.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge variant="outline" className="mt-1">{index + 1}</Badge>
                    <span className="text-sm text-gray-600">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Data Quality</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Coverage</span>
                    <span className="text-sm font-medium">{context.data_quality.coverage_percentage}%</span>
                  </div>
                  <Progress value={context.data_quality.coverage_percentage} className="h-2" />
                  <Badge variant={
                    context.data_quality.confidence_level === 'high' ? 'default' :
                    context.data_quality.confidence_level === 'medium' ? 'secondary' : 'destructive'
                  }>
                    {context.data_quality.confidence_level} confidence
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Execution Summary</h4>
                <div className="text-sm space-y-1">
                  <div>SQL Queries: {results.sql_queries?.length || 0}</div>
                  <div>Cypher Queries: {results.cypher_queries?.length || 0}</div>
                  <div>Total Rows: {results.execution_summary?.sql_execution?.total_rows || 0}</div>
                  <div>Graph Nodes: {results.execution_summary?.cypher_execution?.total_nodes || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Main investigation function
  const runInvestigation = async (query) => {
    console.log(`🚀 [AgenticChat] Starting investigation: "${query}"`);
    
    setIsProcessing(true);
    setProgress(0);
    setCurrentPhase('converser');
    setAwaitingFollowup(false);
    setFollowupQuestions([]);
    setInvestigationResults(null);
    
    addMessage('user', query);
    addSystemMessage('🧠 Starting agentic investigation...', 'converser');
    
    try {
      // Call the full investigation pipeline
      const response = await fetch(`${API_BASE_URL}/api/investigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query,
          conversation_id: conversationId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🎯 [AgenticChat] Investigation result:', result);
      
      if (result.status === 'awaiting_clarification') {
        // Need more information
        setProgress(25);
        setAwaitingFollowup(true);
        setFollowupQuestions(result.converser_response.followups);
        setConversationId(result.converser_response.conversation_id);
        
        addMessage('assistant', 'I need some additional information to provide a thorough analysis:', {
          phase: 'converser',
          type: 'followup'
        });
        
        addSystemMessage('⏸️ Awaiting additional details...', 'converser');
        
      } else if (result.status === 'completed') {
        // Show SQL and Cypher queries that were generated
        setProgress(50);
        setCurrentPhase('translation');
        
        // Display SQL queries
        if (result.sql_queries && result.sql_queries.length > 0) {
          addMessage('assistant', `📊 **SQL Queries Generated** (${result.sql_queries.length} queries):\n\n` + 
            result.sql_queries.map((query, i) => 
              `**${i + 1}. ${query.purpose}**\n\`\`\`sql\n${query.sql}\n\`\`\``
            ).join('\n\n'), {
            phase: 'sql_translation',
            type: 'queries'
          });
        }
        
        // Display Cypher queries  
        if (result.cypher_queries && result.cypher_queries.length > 0) {
          addMessage('assistant', `🕸️ **Cypher Queries Generated** (${result.cypher_queries.length} queries):\n\n` + 
            result.cypher_queries.map((query, i) => 
              `**${i + 1}. ${query.purpose}**\n\`\`\`cypher\n${query.cypher}\n\`\`\``
            ).join('\n\n'), {
            phase: 'cypher_translation', 
            type: 'queries'
          });
        }
        
        // Show execution progress
        setProgress(75);
        setCurrentPhase('execution');
        addSystemMessage('🔍 Executing queries and analyzing data...', 'execution');
        
        // Simulate brief delay for execution visualization
        setTimeout(() => {
          setProgress(100);
          setCurrentPhase('completed');
          setConversationId(result.conversation_id);
          setInvestigationResults(result);
          
          addMessage('assistant', 'Investigation completed successfully! Here are the results:', {
            phase: 'completed',
            type: 'success'
          });
          
          addSystemMessage('🎉 Investigation completed successfully!', 'completed');
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ [AgenticChat] Investigation failed:', error);
      addMessage('assistant', `Investigation failed: ${error.message}`, {
        phase: 'error',
        type: 'error'
      });
      addSystemMessage('❌ Investigation failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('');
    }
  };

  // Handle follow-up answers
  const handleFollowupAnswer = (answer) => {
    console.log(`🔄 [AgenticChat] Submitting follow-up answer: "${answer}"`);
    
    setAwaitingFollowup(false);
    setFollowupQuestions([]);
    
    // Continue the investigation with the follow-up answer
    runInvestigation(answer);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentQuery.trim() || isProcessing) return;
    
    const query = currentQuery;
    setCurrentQuery('');
    
    runInvestigation(query);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <span>Agentic Investigation Platform</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Advanced AI-powered investigation system with multi-phase analysis
          </p>
        </CardHeader>
      </Card>

      {/* Progress Indicator */}
      {isProcessing && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Investigation Progress</span>
                <span className="text-sm text-gray-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              <div className="grid grid-cols-4 gap-2">
                <PhaseIndicator 
                  phase="converser" 
                  isActive={currentPhase === 'converser'} 
                  isComplete={progress > 25} 
                />
                <PhaseIndicator 
                  phase="translation" 
                  isActive={currentPhase === 'translation'} 
                  isComplete={progress > 50} 
                />
                <PhaseIndicator 
                  phase="execution" 
                  isActive={currentPhase === 'execution'} 
                  isComplete={progress > 75} 
                />
                <PhaseIndicator 
                  phase="consolidation" 
                  isActive={currentPhase === 'consolidation'} 
                  isComplete={progress === 100} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-96 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">Start an Investigation</p>
                <p className="text-sm">Ask me to analyze CDR, IPDR, or any investigation query</p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Follow-up Questions */}
      {awaitingFollowup && followupQuestions.length > 0 && (
        <div className="mt-4">
          <FollowupQuestions 
            questions={followupQuestions} 
            onAnswer={handleFollowupAnswer}
          />
        </div>
      )}

      {/* Investigation Results */}
      {investigationResults && (
        <div className="mt-4">
          <InvestigationResults results={investigationResults} />
        </div>
      )}

      {/* Input Area */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="Enter your investigation query (e.g., 'Analyze phone number 9876543210 for suspicious activity')"
              disabled={isProcessing || awaitingFollowup}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!currentQuery.trim() || isProcessing || awaitingFollowup}
              className="px-6"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentQuery("Analyze phone number 9876543210 for call patterns in January 2024")}
              disabled={isProcessing || awaitingFollowup}
            >
              Sample CDR Query
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentQuery("Track internet activity for user ID 12345 last week")}
              disabled={isProcessing || awaitingFollowup}
            >
              Sample IPDR Query
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentQuery("Find movement patterns for suspect between Mumbai and Delhi")}
              disabled={isProcessing || awaitingFollowup}
            >
              Sample Movement Query
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgenticChatInterface; 