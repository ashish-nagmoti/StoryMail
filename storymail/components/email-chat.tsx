"use client"

import { useState, FormEvent, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendIcon, Sparkles, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function EmailChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi there! I can help you find and summarize your emails. Try asking me something like "Summarize my newsletters" or "Show me important work emails from last week".',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { accessToken } = useAuth()
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (!input.trim() || loading) return
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)
    
    try {
      // Get the ID token for authentication
      const idToken = localStorage.getItem('storymail-id-token')
      
      // Call the API
      const response = await fetch(`${API_URL}/api/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ query: userMessage.content })
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Process the response text to convert email IDs to links
      const processedContent = processEmailIdsToLinks(data.response)
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: processedContent,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error("Chat API error:", error)
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I ran into an error while processing your request. Please try again later.",
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }
  
  // Function to convert Email IDs mentioned in text to clickable links
  // and properly format responses that include email subjects
  function processEmailIdsToLinks(text: string): string {
    // First clean up markdown symbols
    let cleanedText = text
      // Clean up markdown symbols but keep the text inside
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove ** bold markers
      .replace(/\*([^*]+)\*/g, '$1')     // Remove * italic markers
      .replace(/`([^`]+)`/g, '$1');      // Remove ` code markers
      
    // Handle the new format with email subjects and IDs
    cleanedText = cleanedText
      // Format subject + ID pattern: "Email Subject" (ID: 123)
      .replace(/"([^"]+)"\s*\(ID:\s*(\d+)\)/g, 
        '<span class="email-reference"><span class="email-subject">"$1"</span> ' +
        '<a href="/email/$2" class="text-blue-600 hover:underline">(ID: $2)</a></span>')
      
      // Fallback for any remaining plain Email ID mentions
      .replace(/Email ID:\s*(\d+)/g, 
        '<a href="/email/$1" class="text-blue-600 hover:underline">Email ID: $1</a>')
      
      // Add line breaks before key sections
      .replace(/(\s+Subject:)/g, '<br>$1')
      .replace(/(\s+Category:)/g, '<br>$1')
      .replace(/(\s+From:)/g, '<br>$1')
      .replace(/(\s+It discusses)/g, '<br>$1')
      
      // Replace bullets with line breaks + clean bullets
      .replace(/[•\*]\s+/g, '<br>• ')
      
      // Add space between paragraphs
      .replace(/<br>/g, '<br><br>');
    
    return cleanedText;
  }
  
  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          Email Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about your emails or request summaries
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto pb-0">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-3 max-w-[80%]">
                {message.role === 'assistant' && (
                  <Avatar>
                    <AvatarImage src="/placeholder-logo.png" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'assistant' ? (
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <p>{message.content}</p>
                  )}
                  
                  <div className={`text-xs mt-1 ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[80%]">
                <Avatar>
                  <AvatarImage src="/placeholder-logo.png" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                
                <div className="rounded-lg p-4 bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Invisible element for auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="pt-4">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Ask about your emails..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}