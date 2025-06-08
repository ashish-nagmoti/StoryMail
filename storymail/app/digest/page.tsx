"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Mail, Calendar, TrendingUp, Clock, RefreshCw, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface DigestData {
  id: number
  start_date: string
  end_date: string
  digest_data: {
    narrative_summary: string
    category_counts: { [key: string]: number }
    highlights: string[]
    clusters: { [key: string]: string[] }
  }
  email_count: number
  pdf_base64?: string
}

export default function DigestPage() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [digestData, setDigestData] = useState<DigestData | null>(null)
  const { accessToken } = useAuth()
  const { toast } = useToast()
  
  // Format date range for display
  const dateRange = digestData ? {
    start: new Date(digestData.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    end: new Date(digestData.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } : {
    start: "",
    end: ""
  }
  
  // Calculate total email count from category counts
  const getTotalEmailCount = () => {
    if (!digestData || !digestData.digest_data.category_counts) return 0
    return Object.values(digestData.digest_data.category_counts).reduce((sum, count) => sum + count, 0)
  }
  
  // Generate new digest
  const generateDigest = async (sendEmail = false) => {
    try {
      setGenerating(true)
      
      // Get the ID token which is what the backend expects for authentication
      const idToken = localStorage.getItem('storymail-id-token')
      
      const response = await fetch(`${API_URL}/api/digest/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          send_email: sendEmail,
          include_pdf: true
        })
      })
      
      if (!response.ok) {
        throw new Error(`Error generating digest: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDigestData(data)
      
      toast({
        title: "Digest Generated Successfully",
        description: sendEmail ? "Digest has been sent to your email." : "Your weekly digest is ready to view.",
      })
      
    } catch (error) {
      console.error("Error generating digest:", error)
      toast({
        title: "Error Generating Digest",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }
  
  // Download PDF
  const handleDownloadPDF = () => {
    if (!digestData || !digestData.pdf_base64) {
      toast({
        title: "PDF Not Available",
        description: "Please generate a digest first.",
        variant: "destructive"
      })
      return
    }
    
    // Create a blob from base64 data
    const byteCharacters = atob(digestData.pdf_base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    
    // Create download link
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = `Email_Digest_${dateRange.start}_to_${dateRange.end}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Send digest via email
  const handleEmailDigest = () => {
    generateDigest(true)
  }
  
  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity":
        return "bg-blue-500/5 border-blue-500/20 text-blue-500"
      case "newsletters":
        return "bg-green-500/5 border-green-500/20 text-green-500"
      case "work":
        return "bg-purple-500/5 border-purple-500/20 text-purple-500"
      case "scam":
        return "bg-red-500/5 border-red-500/20 text-red-500"
      default:
        return "bg-gray-500/5 border-gray-500/20 text-gray-500"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <FileText className="mr-3 h-8 w-8" />
              Weekly Digest
            </h1>
            <p className="text-muted-foreground mt-2">Your personalized weekly email summary and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            {!generating && !digestData && (
              <Button onClick={() => generateDigest(false)} variant="default">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Digest
              </Button>
            )}
            
            {generating && (
              <Button disabled>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </Button>
            )}
            
            {digestData && (
              <>
                <Button onClick={handleEmailDigest} variant="outline" disabled={generating}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Digest
                </Button>
                <Button onClick={handleDownloadPDF} disabled={generating || !digestData.pdf_base64}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </>
            )}
          </div>
        </div>

        {!digestData && !generating && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Generate Your Weekly Digest</h3>
              <p className="text-center text-muted-foreground mb-6">
                Get a comprehensive summary of your emails from the past week,<br />
                complete with highlights, category breakdown, and actionable insights.
              </p>
              <Button onClick={() => generateDigest(false)}>
                Generate Digest
              </Button>
            </CardContent>
          </Card>
        )}

        {generating && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10">
              <RefreshCw className="h-16 w-16 text-primary animate-spin mb-4" />
              <h3 className="text-xl font-semibold mb-2">Generating Your Digest</h3>
              <p className="text-center text-muted-foreground">
                Our AI is analyzing your emails and creating your personalized digest.<br />
                This might take a minute...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Digest Preview */}
        {digestData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Weekly Email Digest</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Calendar className="mr-2 h-4 w-4" />
                  {dateRange.start} - {dateRange.end}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                Ready to Send
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-500">{getTotalEmailCount()}</div>
                <div className="text-sm text-muted-foreground">Total Emails</div>
              </div>
              
              {/* Category counts as stats */}
              {digestData.digest_data.category_counts && 
               Object.entries(digestData.digest_data.category_counts)
                .filter(([_, count]) => count > 0)
                .slice(0, 3)
                .map(([category, count], index) => {
                  let color = "text-green-500";
                  if (category === "scam") color = "text-red-500";
                  else if (category === "work" || category === "productivity") color = "text-purple-500";
                  
                  return (
                    <div key={category} className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className={`text-2xl font-bold ${color}`}>{count}</div>
                      <div className="text-sm text-muted-foreground">{category.charAt(0).toUpperCase() + category.slice(1)}</div>
                    </div>
                  );
                })
              }
            </div>
            
            {/* Narrative Summary */}
            <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-500/5 rounded-r-md">
              <p className="text-sm italic">
                {digestData.digest_data.narrative_summary}
              </p>
            </div>

            <Separator />

            {/* Key Highlights */}
            {digestData.digest_data.highlights && digestData.digest_data.highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Key Highlights
                </h3>
                <div className="space-y-3">
                  {digestData.digest_data.highlights.map((highlight, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">
                            {highlight}
                          </p>
                        </div>
                        <Badge variant={index === 0 ? "destructive" : "secondary"}>
                          {index === 0 ? "Important" : "Highlight"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Category Breakdown */}
            {digestData.digest_data.category_counts && Object.keys(digestData.digest_data.category_counts).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(digestData.digest_data.category_counts)
                    .filter(([_, count]) => count > 0)
                    .map(([category, count], index) => (
                      <div key={category} className={`flex items-center justify-between p-3 ${getCategoryColor(category)} rounded-lg border`}>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 bg-${category.toLowerCase() === "scam" ? "red" : category.toLowerCase() === "newsletters" ? "green" : category.toLowerCase() === "work" ? "purple" : "blue"}-500`}></div>
                          <span className="font-medium">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        </div>
                        <span className="text-sm font-medium">{count} emails</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            <Separator />

            {/* Email Clusters */}
            {digestData.digest_data.clusters && Object.keys(digestData.digest_data.clusters).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Email Clusters
                </h3>
                <div className="space-y-4">
                  {Object.entries(digestData.digest_data.clusters).map(([clusterName, items], index) => (
                    <div key={clusterName} className="border p-4 rounded-lg">
                      <h4 className="font-medium mb-2">{clusterName}</h4>
                      <div className="space-y-2">
                        {items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center p-2 bg-muted/30 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
