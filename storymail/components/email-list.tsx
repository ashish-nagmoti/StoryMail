"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Paperclip, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface EmailListProps {
  category: string
}

export function EmailList({ category }: EmailListProps) {
  const [emails, setEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { accessToken } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    setLoading(true)
    
    // Get the ID token which is what the backend expects for authentication
    const idToken = localStorage.getItem('storymail-id-token')
    
    console.log(`Fetching emails for category: ${category}`)
    
    fetch(`${API_URL}/api/emails/?category=${encodeURIComponent(category)}`, { 
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })
      .then(res => {
        if (!res.ok) {
          console.error('Failed to fetch emails:', res.status, res.statusText)
          return []
        }
        return res.json()
      })
      .then(data => {
        console.log('Received email data:', data)
        setEmails(data || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching emails:', error)
        setEmails([])
        setLoading(false)
      })
  }, [category, accessToken])

  const handleEmailClick = (emailId: number) => {
    router.push(`/email/${emailId}`)
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => (
        <Card 
          key={email.id} 
          className="email-card cursor-pointer hover:shadow-md transition-all" 
          onClick={() => handleEmailClick(email.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={email.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {email.from_name
                    ? email.from_name.split(" ").map((n: string) => n[0]).join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium`}>{email.from_name || email.from_email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Add icons if you want, e.g. starred/attachment */}
                    <span className="text-xs text-muted-foreground">
                      {email.date ? new Date(email.date).toLocaleString() : ""}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm mb-1 font-semibold">{email.subject}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{email.text_body || email.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {emails.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No emails found in this category.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
