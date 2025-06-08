"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Mail, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function EmailDetailPage() {
  const params = useParams()
  const emailId = params.id
  const [email, setEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { accessToken } = useAuth()

  useEffect(() => {
    if (!emailId) return

    setLoading(true)
    
    // Get the ID token for authentication
    const idToken = localStorage.getItem('storymail-id-token')
    
    fetch(`${API_URL}/api/emails/${emailId}/`, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch email: ${res.status} ${res.statusText}`)
        }
        return res.json()
      })
      .then(data => {
        setEmail(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching email detail:', error)
        setLoading(false)
      })
  }, [emailId, accessToken])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading email...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!email) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold">Email not found</h2>
          <p className="text-muted-foreground mt-2">The email you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>

          <Badge variant="outline" className="text-xs">
            {email.category}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{email.subject}</CardTitle>
                <CardDescription className="mt-2">
                  {email.summary}
                </CardDescription>
              </div>
              <div className="text-sm text-muted-foreground text-right">
                {email.date ? new Date(email.date).toLocaleString() : ""}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {email.from_name
                    ? email.from_name.split(" ").map((n: string) => n[0]).join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="font-medium">{email.from_name || "Unknown"}</div>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Mail className="h-3 w-3 mr-1" /> 
                  {email.from_email}
                </div>
              </div>
            </div>

            <div className="rounded-md bg-muted p-4">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">
                  {email.text_body}
                </div>
              </div>
            </div>
            
            {email.html_body && (
              <div className="border rounded-md p-4 mt-4">
                <div className="text-sm font-medium mb-2">HTML Content</div>
                <div className="bg-background rounded p-2 overflow-auto max-h-[400px]">
                  <iframe 
                    srcDoc={email.html_body}
                    className="w-full h-[400px] border-0"
                    sandbox="allow-same-origin"
                    title="Email HTML content"
                  />
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Category:</span> {email.category}
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}