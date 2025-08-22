'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { MessageSquare, Plus, Coins, Send, X, Camera, Download, Zap, FileText, Search, ImageIcon, ChevronDown, Check, LogOut } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { generatePDFReport, PDFReportData } from '@/lib/pdf-utils'
import AgentStatusIndicator from '@/components/chat/AgentStatusIndicator'
import AgentMessage from '@/components/chat/AgentMessage'
import type { AgentType, AgentStatus, AgentResponse } from '@/lib/agents/types'

export default function Dashboard() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [currentConversation, setCurrentConversation] = useState<any>(null)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentProcessingMode, setCurrentProcessingMode] = useState<'chat' | 'analysis' | null>(null)
  const [selectedModel, setSelectedModel] = useState<'gemini-2.0-flash' | 'gemini-2.5-flash'>('gemini-2.0-flash')
  const [dragActive, setDragActive] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  
  // Agent system state
  const [currentAgent, setCurrentAgent] = useState<AgentType | null>(null)
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle')
  const [agentResponses, setAgentResponses] = useState<AgentResponse[]>([])

  const modelCosts = {
    'gemini-2.0-flash': 200,
    'gemini-2.5-flash': 500
  }

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user?.id) return
      
      try {
        const response = await fetch('/api/credits/check')
        const data = await response.json()
        
        if (data.success) {
          setCredits(data.credits)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      } finally {
        setLoadingCredits(false)
      }
    }

    const fetchConversations = async () => {
      if (!user?.id) return
      
      setLoadingConversations(true)
      try {
        const response = await fetch('/api/conversations')
        const data = await response.json()
        
        if (data.success) {
          setConversations(data.conversations || [])
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      } finally {
        setLoadingConversations(false)
      }
    }

    fetchCredits()
    fetchConversations()
  }, [user?.id])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => 
        file.type.startsWith('image/')
      )
      setFiles(prev => [...prev, ...newFiles].slice(0, 3))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      setFiles(prev => [...prev, ...newFiles].slice(0, 3))
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if ((!inputValue.trim() && files.length === 0) || isAnalyzing) return

    // Check credits
    const requiredCredits = modelCosts[selectedModel]
    if (credits !== null && credits < requiredCredits) {
      alert(`Insufficient credits. You need ${requiredCredits} credits but only have ${credits}.`)
      return
    }

    setIsAnalyzing(true)
    
    try {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue,
        images: files.map(f => URL.createObjectURL(f)),
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
      
      // Clear input
      const currentInput = inputValue
      const currentFiles = [...files]
      
      setInputValue('')
      setFiles([])
      
      // Reset agent state
      setCurrentAgent(null)
      setAgentStatus('idle')
      setAgentResponses([])

      // Determine if this is image analysis or text chat
      const hasImages = currentFiles.length > 0
      setCurrentProcessingMode(hasImages ? 'analysis' : 'chat')

      let imageUrls = []
      
      // Upload images if any
      if (hasImages) {
        const formData = new FormData()
        currentFiles.forEach(file => {
          formData.append('files', file)
        })

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload images')
        }

        const { urls } = await uploadResponse.json()
        imageUrls = urls
      }

      // Ensure we have a conversation before processing
      let conversationId = currentConversation?.id
      if (!conversationId) {
        // Create new conversation and get the ID directly
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: currentInput ? currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : '') : 'New Conversation'
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          setCurrentConversation(data.conversation)
          conversationId = data.conversation.id
          
          // Refresh conversations list
          const conversationsResponse = await fetch('/api/conversations')
          const conversationsData = await conversationsResponse.json()
          if (conversationsData.success) {
            setConversations(conversationsData.conversations || [])
          }
        } else {
          throw new Error('Failed to create conversation')
        }
      }

      // let remainingCredits // currently unused

      if (hasImages) {
        // Image Analysis Mode - call /api/analyze
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrls,
            description: currentInput,
            model: selectedModel,
            conversationId,
          }),
        })

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json()
          if (analysisResponse.status === 402) {
            alert(`Insufficient credits. You need ${errorData.requiredCredits} credits but only have ${errorData.currentCredits}.`)
            return
          }
          throw new Error(errorData.error || 'Analysis failed')
        }

        const { analysis, remainingCredits: newCredits } = await analysisResponse.json()
        setCredits(newCredits)

        // Add AI analysis response
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          analysis,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])

      } else {
        // Text Chat Mode - call /api/chat with streaming
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: currentInput,
            model: selectedModel,
            conversationId,
          }),
        })

        if (!chatResponse.ok) {
          const errorData = await chatResponse.json()
          if (chatResponse.status === 402) {
            alert(`Insufficient credits. You need ${errorData.requiredCredits} credits but only have ${errorData.currentCredits}.`)
            return
          }
          throw new Error(errorData.error || 'Chat failed')
        }

        // Create AI message placeholder for streaming
        const aiMessageId = (Date.now() + 1).toString()
        const aiMessage = {
          id: aiMessageId,
          type: 'assistant',
          content: '',
          timestamp: new Date(),
          streaming: true
        }

        setMessages(prev => [...prev, aiMessage])

        // Handle streaming response with agent system
        const reader = chatResponse.body?.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        const currentAgentResults: AgentResponse[] = []

        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    
                    // Handle agent system messages
                    if (data.chunk) {
                      try {
                        const agentData = JSON.parse(data.chunk)
                        
                        if (agentData.type === 'agent_status') {
                          setCurrentAgent(agentData.agentType)
                          setAgentStatus(agentData.status)
                        } else if (agentData.type === 'agent_result') {
                          const agentResponse: AgentResponse = {
                            agentType: agentData.agentType,
                            status: 'success',
                            data: agentData.data,
                            message: agentData.message,
                            timestamp: new Date()
                          }
                          currentAgentResults.push(agentResponse)
                          setAgentResponses(prev => [...prev, agentResponse])
                        } else if (agentData.type === 'chat_start') {
                          // Reset agent state for general chat
                          setCurrentAgent(null)
                          setAgentStatus('idle')
                        } else if (agentData.type === 'chat_chunk') {
                          fullContent += agentData.content
                          setMessages(prev => prev.map(msg => 
                            msg.id === aiMessageId 
                              ? { ...msg, content: fullContent }
                              : msg
                          ))
                        } else if (agentData.type === 'error') {
                          throw new Error(agentData.message)
                        }
                      } catch {
                        // Fallback to regular text streaming
                        fullContent += data.chunk
                        setMessages(prev => prev.map(msg => 
                          msg.id === aiMessageId 
                            ? { ...msg, content: fullContent }
                            : msg
                        ))
                      }
                    }
                    
                    if (data.done) {
                      // Mark streaming as complete and update credits
                      setMessages(prev => prev.map(msg => 
                        msg.id === aiMessageId 
                          ? { 
                              ...msg, 
                              streaming: false,
                              agentResponses: currentAgentResults.length > 0 ? currentAgentResults : undefined
                            }
                          : msg
                      ))
                      setCredits(data.remainingCredits)
                      setCurrentAgent(null)
                      setAgentStatus('idle')
                      setAgentResponses([]) // Clear agent responses after saving to message
                      break
                    }
                    
                    if (data.error) {
                      throw new Error(data.error)
                    }
                  } catch (parseError) {
                    console.error('Failed to parse streaming data:', parseError)
                  }
                }
              }
            }
          } finally {
            reader.releaseLock()
          }
        }
      }

      // Credits are already updated in each mode above

    } catch (error) {
      console.error('Processing failed:', error)
      alert('Processing failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setCurrentProcessingMode(null)
      setCurrentAgent(null)
      setAgentStatus('idle')
    }
  }

  const startNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Conversation'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCurrentConversation(data.conversation)
        setMessages([])
        // Refresh conversations list
        const conversationsResponse = await fetch('/api/conversations')
        const conversationsData = await conversationsResponse.json()
        if (conversationsData.success) {
          setConversations(conversationsData.conversations || [])
        }
      } else {
        console.error('Failed to create conversation:', data.error)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  // Helper function to parse streaming format content
  const parseStreamingContent = (content: string) => {
    if (!content) return { content: '', agentResponses: [] }
    
    // Split by newlines and parse each JSON chunk
    const lines = content.split('\n\n')
    let fullContent = ''
    const agentResponses: AgentResponse[] = []
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line)
          if (parsed.type === 'chat_chunk' && parsed.content) {
            fullContent += parsed.content
          } else if (parsed.type === 'agent_result') {
            agentResponses.push({
              agentType: parsed.agentType,
              status: 'success',
              data: parsed.data,
              message: parsed.message,
              timestamp: new Date()
            })
          }
          // Note: Removed final_response parsing to prevent AI content from being overwritten
        } catch {
          // Skip invalid JSON
        }
      }
    }
    
    return { content: fullContent, agentResponses }
  }

  const selectConversation = async (conversation: any) => {
    try {
      setCurrentConversation(conversation)
      
      // Load messages for this conversation
      const response = await fetch(`/api/conversations/${conversation.id}/messages`)
      const data = await response.json()
      
      if (data.success) {
        // Process messages to parse streaming content
        const processedMessages = data.messages.map((msg: any) => {
          if (msg.message_type === 'assistant' && msg.content) {
            const parsed = parseStreamingContent(msg.content)
            return {
              id: msg.id,
              type: 'assistant',
              content: parsed.content,
              agentResponses: parsed.agentResponses.length > 0 ? parsed.agentResponses : undefined,
              timestamp: new Date(msg.created_at),
              streaming: false
            }
          } else {
            return {
              id: msg.id,
              type: msg.message_type,
              content: msg.content,
              images: msg.images,
              analysis: msg.analysis_data,
              timestamp: new Date(msg.created_at),
              streaming: false
            }
          }
        })
        
        setMessages(processedMessages)
      } else {
        console.error('Failed to load conversation messages:', data.error)
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
      setMessages([])
    }
  }

  const exportToPDF = (analysis: any, userMessage: any) => {
    const pdfData: PDFReportData = {
      analysis,
      userQuestion: userMessage.content,
      additionalInfo: userMessage.additionalInfo,
      images: userMessage.images,
      timestamp: new Date(),
      userName: user?.firstName ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : user?.emailAddresses?.[0]?.emailAddress
    }
    
    generatePDFReport(pdfData)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Please sign in</div>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-50 border-r border-gray-300 flex flex-col transition-all duration-200`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-300">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">CrackCheck</h1>
              </div>
            )}
            {!sidebarOpen && (
              <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
          {sidebarOpen && (
            <button
              onClick={startNewConversation}
              className="w-full mt-3 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          )}
        </div>


        {/* Conversations List */}
        {sidebarOpen && (
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
              {loadingConversations ? (
                <div className="text-sm text-gray-400">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="text-sm text-gray-400">No conversations yet</div>
              ) : (
                <div className="space-y-1">
                  {conversations.slice(0, 10).map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => selectConversation(conversation)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        currentConversation?.id === conversation.id
                          ? 'bg-gray-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="truncate">
                        {conversation.title || `Chat ${new Date(conversation.created_at).toLocaleDateString()}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credits Display */}
        <div className="p-4 border-b border-gray-300">
          <div className={`${sidebarOpen ? 'bg-gray-50' : ''} rounded-md p-3`}>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gray-700" />
              {sidebarOpen && (
                <div>
                  <div className="text-xs text-gray-600">Available Credits</div>
                  <div className="text-lg font-bold text-gray-900">
                    {loadingCredits ? '...' : credits?.toLocaleString() || 0}
                  </div>
                </div>
              )}
            </div>
            {sidebarOpen && credits !== null && credits < 500 && (
              <Link 
                href="/#pricing"
                className="block mt-2 text-xs bg-gray-900 text-white px-2 py-1 rounded-md text-center hover:bg-gray-800"
              >
                Buy Credits
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header with Model Selection */}
        <div className="bg-white">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm transition-colors min-w-[160px] text-left"
                  >
                    {selectedModel === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' : 'Gemini 2.5 Flash'}
                    <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Custom Dropdown */}
                  {showModelDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowModelDropdown(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-20">
                        <button
                          onClick={() => {
                            setSelectedModel('gemini-2.0-flash')
                            setShowModelDropdown(false)
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>Gemini 2.0 Flash</span>
                          {selectedModel === 'gemini-2.0-flash' && <Check className="w-4 h-4 text-gray-600" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModel('gemini-2.5-flash')
                            setShowModelDropdown(false)
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span>Gemini 2.5 Flash</span>
                          {selectedModel === 'gemini-2.5-flash' && <Check className="w-4 h-4 text-gray-600" />}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Exit Dashboard Button */}
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Exit Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto">

          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-2xl mx-auto px-4">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Hello, {user?.firstName || 'User'}!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  I&apos;m your intelligent assistant. I can help you with crack analysis or general conversations.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
                  {/* Image Analysis Mode */}
                  <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Camera className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900">Crack Analysis</h3>
                    </div>
                    <p className="text-blue-800 mb-4">Upload crack images to get professional structural engineering reports</p>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload up to 3 crack photos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Describe crack details and location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        <span>Get detailed risk assessment</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span>Export PDF analysis report</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Mode */}
                  <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900">General Chat</h3>
                    </div>
                    <p className="text-green-800 mb-4">Ask me anything - no images required</p>
                    <div className="space-y-2 text-sm text-green-700">
                      <div className="flex items-center gap-2">
                        <span>💬</span>
                        <span>Ask questions about construction</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🤖</span>
                        <span>Get general AI assistance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📚</span>
                        <span>Learn about structural engineering</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>💡</span>
                        <span>Get advice and recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    💡 <strong>Tip:</strong> Upload images for crack analysis, or just type your question for general chat
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="max-w-6xl mx-auto w-full px-4 py-6">
              {messages.map((message) => (
                <div key={message.id} className="mb-6">
                  {message.type === 'user' ? (
                    // User Message
                    <div className="flex justify-end">
                      <div className="max-w-2xl bg-gray-900 text-white rounded-2xl px-4 py-3">
                        {message.images && message.images.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {message.images.map((img: string, idx: number) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Upload ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {message.content && (
                          <div>
                            <div>{message.content}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // AI Message
                    <div className="flex justify-start">
                      <div className="max-w-5xl bg-white border border-gray-200 rounded-2xl p-6">
                        
                        {message.analysis ? (
                          // Analysis Response
                          <>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Camera className="w-4 h-4 text-gray-700" />
                              </div>
                              <span className="font-medium text-gray-900">Structural Engineer Analysis Report</span>
                            </div>
                            
                            <div className="space-y-4">
                              {/* Risk Level */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  message.analysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                  message.analysis.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {message.analysis.riskLevel === 'high' ? 'High Risk' :
                                   message.analysis.riskLevel === 'moderate' ? 'Moderate Risk' : 'Low Risk'}
                                </span>
                                <span className="text-sm text-gray-600">
                                  (Confidence: {message.analysis.confidence}%)
                                </span>
                              </div>

                              {/* Summary */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                                <p className="text-gray-700">{message.analysis.aiNotes}</p>
                              </div>

                              {/* Detailed Findings */}
                              {message.analysis.findings && message.analysis.findings.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-3">Detailed Findings</h4>
                                  <div className="space-y-3">
                                    {message.analysis.findings.map((finding: any, idx: number) => (
                                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-medium text-gray-900">{finding.type}</h5>
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            finding.severity === 'High' ? 'bg-red-100 text-red-800' :
                                            finding.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                          }`}>
                                            {finding.severity}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                                          <div>Length: {finding.length}</div>
                                          <div>Width: {finding.width}</div>
                                        </div>
                                        <p className="text-sm text-gray-700">{finding.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Recommendations */}
                              {message.analysis.recommendations && message.analysis.recommendations.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                                    {message.analysis.recommendations.map((rec: string, idx: number) => (
                                      <li key={idx}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Export Button */}
                              <div className="pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => {
                                    const userMessage = messages.find(m => m.id === (parseInt(message.id) - 1).toString())
                                    exportToPDF(message.analysis, userMessage)
                                  }}
                                  className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                  <Download className="w-4 h-4" />
                                  Export PDF Report
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          // Chat Response  
                          <>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="font-medium text-gray-900">CrackCheck AI</span>
                              {message.streaming && (
                                <div className="flex items-center gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                </div>
                              )}
                            </div>
                            
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ children }) => (
                                    <p className="text-gray-700 mb-3 last:mb-0">
                                      {children}
                                      {message.streaming && (
                                        <span className="inline-block w-2 h-5 bg-gray-400 animate-pulse ml-1"></span>
                                      )}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc list-outside space-y-1 text-gray-700 mb-3 pl-4">
                                      {children}
                                    </ul>
                                  ),
                                  li: ({ children }) => (
                                    <li className="text-gray-700 pl-1">{children}</li>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-900">{children}</strong>
                                  )
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            
                            {/* Display agent responses if available */}
                            {message.agentResponses && message.agentResponses.map((response: AgentResponse, idx: number) => (
                              <div key={`msg-agent-${idx}`} className="mt-6">
                                <AgentMessage agentResponse={response} />
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Agent Status Indicator */}
              {currentAgent && agentStatus !== 'idle' && (
                <div className="mb-6">
                  <AgentStatusIndicator
                    agentType={currentAgent}
                    status={agentStatus}
                    className="max-w-2xl"
                  />
                </div>
              )}
              
              {/* Agent Results */}
              {agentResponses.map((response, index) => (
                <div key={`agent-${index}`} className="mb-6">
                  <AgentMessage
                    agentResponse={response}
                    className="max-w-4xl"
                  />
                </div>
              ))}

              {isAnalyzing && !currentAgent && (
                <div className="flex justify-start mb-6">
                  <div className="max-w-2xl bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {currentProcessingMode === 'analysis' ? (
                          <Camera className="w-4 h-4 text-gray-700" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-gray-700" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {currentProcessingMode === 'analysis' ? 'Analyzing...' : 'Thinking...'}
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto w-full p-6">

            {/* File Upload Area */}
            {files.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-3 flex-wrap">
                  {files.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-900 shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modern Input Container */}
            <div className="relative">
              <div
                className={`bg-gray-50 border border-gray-200 rounded-3xl shadow-sm transition-all duration-200 ${
                  dragActive ? 'border-gray-400 bg-gray-100 shadow-md' : 'hover:shadow-md'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Plus button with dropdown menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowPlusMenu(!showPlusMenu)}
                      className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full cursor-pointer transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showPlusMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowPlusMenu(false)}
                        />
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px] z-20">
                          <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                            <Camera className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-700">Add photos of cracks</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                handleFileSelect(e)
                                setShowPlusMenu(false)
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Text Input */}
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Describe crack details, location, discovery time and structural concerns..."
                    className="flex-1 bg-transparent border-none outline-none resize-none placeholder-gray-500 text-gray-900 text-base leading-relaxed min-h-[24px] max-h-40"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit()
                      }
                    }}
                    style={{
                      height: 'auto',
                      minHeight: '24px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 160) + 'px'
                    }}
                  />
                  
                  {/* Send Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={(!inputValue.trim() && files.length === 0) || isAnalyzing}
                    className="flex-shrink-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}